import type { PlayerEvaluation } from "./schema";

export const TL_GENERATE_PROMPT = (playerDescription?: string) => {
  const focus = playerDescription?.trim()
    ? `\n\nFOCUS PLAYER: ${playerDescription.trim()}\n\nYou must report ONLY moments where THIS specific player is involved (as the ball-handler, defender, screener, cutter, or rebounder). Identify him/her using the description above. If the focus player is not visible or not involved in a possession, skip it. Every moment in your output must clearly involve this player.`
    : "";

  return `You are watching basketball game film. Identify EVERY meaningful basketball moment in this clip and return them as a JSON array.${focus}

For each moment include:
- timestamp: "MM:SS" of when the action begins
- duration_seconds: number
- category: one of [perimeter_defense, screen_navigation, finishing, shot_creation, passing_iq, off_ball_movement, transition, rebounding, communication, other]
- description: a concrete, factual description of what physically happens — body position, footwork, contact, outcome. Avoid evaluative language.
- player_actions: bullet list of specific micro-actions

Focus on:
- Defensive possessions (closeouts, contests, gap help, ball pressure)
- Screen actions (over/under, drop coverage navigation, hedges)
- Finishing attempts (rim, floater, contact)
- Off-ball movement (cuts, relocates, screening)
- Transition opportunities (sprint speed, lane filling, decision pace)

Be specific. "He cuts" is bad. "Backdoor cut from weakside corner after defender turns head, finishes with right-hand layup" is good.

Output ONLY a JSON array of moments. No prose.`;
};

export const CLAUDE_EVAL_PROMPT = (timelineJson: string, position: string) => `You are an expert basketball scout writing a film evaluation for a high school / college prospect playing ${position}.

You have been given a tagged timeline of moments from a piece of game film. Use ONLY the evidence in this timeline. Do not invent moments.

Apply this rubric across six skill categories. Score each 1–10 with evidence_timestamps citing specific moments from the timeline:

1. perimeter_defense — closeout discipline, ball pressure, contests
2. screen_navigation — over/under, fight through, drop reads
3. finishing — rim touch, body control, contact tolerance
4. shot_creation — separation, change of pace, footwork into shot
5. passing_iq — read speed, advantage extension, processing
6. off_ball_movement — cutting, relocation, screening intent

For each category include:
- score (1–10)
- percentile_band (top_5 | top_10 | top_25 | average | below_avg)
- evidence_timestamps (array of "MM:SS" strings, must match the timeline)
- strengths (1–3 short prose bullets)
- concerns (1–3 short prose bullets)

Then produce:
- physical_observations (athleticism / lateral_quickness / motor scores 1–10, plus an estimated_height_band string and frame description)
- tactical_intelligence (decision_making_score, off_ball_awareness_score, communication_observed boolean, notes)
- tagged_moments — pull 6–10 of the most evaluatively important moments from the timeline. Re-frame each with a one-sentence evaluation and rating (positive/neutral/negative).
- recruiter_facing_descriptors — 3–6 short tag-style phrases ("Multi-positional defender", "High motor", etc.)
- scouting_summary — headline, strengths, areas_for_growth, projected_role, comparable_archetype, honest_limitations
- athlete_facing_breakdown — what_youre_doing_well, one_thing_to_focus_on_next, drill_recommendation

BE HONEST. If the clip doesn't show evidence of a skill, say so in honest_limitations and score it conservatively.

TIMELINE:
${timelineJson}

Return ONLY a single valid JSON object matching the PlayerEvaluation schema. No markdown fences, no commentary.`;

export const RECRUITER_SEARCH_PROMPT = (
  query: string,
  players: PlayerEvaluation[],
) => `You are a basketball recruiting analyst. A recruiter has issued the following natural-language query:

"${query}"

Match it against this set of evaluated players. For each plausible match (up to 5), return:
- player_id
- score (0–1, your confidence)
- reasoning (2–3 sentences citing SPECIFIC evidence — descriptors, scores, tagged moments — that justify the match)

Rank by score descending. Be discriminating: if no players strongly fit, return fewer matches with honest reasoning.

PLAYERS:
${JSON.stringify(players, null, 2)}

Return ONLY a single valid JSON object: { "matches": [...] }`;
