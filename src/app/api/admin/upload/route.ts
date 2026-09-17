import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-config";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_WIDTH = 1600;

async function assertAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const jar = await cookies();
    return jar.get(ADMIN_SESSION_COOKIE)?.value === "1";
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "admin";
}

export async function POST(request: Request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL, keys, and create a public `media` bucket.",
      },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "uploads").replace(
    /[^a-z0-9/_-]/gi,
    "",
  );

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5MB or smaller before optimization" },
      { status: 400 },
    );
  }

  const input = Buffer.from(await file.arrayBuffer());
  let optimized: Buffer;
  let width = 0;
  let height = 0;

  try {
    const pipeline = sharp(input).rotate().resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
    });
    const meta = await pipeline.metadata();
    optimized = await pipeline.webp({ quality: 80 }).toBuffer();
    const outMeta = await sharp(optimized).metadata();
    width = outMeta.width ?? meta.width ?? 0;
    height = outMeta.height ?? meta.height ?? 0;
  } catch {
    return NextResponse.json(
      { error: "Could not optimize this image. Try another file." },
      { status: 400 },
    );
  }

  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("media").upload(path, optimized, {
    contentType: "image/webp",
    upsert: false,
  });

  if (error) {
    return NextResponse.json(
      {
        error: `Upload failed: ${error.message}. Ensure the Storage bucket named "media" exists and is public.`,
      },
      { status: 500 },
    );
  }

  const { data: pub } = admin.storage.from("media").getPublicUrl(path);

  await admin.from("media_assets").insert({
    storage_path: path,
    alt: file.name,
    folder,
  });

  return NextResponse.json({
    path,
    url: pub.publicUrl,
    width,
    height,
  });
}
