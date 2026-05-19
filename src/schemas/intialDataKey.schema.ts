import { z } from 'zod';

export const intialKeyTypeSchema = z.enum(['string', 'number', 'boolean', 'date', 'email', 'phone']);

export const intialDataKeySchema = z.object({
  keyName: z.string().min(1, 'اسم الحقل مطلوب'),
  keyType: intialKeyTypeSchema,
  isRequired: z.boolean(),
});

export type IntialDataKeyFormData = z.infer<typeof intialDataKeySchema>;

export const bulkIntialDataKeysSchema = z.object({
  items: z.array(intialDataKeySchema).min(1, 'يجب إضافة مفتاح واحد على الأقل'),
});

export type BulkIntialDataKeysFormData = z.infer<typeof bulkIntialDataKeysSchema>;
