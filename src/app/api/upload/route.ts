import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED   = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }
}
