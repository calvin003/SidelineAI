import { NextResponse } from "next/server";
import { getAllPlayers } from "@/lib/players";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const players = await getAllPlayers();
  return NextResponse.json({ players });
}
