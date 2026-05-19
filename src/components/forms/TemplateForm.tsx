import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { templateSchema, type TemplateFormData } from '../../schemas/template.schema';
import type { SectionListItem } from '../../types/section.types';

type TemplateFormProps = {
  sections: SectionListItem[];
  submitLabel: string;
  onSubmit: (data: TemplateFormData) => Promise<void> | void;
  onCancel: () => void;
};

export default function TemplateForm({
  sections,
  submitLabel,
  onSubmit,
  onCancel,
}: TemplateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const activeSections = useMemo(() => sections.filter(section => section.is_active), [sections]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      steps: [],
    },
  });

  const steps = watch('steps');

  const addStep = () => {
    if (!selectedSectionId) return;
    setValue('steps', [...steps, selectedSectionId], { shouldValidate: true });
    setSelectedSectionId('');
  };

  const removeStep = (index: number) => {
    setValue(
      'steps',
      steps.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= steps.length) return;
    const updated = [...steps];
    [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];
    setValue('steps', updated, { shouldValidate: true });
  };

  const submit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionOptions = activeSections.map(section => ({
    value: section.id,
    label: `${section.name} • ${section.employees_count} موظف`,
  }));

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Input
        label="اسم القالب"
        placeholder="مثال: معاملة تسجيل"
        {...register('name')}
        error={errors.name?.message}
      />

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          وصف القالب
        </label>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="وصف مختصر عن الهدف من القالب"
          {...register('description')}
        />
        {errors.description?.message ? (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-4">
        <div className="mb-3 text-sm font-semibold">خطوات المعاملة</div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <Select
              label="إضافة قسم إلى التسلسل"
              options={sectionOptions}
              placeholder="اختر القسم"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2.5 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
          >
            <Plus size={16} />
            إضافة خطوة
          </button>
        </div>

        {errors.steps?.message ? (
          <p className="mt-2 text-sm text-red-500">{errors.steps.message}</p>
        ) : null}

        <div className="mt-4 space-y-2">
          {steps.length ? (
            steps.map((stepSectionId, index) => {
              const section = sections.find(item => item.id === stepSectionId);
              return (
                <div
                  key={`${stepSectionId}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-3"
                >
                  <div className="font-semibold">
                    {index + 1}. {section?.name ?? stepSectionId}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveStep(index, -1)}
                      className="rounded-xl border border-[var(--color-outine)] p-2 hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
                      disabled={index === 0}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(index, 1)}
                      className="rounded-xl border border-[var(--color-outine)] p-2 hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
                      disabled={index === steps.length - 1}
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="rounded-xl bg-[var(--color-danger)] p-2 text-[var(--color-text-button)] hover:bg-[var(--color-danger-hover)] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-[var(--color-sub-text)]">
              لم يتم إضافة أي خطوات بعد.
            </div>
          )}
        </div>
      </div>

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
