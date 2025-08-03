import { z } from 'zod';
export const PostMatch = z.object({
  player1: z.uuid(),
  player2: z.uuid(),
  score1: z.number().int().nonnegative(),
  score2: z.number().int().nonnegative(),
});
export type PostMatchType = z.infer<typeof PostMatch>;