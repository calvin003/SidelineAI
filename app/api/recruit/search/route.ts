import { NextRequest, NextResponse } from "next/server";
import { getAllPlayers } from "@/lib/players";
import { searchPlayers } from "@/lib/claude";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }
    const players = getAllPlayers();
    const result = await searchPlayers(query, players);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[API] search failed", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
