import { z } from "zod";

export const PositionSchema = z.enum([
  "PG",
  "SG",
  "SF",
  "PF",
  "C",
  "wing",
  "guard",
  "forward",
]);

export const PercentileSchema = z.enum([
  "top_5",
  "top_10",
  "top_25",
  "average",
  "below_avg",
]);

export const SkillSchema = z.object({
  score: z.number().min(1).max(10),
  percentile_band: PercentileSchema,
  evidence_timestamps: z.array(z.string()),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
});

export const SkillCategoriesSchema = z.object({
  perimeter_defense: SkillSchema,
  screen_navigation: SkillSchema,
  finishing: SkillSchema,
  shot_creation: SkillSchema,
  passing_iq: SkillSchema,
  off_ball_movement: SkillSchema,
});

export const TaggedMomentSchema = z.object({
  timestamp: z.string(),
  duration_seconds: z.number(),
  category: z.string(),
  factual_description: z.string(),
  evaluation: z.string(),
  rating: z.enum(["positive", "neutral", "negative"]),
  skill_tags: z.array(z.string()),
});

export const PlayerEvaluationSchema = z.object({
  player_id: z.string().optional(),
  display_name: z.string().optional(),
  video_url: z.string().optional(),
  school: z.string().optional(),
  stars: z.number().min(1).max(5).optional(),
  created_at: z.string().optional(),
  clip_metadata: z.object({
    duration_seconds: z.number(),
    sport: z.literal("basketball"),
    position: PositionSchema,
  }),
  physical_observations: z.object({
    estimated_height_band: z.string(),
    frame: z.string(),
    athleticism_score: z.number().min(1).max(10),
    lateral_quickness_score: z.number().min(1).max(10),
    motor_score: z.number().min(1).max(10),
    notes: z.string(),
  }),
  skill_evaluation: SkillCategoriesSchema,
  tactical_intelligence: z.object({
    decision_making_score: z.number().min(1).max(10),
    off_ball_awareness_score: z.number().min(1).max(10),
    communication_observed: z.boolean(),
    notes: z.string(),
  }),
  tagged_moments: z.array(TaggedMomentSchema),
  recruiter_facing_descriptors: z.array(z.string()),
  scouting_summary: z.object({
    headline: z.string(),
    strengths: z.array(z.string()),
    areas_for_growth: z.array(z.string()),
    projected_role: z.string(),
    comparable_archetype: z.string(),
    honest_limitations: z.string(),
  }),
  athlete_facing_breakdown: z.object({
    what_youre_doing_well: z.array(z.string()),
    one_thing_to_focus_on_next: z.string(),
    drill_recommendation: z.string(),
  }),
});

export type PlayerEvaluation = z.infer<typeof PlayerEvaluationSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type SkillKey = keyof PlayerEvaluation["skill_evaluation"];

export const SKILL_LABELS: Record<SkillKey, string> = {
  perimeter_defense: "Perimeter Defense",
  screen_navigation: "Screen Navigation",
  finishing: "Finishing",
  shot_creation: "Shot Creation",
  passing_iq: "Passing IQ",
  off_ball_movement: "Off-Ball Movement",
};
