import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { employeeSchema, hireEmployeeSchema, type EmployeeFormData } from '../../schemas/employee.schema';

type EmployeeFormProps = {
  submitLabel: string;
  onSubmit: (data: EmployeeFormData) => Promise<void> | void;
  onCancel: () => void;
  mode: 'add' | 'hire';
  sections?: Array<{ id: string; name: string; is_active: boolean; employees_count: number }>;
};

export default function EmployeeForm({ submitLabel, onSubmit, onCancel, mode, sections }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo(
    () => ({
      fullName: '',
      email: '',
      password: '',
      sectionId: '',
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(mode === 'hire' ? hireEmployeeSchema : employeeSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionOptions =
    sections?.map(s => ({
      value: s.id,
      label: `${s.name} • ${s.employees_count} موظف • ${s.is_active ? 'مفعّل' : 'معطّل'}`,
      disabled: !s.is_active,
    })) ?? [];

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Input
        label="الاسم الكامل"
        placeholder="مثال: أحمد محمد"
        {...register('fullName')}
        error={errors.fullName?.message}
      />
      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="example@domain.com"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="كلمة المرور"
        type="password"
        placeholder="******"
        {...register('password')}
        error={errors.password?.message}
      />

      {mode === 'hire' ? (
        <Select
          label="القسم"
          options={sectionOptions}
          placeholder="اختر القسم"
          {...register('sectionId')}
          error={errors.sectionId?.message}
        />
      ) : null}

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
