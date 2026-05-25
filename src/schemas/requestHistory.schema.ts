import { z } from 'zod';

export const requestHistoryStatusSchema = z.enum(['completed', 'rejected']);

export const requestHistoryQuerySchema = z.object({
  status: requestHistoryStatusSchema,
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  order: z.enum(['ASC', 'DESC']),
});

export type RequestHistoryQuery = z.infer<typeof requestHistoryQuerySchema>;

