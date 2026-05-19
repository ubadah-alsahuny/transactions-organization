import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(1, 'اسم القالب مطلوب'),
  description: z.string().min(1, 'وصف القالب مطلوب'),
  steps: z.array(z.string().min(1)).min(1, 'يجب إضافة خطوة واحدة على الأقل'),
});

export type TemplateFormData = z.infer<typeof templateSchema>;
