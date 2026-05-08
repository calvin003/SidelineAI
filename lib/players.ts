import fs from "fs";
import path from "path";
import { PlayerEvaluationSchema, type PlayerEvaluation } from "./schema";

const DATA_FILE = path.join(process.cwd(), "data", "players.json");

function readFile(): PlayerEvaluation[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed
      .map((p: unknown) => {
        const r = PlayerEvaluationSchema.safeParse(p);
        return r.success ? r.data : null;
      })
      .filter((p: PlayerEvaluation | null): p is PlayerEvaluation => p !== null);
  } catch (e) {
    console.warn("[players] failed to load:", e);
    return [];
  }
}

function writeFile(players: PlayerEvaluation[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2), "utf-8");
}

export function getAllPlayers(): PlayerEvaluation[] {
  return readFile();
}

export function getPlayerById(id: string): PlayerEvaluation | undefined {
  return readFile().find((p) => p.player_id === id);
}

export function addPlayer(player: PlayerEvaluation): void {
  const players = readFile();
  players.push(player);
  writeFile(players);
  console.log(`[players] persisted ${player.player_id}, total=${players.length}`);
}
