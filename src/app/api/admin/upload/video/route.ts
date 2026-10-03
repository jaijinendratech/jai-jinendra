import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { assertAdminApiAccess } from "@/lib/admin-api-auth";

const ALLOWED_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_BYTES = 50 * 1024 * 1024;

function extensionFor(contentType: string): "mp4" | "webm" | null {
  if (contentType === "video/mp4") return "mp4";
  if (contentType === "video/webm") return "webm";
  return null;
}

export async function POST(request: Request) {
  if (!(await assertAdminApiAccess())) {
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

  let body: {
    folder?: unknown;
    fileName?: unknown;
    contentType?: unknown;
    size?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const contentType = String(body.contentType ?? "")
    .trim()
    .toLowerCase();
  const ext = extensionFor(contentType);
  if (!ALLOWED_TYPES.has(contentType) || !ext) {
    return NextResponse.json(
      { error: "Only MP4 and WebM videos are allowed" },
      { status: 400 },
    );
  }

  const size = Number(body.size);
  if (Number.isFinite(size) && size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Video must be 50MB or smaller" },
      { status: 400 },
    );
  }

  const folder = String(body.folder ?? "videos").replace(/[^a-z0-9/_-]/gi, "");
  const fileName = String(body.fileName ?? "video").trim() || "video";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("media")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      {
        error: `Could not create upload URL: ${error?.message ?? "unknown error"}. Ensure the Storage bucket named "media" exists, is public, and allows video/mp4 and video/webm.`,
      },
      { status: 500 },
    );
  }

  const { data: pub } = admin.storage.from("media").getPublicUrl(path);

  await admin.from("media_assets").insert({
    storage_path: path,
    alt: fileName,
    folder,
  });

  return NextResponse.json({
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: pub.publicUrl,
  });
}
