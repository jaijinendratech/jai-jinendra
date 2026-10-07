import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { assertAdminApiAccess } from "@/lib/admin-api-auth";

const MAX_BYTES = 50 * 1024 * 1024;
/** Extensions that are unsafe or meaningless to keep as a storage file extension. */
const UNSAFE_EXTENSIONS = new Set(["", "php", "exe", "sh", "js", "html"]);

/** Prefer the extension from the original filename; fall back to the MIME subtype. */
function extensionFor(contentType: string, fileName: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && !UNSAFE_EXTENSIONS.has(fromName)) return fromName;

  const subtype = contentType.split("/")[1]?.toLowerCase() ?? "";
  const fromMime = subtype.replace(/[^a-z0-9]/g, "");
  return fromMime || "mp4";
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
  const fileName = String(body.fileName ?? "video").trim() || "video";
  if (!contentType.startsWith("video/")) {
    return NextResponse.json(
      { error: "Only video files are allowed" },
      { status: 400 },
    );
  }
  const ext = extensionFor(contentType, fileName);

  const size = Number(body.size);
  if (Number.isFinite(size) && size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Video must be 50MB or smaller" },
      { status: 400 },
    );
  }

  const folder = String(body.folder ?? "videos").replace(/[^a-z0-9/_-]/gi, "");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("media")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      {
        error: `Could not create upload URL: ${error?.message ?? "unknown error"}. Ensure the Storage bucket named "media" exists and is public.`,
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
