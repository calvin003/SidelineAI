import { NextRequest, NextResponse } from "next/server";
import { getIndexingStatus } from "@/lib/twelvelabs";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { taskId: string } },
) {
  try {
    const status = await getIndexingStatus(params.taskId);
    return NextResponse.json(status);
  } catch (e: any) {
    console.error("[API] status failed", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
