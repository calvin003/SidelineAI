import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["video/mp4", "video/quicktime"],
        maximumSizeInBytes: 500 * 1024 * 1024,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log(`[BLOB] uploaded ${blob.url} (${blob.pathname})`);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (e: any) {
    console.error("[API] upload-token failed", e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
