import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AuthFormData = z.infer<typeof authSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).superRefine((data, ctx) => {
  if (data.newPassword !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'كلمتا المرور غير متطابقتين',
      path: ['confirmPassword'],
    });
  }
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
