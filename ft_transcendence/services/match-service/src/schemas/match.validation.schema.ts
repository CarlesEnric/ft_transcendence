import { z } from 'zod';

export const PostMatch = z.object({
  player1: z.coerce.number().int().positive(),
  player2: z.coerce.number().int().positive(),
  score1: z.coerce.number().int().min(0),
  score2: z.coerce.number().int().min(0),
  tournamentId: z.coerce.number().int().positive().optional(),
});

export type PostMatchType = z.infer<typeof PostMatch>;