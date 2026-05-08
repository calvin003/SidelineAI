import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { generateEvaluation } from "@/lib/twelvelabs";
import { evaluateFromTimeline } from "@/lib/claude";
import { TL_GENERATE_PROMPT } from "@/lib/prompts";
import { addPlayer } from "@/lib/players";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { videoId, position, displayName, playerDescription } =
      await req.json();
    if (!videoId) {
      return NextResponse.json({ error: "videoId required" }, { status: 400 });
    }

    console.log(
      `[API] evaluate video=${videoId} focus=${playerDescription || "—"}`,
    );
    const timeline = await generateEvaluation(
      videoId,
      TL_GENERATE_PROMPT(playerDescription),
    );
    const evaluation = await evaluateFromTimeline(timeline, position ?? "wing");

    evaluation.player_id = randomUUID();
    evaluation.created_at = new Date().toISOString();
    if (displayName) evaluation.display_name = displayName;

    await addPlayer(evaluation);
    console.log(`[API] evaluate ok player=${evaluation.player_id}`);
    return NextResponse.json(evaluation);
  } catch (e: any) {
    console.error("[API] evaluate failed", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
