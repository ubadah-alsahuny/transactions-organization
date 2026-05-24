import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Toast } from '../common/Toast';
import { sectionsService } from '../../services/sections.service';
import { templateSchema, type TemplateFormData } from '../../schemas/template.schema';
import type { InstitutionListItem } from '../../types/institution.types';
import type { SectionListItem } from '../../types/section.types';

type TemplateFormProps = {
  defaultInstitutionSections: SectionListItem[];
  institutions: InstitutionListItem[];
  ownInstitutionId: string;
  submitLabel: string;
  onSubmit: (data: TemplateFormData) => Promise<void> | void;
  onCancel: () => void;
};

type StepMeta = {
  sectionId: string;
  sectionName: string;
  institutionId: string;
  institutionName: string;
};

export default function TemplateForm({
  defaultInstitutionSections,
  institutions,
  ownInstitutionId,
  submitLabel,
  onSubmit,
  onCancel,
}: TemplateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(ownInstitutionId);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [availableSections, setAvailableSections] = useState<SectionListItem[]>([]);
  const [isSectionsLoading, setIsSectionsLoading] = useState(false);
  const [stepsMeta, setStepsMeta] = useState<StepMeta[]>([]);

  const activeDefaultSections = useMemo(
    () => defaultInstitutionSections.filter(section => section.is_active),
    [defaultInstitutionSections]
  );

  useEffect(() => {
    setAvailableSections(activeDefaultSections);
  }, [activeDefaultSections]);

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

  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedInstitutionId) return;
      setIsSectionsLoading(true);
      try {
        const response = await sectionsService.listManagerSections({
          include_inactive: false,
          institution_id: selectedInstitutionId,
        });
        if (response.success && response.data) {
          setAvailableSections(response.data.filter(section => section.is_active));
        } else {
          Toast.error(response.error ?? 'فشل في جلب أقسام المؤسسة');
        }
      } catch (error: any) {
        Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب أقسام المؤسسة');
      } finally {
        setIsSectionsLoading(false);
      }
    };

    if (selectedInstitutionId === ownInstitutionId) {
      setAvailableSections(activeDefaultSections);
      return;
    }

    fetchSections();
  }, [activeDefaultSections, ownInstitutionId, selectedInstitutionId]);

  const addStep = () => {
    if (!selectedSectionId) return;
    const section = availableSections.find(item => item.id === selectedSectionId);
    const institution = institutions.find(item => item.id === selectedInstitutionId);
    if (!section || !institution) return;

    setStepsMeta(prev => [
      ...prev,
      {
        sectionId: section.id,
        sectionName: section.name,
        institutionId: institution.id,
        institutionName: institution.name,
      },
    ]);
    setValue('steps', [...steps, selectedSectionId], { shouldValidate: true });
    setSelectedSectionId('');
    setRuleError(null);
  };

  const removeStep = (index: number) => {
    setStepsMeta(prev => prev.filter((_, i) => i !== index));
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

    const metaUpdated = [...stepsMeta];
    [metaUpdated[index], metaUpdated[nextIndex]] = [metaUpdated[nextIndex], metaUpdated[index]];
    setStepsMeta(metaUpdated);
  };

  const submit = async (data: TemplateFormData) => {
    if (stepsMeta.length && stepsMeta[0].institutionId !== ownInstitutionId) {
      setRuleError('يجب أن تكون الخطوة الأولى من مؤسستك');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const institutionsOptions = institutions.map(item => ({
    value: item.id,
    label: `${item.name} • ${item.sectionsCount} قسم`,
    disabled: item.status !== 'active',
  }));

  const sectionOptions = availableSections.map(section => ({
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
        <label className="mb-1 block text-sm font-semibold text-[var(--color-text)]">
          وصف القالب
        </label>
        <textarea
          rows={4}
          className="w-full rounded-2xl border border-[var(--color-outine)] bg-[var(--color-primary)] px-4 py-2 text-[var(--color-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-action)]"
          placeholder="وصف مختصر عن الهدف من القالب"
          {...register('description')}
        />
        {errors.description?.message ? (
          <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-4">
        <div className="mb-3 text-sm font-semibold">خطوات المعاملة</div>
        <div className="mb-3 text-sm text-[var(--color-sub-text)]">
          يجب أن تكون الخطوة الأولى من مؤسستك.
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <Select
              label="المؤسسة"
              options={institutionsOptions}
              placeholder="اختر المؤسسة"
              value={selectedInstitutionId}
              onChange={(e) => {
                setSelectedInstitutionId(e.target.value);
                setSelectedSectionId('');
              }}
            />
          </div>
          <div className="min-w-[16rem] flex-1">
            <Select
              label="إضافة قسم إلى التسلسل"
              options={sectionOptions}
              placeholder={isSectionsLoading ? 'جارٍ تحميل الأقسام...' : 'اختر القسم'}
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2.5 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] disabled:opacity-50 transition-colors"
            disabled={isSectionsLoading}
          >
            <Plus size={16} />
            إضافة خطوة
          </button>
        </div>

        {errors.steps?.message ? (
          <p className="mt-2 text-sm text-red-500">{errors.steps.message}</p>
        ) : null}
        {ruleError ? <p className="mt-2 text-sm text-red-500">{ruleError}</p> : null}

        <div className="mt-4 space-y-2">
          {stepsMeta.length ? (
            stepsMeta.map((step, index) => (
              <div
                key={`${step.sectionId}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-3"
              >
                <div className="font-semibold">
                  {index + 1}. {step.sectionName}{' '}
                  <span className="text-sm text-[var(--color-sub-text)]">({step.institutionName})</span>
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
                    disabled={index === stepsMeta.length - 1}
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
            ))
          ) : (
            <div className="text-sm text-[var(--color-sub-text)]">لم يتم إضافة أي خطوات بعد.</div>
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
