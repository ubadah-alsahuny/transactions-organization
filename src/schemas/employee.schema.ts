import { z } from 'zod';

export const employeeSchema = z.object({
  fullName: z.string().min(1, 'الاسم الكامل مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح').min(1, 'البريد الإلكتروني مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  sectionId: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export const hireEmployeeSchema = employeeSchema.extend({
  sectionId: z.string().min(1, 'القسم مطلوب'),
});

export type HireEmployeeFormData = z.infer<typeof hireEmployeeSchema>;

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const profileUpdateSchema = z
  .object({
    email: z.preprocess(
      emptyToUndefined,
      z.string().trim().email('البريد الإلكتروني غير صالح').optional()
    ),
    fullName: z.preprocess(emptyToUndefined, z.string().trim().min(1, 'الاسم الكامل مطلوب').optional()),
  })
  .refine(value => Boolean(value.email || value.fullName), {
    message: 'يجب إدخال قيمة واحدة على الأقل',
    path: ['email'],
  });

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
