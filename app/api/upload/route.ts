import { NextRequest, NextResponse } from "next/server";
import { uploadVideo } from "@/lib/twelvelabs";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("video");
    const position = form.get("position");

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
    console.log(`[API] upload ok asset=${taskId} pos=${position}`);
    return NextResponse.json({ taskId });
  } catch (e: any) {
    console.error("[API] upload failed", e);
    return NextResponse.json({ error: e.message ?? "upload failed" }, { status: 500 });
  }
}
