import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { profileUpdateSchema, type ProfileUpdateFormData } from '../../schemas/employee.schema';

type ProfileUpdateFormProps = {
  initialEmail?: string;
  initialFullName?: string;
  onCancel: () => void;
  onSubmit: (data: ProfileUpdateFormData) => Promise<void> | void;
};

export default function ProfileUpdateForm({
  initialEmail,
  initialFullName,
  onCancel,
  onSubmit,
}: ProfileUpdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema) as any,
    defaultValues: {
      email: initialEmail ?? '',
      fullName: initialFullName ?? '',
    },
  });

  const submit = async (data: ProfileUpdateFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="name@example.com"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="الاسم الكامل"
        type="text"
        placeholder="الاسم الكامل"
        {...register('fullName')}
        error={errors.fullName?.message}
      />

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-5 py-2.5 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
          disabled={isSubmitting}
        >
          إلغاء
        </button>
        <Button type="submit" isLoading={isSubmitting}>
          حفظ
        </Button>
      </div>
    </form>
  );
}
