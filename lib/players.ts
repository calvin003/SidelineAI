import fs from "fs";
import path from "path";
import { sql } from "@vercel/postgres";
import { PlayerEvaluationSchema, type PlayerEvaluation } from "./schema";

const SEED_FILE = path.join(process.cwd(), "data", "players.json");

let initPromise: Promise<void> | null = null;

function readSeeds(): PlayerEvaluation[] {
  try {
    const raw = fs.readFileSync(SEED_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed
      .map((p: unknown) => {
        const r = PlayerEvaluationSchema.safeParse(p);
        return r.success ? r.data : null;
      })
      .filter((p: PlayerEvaluation | null): p is PlayerEvaluation => p !== null);
  } catch (e) {
    console.warn("[players] failed to load seeds:", e);
    return [];
  }
}

async function init(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!process.env.POSTGRES_URL && !process.env.POSTGRES_PRISMA_URL) {
      throw new Error(
        "POSTGRES_URL is not set. Run `vercel env pull .env.local` for local dev.",
      );
    }
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        player_id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    const { rows } = await sql`SELECT COUNT(*)::int AS count FROM players`;
    const existing = rows[0]?.count ?? 0;
    if (existing === 0) {
      const seeds = readSeeds();
      for (const p of seeds) {
        await sql`
          INSERT INTO players (player_id, data)
          VALUES (${p.player_id ?? ""}, ${JSON.stringify(p)}::jsonb)
          ON CONFLICT (player_id) DO NOTHING
        `;
      }
      console.log(`[players] seeded ${seeds.length} players into Postgres`);
    }
  })();
  return initPromise;
}

export async function getAllPlayers(): Promise<PlayerEvaluation[]> {
  await init();
  const { rows } = await sql`SELECT data FROM players ORDER BY created_at ASC`;
  return rows
    .map((r) => {
      const parsed = PlayerEvaluationSchema.safeParse(r.data);
      return parsed.success ? parsed.data : null;
    })
    .filter((p): p is PlayerEvaluation => p !== null);
}

export async function getPlayerById(
  id: string,
): Promise<PlayerEvaluation | undefined> {
  await init();
  const { rows } = await sql`
    SELECT data FROM players WHERE player_id = ${id} LIMIT 1
  `;
  if (rows.length === 0) return undefined;
  const parsed = PlayerEvaluationSchema.safeParse(rows[0].data);
  return parsed.success ? parsed.data : undefined;
}

export async function addPlayer(player: PlayerEvaluation): Promise<void> {
  await init();
  await sql`
    INSERT INTO players (player_id, data)
    VALUES (${player.player_id ?? ""}, ${JSON.stringify(player)}::jsonb)
    ON CONFLICT (player_id) DO UPDATE SET data = EXCLUDED.data
  `;
  console.log(`[players] persisted to Postgres ${player.player_id}`);
}
