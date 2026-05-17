import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../common/Input';
import { sectionSchema, type SectionFormData } from '../../schemas/section.schema';

type SectionFormProps = {
  initialValues?: Partial<SectionFormData>;
  submitLabel: string;
  onSubmit: (data: SectionFormData) => Promise<void> | void;
  onCancel: () => void;
};

export default function SectionForm({ initialValues, submitLabel, onSubmit, onCancel }: SectionFormProps) {
  const defaultValues = useMemo(
    () => ({
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
    }),
    [initialValues?.description, initialValues?.name]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submit = async (data: SectionFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Input label="اسم القسم" placeholder="مثال: قسم المعاملات" {...register('name')} error={errors.name?.message} />
      <Input
        label="وصف القسم"
        placeholder="وصف مختصر عن القسم"
        {...register('description')}
        error={errors.description?.message}
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
        <button
          type="submit"
          className="rounded-2xl bg-[var(--color-action)] px-5 py-2.5 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] disabled:opacity-50 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جارٍ الحفظ...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
