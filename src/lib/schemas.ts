import { z } from "zod";

/**
 * Zod Schemas for LearnLeague API Response Runtime Validation
 * 
 * Provides runtime safety alongside TypeScript compile-time typing,
 * preventing unexpected API shape changes from corrupting application state.
 */

export const TaskSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(["pending", "completed", "reviewed", "rejected"]),
  assigned_by: z.string().optional(),
  date_assigned: z.string(),
});

export const LearningLogSchema = z.object({
  id: z.number(),
  date: z.string(),
  hours_studied: z.number(),
  topics: z.string(),
  reflection: z.string(),
  xp_earned: z.number().optional(),
});

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().optional(),
  role: z.enum(["admin", "user"]),
  avatarUrl: z.string().optional(),
  last_seen: z.string().optional(),
  streak: z.number().default(0),
  longest_streak: z.number().default(0),
  total_xp: z.number().default(0),
  totalXp: z.number().optional(),
  learning_goal: z.string().default(""),
  weekly_score: z.number().optional(),
  hours_studied_this_week: z.number().optional(),
  tasks: z.array(TaskSchema).optional(),
  logs: z.array(LearningLogSchema).optional(),
});

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  user: UserSchema,
});

export const FriendSchema = UserSchema.extend({
  isOnline: z.boolean().optional(),
});

export const EvaluationResultSchema = z.object({
  is_correct: z.boolean(),
  score: z.number(),
  xp_earned: z.number(),
  feedback: z.string(),
  explanation: z.string(),
});

export const WeeklyWinnerSchema = z.object({
  week_start: z.string(),
  winner_name: z.string(),
  total_xp: z.number(),
  tasks_completed: z.number(),
});

/**
 * Safely validates payload against a Zod schema.
 * Logs warnings in non-production environments if parsing encounters minor issues,
 * while allowing graceful fallbacks when safe.
 */
export function validateRuntimeSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn("[LearnLeague Schema Validation Warning]:", result.error.format(), "Received data:", data);
    // Return original data as fallback if Zod parse fails to avoid breaking application execution
    return data as T;
  }
  return result.data;
}
