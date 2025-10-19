import { z } from 'zod';

export const PostTournament = z.object({
  name: z.string().min(3).max(64),
  size: z.union([z.literal(4), z.literal(8)]).default(4),
});

export const JoinTournament = z.object({
  userId: z.number().int().positive().optional(),
});

export type PostTournamentType = z.infer<typeof PostTournament>;
export type JoinTournamentType = z.infer<typeof JoinTournament>;