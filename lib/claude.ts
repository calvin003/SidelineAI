import Anthropic from "@anthropic-ai/sdk";
import zodToJsonSchema from "zod-to-json-schema";
import { PlayerEvaluationSchema, type PlayerEvaluation } from "./schema";
import { CLAUDE_EVAL_PROMPT, RECRUITER_SEARCH_PROMPT } from "./prompts";

const apiKey = process.env.ANTHROPIC_API_KEY;
export const claudeClient = apiKey ? new Anthropic({ apiKey }) : null;

const MODEL = "claude-sonnet-4-6";

function ensure() {
  if (!claudeClient) throw new Error("ANTHROPIC_API_KEY not set.");
  return claudeClient;
}

const EVAL_TOOL_SCHEMA = zodToJsonSchema(PlayerEvaluationSchema, {
  $refStrategy: "none",
}) as Anthropic.Tool["input_schema"];

const SEARCH_TOOL_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          player_id: { type: "string" },
          score: { type: "number", minimum: 0, maximum: 1 },
          reasoning: { type: "string" },
        },
        required: ["player_id", "score", "reasoning"],
      },
    },
  },
  required: ["matches"],
} as Anthropic.Tool["input_schema"];

export async function evaluateFromTimeline(
  timelineJson: string,
  position: string,
): Promise<PlayerEvaluation> {
  const client = ensure();
  const prompt = CLAUDE_EVAL_PROMPT(timelineJson, position);

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    temperature: 0.4,
    tools: [
      {
        name: "submit_evaluation",
        description:
          "Submit the structured basketball scouting evaluation. ALL fields except player_id, display_name, and created_at are required and must be populated from the timeline evidence.",
        input_schema: EVAL_TOOL_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "submit_evaluation" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = res.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use block");
  }
  return PlayerEvaluationSchema.parse(toolUse.input);
}

export async function searchPlayers(
  query: string,
  players: PlayerEvaluation[],
): Promise<{
  matches: { player_id: string; score: number; reasoning: string }[];
}> {
  const client = ensure();
  const prompt = RECRUITER_SEARCH_PROMPT(query, players);
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    temperature: 0.3,
    system:
      "You are a basketball recruiting analyst. The player_id field in your response MUST exactly match a player_id from the input set — do not invent or modify them. Cite specific evidence from descriptors, scores, and tagged_moments in your reasoning.",
    tools: [
      {
        name: "submit_matches",
        description:
          "Submit ranked player matches for the recruiter query. Return up to 5 matches sorted by score descending. Use exact player_id strings from the input.",
        input_schema: SEARCH_TOOL_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "submit_matches" },
    messages: [{ role: "user", content: prompt }],
  });
  const toolUse = res.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return { matches: [] };
  }
  return toolUse.input as {
    matches: { player_id: string; score: number; reasoning: string }[];
  };
}
