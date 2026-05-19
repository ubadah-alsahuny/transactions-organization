import { z } from 'zod';

export const runningRequestsQuerySchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  order: z.enum(['ASC', 'DESC']),
});

export type RunningRequestsQuery = z.infer<typeof runningRequestsQuerySchema>;
