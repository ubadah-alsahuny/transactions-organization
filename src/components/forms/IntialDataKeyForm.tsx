import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import {
  bulkIntialDataKeysSchema,
  intialDataKeySchema,
  type BulkIntialDataKeysFormData,
  type IntialDataKeyFormData,
} from '../../schemas/intialDataKey.schema';

const keyTypeOptions = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'date', label: 'date' },
  { value: 'email', label: 'email' },
  { value: 'phone', label: 'phone' },
];

type SingleKeyFormProps = {
  mode: 'single';
  initialValues?: Partial<IntialDataKeyFormData>;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (data: IntialDataKeyFormData) => Promise<void> | void;
};

type BulkKeyFormProps = {
  mode: 'bulk';
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (data: BulkIntialDataKeysFormData) => Promise<void> | void;
};

type IntialDataKeyFormProps = SingleKeyFormProps | BulkKeyFormProps;

export default function IntialDataKeyForm(props: IntialDataKeyFormProps) {
  if (props.mode === 'bulk') return <BulkKeysForm {...props} />;
  return <SingleKeyForm {...props} />;
}

function SingleKeyForm({ initialValues, submitLabel, onCancel, onSubmit }: SingleKeyFormProps) {
  const defaultValues = useMemo(
    () => ({
      keyName: initialValues?.keyName ?? '',
      keyType: (initialValues?.keyType as any) ?? 'string',
      isRequired: initialValues?.isRequired ?? true,
    }),
    [initialValues?.isRequired, initialValues?.keyName, initialValues?.keyType]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IntialDataKeyFormData>({
    resolver: zodResolver(intialDataKeySchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isRequired = watch('isRequired');

  const submit = async (data: IntialDataKeyFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Input
        label="اسم المفتاح"
        placeholder="مثال: الرقم الوطني"
        {...register('keyName')}
        error={errors.keyName?.message}
      />

      <Select
        label="نوع المفتاح"
        options={keyTypeOptions}
        value={watch('keyType') as any}
        onChange={(e) => setValue('keyType', e.target.value as any, { shouldValidate: true })}
        error={errors.keyType?.message}
      />

      <label className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={!!isRequired}
          onChange={(e) => setValue('isRequired', e.target.checked, { shouldValidate: true })}
          className="h-4 w-4 rounded border-[var(--color-outine)]"
        />
        مطلوب
      </label>

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

function BulkKeysForm({ submitLabel, onCancel, onSubmit }: BulkKeyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BulkIntialDataKeysFormData>({
    resolver: zodResolver(bulkIntialDataKeysSchema),
    defaultValues: {
      items: [
        { keyName: '', keyType: 'string', isRequired: true },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: 'items' });

  const submit = async (data: BulkIntialDataKeysFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="space-y-3">
        {fields.map((field, index) => {
          const itemErrors = errors.items?.[index];
          const isRequired = watch(`items.${index}.isRequired`);
          const keyType = watch(`items.${index}.keyType`);

          return (
            <div
              key={field.id}
              className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold">مفتاح #{index + 1}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    className="rounded-xl border border-[var(--color-outine)] p-2 hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors disabled:opacity-50"
                    disabled={index === 0}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    className="rounded-xl border border-[var(--color-outine)] p-2 hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors disabled:opacity-50"
                    disabled={index === fields.length - 1}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-xl bg-[var(--color-danger)] p-2 text-[var(--color-text-button)] hover:bg-[var(--color-danger-hover)] transition-colors disabled:opacity-50"
                    disabled={fields.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <Input
                label="اسم المفتاح"
                placeholder="مثال: الرقم الوطني"
                {...register(`items.${index}.keyName` as const)}
                error={itemErrors?.keyName?.message}
              />

              <Select
                label="نوع المفتاح"
                options={keyTypeOptions}
                value={keyType as any}
                onChange={(e) => setValue(`items.${index}.keyType`, e.target.value as any, { shouldValidate: true })}
                error={itemErrors?.keyType?.message}
              />

              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={!!isRequired}
                  onChange={(e) => setValue(`items.${index}.isRequired`, e.target.checked, { shouldValidate: true })}
                  className="h-4 w-4 rounded border-[var(--color-outine)]"
                />
                مطلوب
              </label>
            </div>
          );
        })}
      </div>

      {errors.items?.message ? (
        <p className="mt-2 text-sm text-red-500">{errors.items.message as any}</p>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          onClick={() => append({ keyName: '', keyType: 'string', isRequired: true })}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
        >
          <Plus size={16} />
          إضافة مفتاح جديد
        </button>
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
