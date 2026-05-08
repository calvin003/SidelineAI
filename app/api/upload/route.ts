import { NextRequest, NextResponse } from "next/server";
import { uploadVideo, uploadVideoFromUrl } from "@/lib/twelvelabs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";

    // Path A: JSON body { videoUrl, filename } — used in production where
    // the client already uploaded to Vercel Blob.
    if (ct.includes("application/json")) {
      const { videoUrl, filename } = await req.json();
      if (!videoUrl) {
        return NextResponse.json(
          { error: "videoUrl required" },
          { status: 400 },
        );
      }
      const { taskId } = await uploadVideoFromUrl(
        videoUrl,
        filename ?? "upload.mp4",
      );
      console.log(`[API] upload-by-url ok asset=${taskId}`);
      return NextResponse.json({ taskId });
    }

    // Path B: multipart form data — used in local dev.
    const form = await req.formData();
    const file = form.get("video");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing video file" }, { status: 400 });
    }
    if (!["video/mp4", "video/quicktime"].includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported type: ${file.type}` },
        { status: 400 },
      );
    }
    const { taskId } = await uploadVideo(file, file.name);
    console.log(`[API] upload-direct ok asset=${taskId}`);
    return NextResponse.json({ taskId });
  } catch (e: any) {
    console.error("[API] upload failed", e);
    return NextResponse.json({ error: e.message ?? "upload failed" }, { status: 500 });
  }
}
