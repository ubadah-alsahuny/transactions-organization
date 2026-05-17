import { z } from 'zod';

export const sectionSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  description: z.string().min(1, 'الوصف مطلوب'),
});

export type SectionFormData = z.infer<typeof sectionSchema>;
