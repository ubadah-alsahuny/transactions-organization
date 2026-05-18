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
