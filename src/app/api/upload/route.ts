import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED   = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    console.warn("[upload] unauthenticated request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blobToken =
    process.env.CSZERO_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error("[upload] CSZERO_READ_WRITE_TOKEN is not set");
    return NextResponse.json(
      { error: "Server is missing CSZERO_READ_WRITE_TOKEN" },
      { status: 500 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
      token: blobToken,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ALLOWED,
        maximumSizeInBytes:  MAX_BYTES,
        addRandomSuffix:     true,
        tokenPayload:        JSON.stringify({ email: session.user!.email, pathname }),
      }),
      // Required by the SDK; we persist the URL via the registration POST body
      // rather than reacting to the callback so the client can show a preview
      // before the form is submitted.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[upload] handleUpload failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }
}
