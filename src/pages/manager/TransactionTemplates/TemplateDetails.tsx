import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CopyPlus, Pencil, Power, Trash2, Layers3 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../../../components/common/Modal';
import { Toast } from '../../../components/common/Toast';
import IntialDataKeyForm from '../../../components/forms/IntialDataKeyForm';
import sectionStyles from '../../../components/layout/section.module.css';
import { templatesService } from '../../../services/templates.service';
import { useUIStore } from '../../../stores/uiStore';
import type { BulkIntialDataKeysFormData, IntialDataKeyFormData } from '../../../schemas/intialDataKey.schema';
import type { IntialDataKey, TemplateIntialDataResponse } from '../../../types/intialData.types';
import type { TransactionTemplateDetails } from '../../../types/template.types';
import { formatDateTime } from '../../../utils/dateFormatter';

export default function TemplateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const setHeaderActions = useUIStore(state => state.setHeaderActions);

  const [isLoading, setIsLoading] = useState(true);
  const [isKeysLoading, setIsKeysLoading] = useState(true);
  const [template, setTemplate] = useState<TransactionTemplateDetails | null>(null);
  const [initialData, setInitialData] = useState<TemplateIntialDataResponse | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isAddSingleOpen, setIsAddSingleOpen] = useState(false);
  const [isAddBulkOpen, setIsAddBulkOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<IntialDataKey | null>(null);
  const [confirmToggleKey, setConfirmToggleKey] = useState<IntialDataKey | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<IntialDataKey | null>(null);
  const [isMutatingKey, setIsMutatingKey] = useState(false);

  const templateId = typeof id === 'string' ? id : '';

  const fetchInitialKeys = async () => {
    if (!templateId) return;
    setIsKeysLoading(true);
    try {
      const initialDataResponse = await templatesService.getRequiredIntialData(templateId);
      if (initialDataResponse.success && initialDataResponse.data) {
        setInitialData(initialDataResponse.data);
      } else {
        Toast.error(initialDataResponse.error ?? 'فشل في جلب المفاتيح الأولية');
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب المفاتيح الأولية');
    } finally {
      setIsKeysLoading(false);
    }
  };

  const fetchDetails = async () => {
    if (!templateId) return;
    setIsLoading(true);
    setIsKeysLoading(true);
    try {
      const [templateResponse, initialDataResponse] = await Promise.all([
        templatesService.getManagerTemplateById(templateId),
        templatesService.getRequiredIntialData(templateId),
      ]);

      if (templateResponse.success && templateResponse.data) {
        setTemplate(templateResponse.data);
      } else {
        Toast.error(templateResponse.error ?? 'فشل في جلب بيانات القالب');
      }

      if (initialDataResponse.success && initialDataResponse.data) {
        setInitialData(initialDataResponse.data);
      } else if (initialDataResponse.error) {
        Toast.error(initialDataResponse.error);
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب تفاصيل القالب');
    } finally {
      setIsLoading(false);
      setIsKeysLoading(false);
    }
  };

  const addSingleKey = async (data: IntialDataKeyFormData) => {
    if (!templateId) return;
    setIsMutatingKey(true);
    try {
      const response = await templatesService.addIntialDataKey(templateId, data);
      if (response.success) {
        Toast.success('تمت إضافة المفتاح');
        setIsAddSingleOpen(false);
        await fetchInitialKeys();
        return;
      }
      Toast.error(response.error ?? 'فشل إضافة المفتاح');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء إضافة المفتاح');
    } finally {
      setIsMutatingKey(false);
    }
  };

  const addBulkKeys = async (data: BulkIntialDataKeysFormData) => {
    if (!templateId) return;
    setIsMutatingKey(true);
    try {
      const response = await templatesService.bulkAddIntialDataKeys(templateId, { items: data.items });
      if (response.success) {
        Toast.success('تمت إضافة المفاتيح');
        setIsAddBulkOpen(false);
        await fetchInitialKeys();
        return;
      }
      Toast.error(response.error ?? 'فشل إضافة المفاتيح');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء إضافة المفاتيح');
    } finally {
      setIsMutatingKey(false);
    }
  };

  const updateKey = async (data: IntialDataKeyFormData) => {
    if (!editingKey) return;
    setIsMutatingKey(true);
    try {
      const response = await templatesService.updateIntialDataKey(editingKey.id, data);
      if (response.success) {
        Toast.success('تم تحديث المفتاح');
        setEditingKey(null);
        await fetchInitialKeys();
        return;
      }
      Toast.error(response.error ?? 'فشل تحديث المفتاح');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء تحديث المفتاح');
    } finally {
      setIsMutatingKey(false);
    }
  };

  const toggleKeyRequired = async () => {
    if (!confirmToggleKey) return;
    setIsMutatingKey(true);
    try {
      const response = await templatesService.toggleIntialDataKeyRequired(confirmToggleKey.id);
      if (response.success) {
        Toast.success('تم تغيير حالة الإلزام');
        setConfirmToggleKey(null);
        await fetchInitialKeys();
        return;
      }
      Toast.error(response.error ?? 'فشل تغيير حالة الإلزام');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء تغيير حالة الإلزام');
    } finally {
      setIsMutatingKey(false);
    }
  };

  const deleteKey = async () => {
    if (!confirmDeleteKey) return;
    setIsMutatingKey(true);
    try {
      const response = await templatesService.deleteIntialDataKey(confirmDeleteKey.id);
      if (response.success) {
        Toast.success(response.data?.message ?? 'تم حذف المفتاح');
        setConfirmDeleteKey(null);
        await fetchInitialKeys();
        return;
      }
      Toast.error(response.error ?? 'فشل حذف المفتاح');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء حذف المفتاح');
    } finally {
      setIsMutatingKey(false);
    }
  };
  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    setHeaderActions(
      <button
        type="button"
        onClick={() => setIsOptionsOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
      >
        <CopyPlus size={18} />
        إضافة مفتاح جديد
      </button>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const keyRows = useMemo(() => initialData?.keys ?? [], [initialData?.keys]);

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تفاصيل قالب المعاملة</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate('/dashboard/manager/templates')}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
        >
          <ArrowLeft size={16} />
          العودة للقائمة
        </button>
      </div>

      {isLoading ? (
        <div className="text-[var(--color-sub-text)]">جارٍ التحميل...</div>
      ) : template ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="hover-lift rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">الاسم</div>
              <div className="mt-1 font-bold">{template.name}</div>
            </div>
            <div className="hover-lift rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">الحالة</div>
              <div className="mt-1 font-semibold">{template.isActive ? 'ظاهر للعامة' : 'مخفي'}</div>
            </div>
            <div className="hover-lift rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5 md:col-span-2">
              <div className="text-sm text-[var(--color-sub-text)]">الوصف</div>
              <div className="mt-1 font-semibold">{template.description}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Layers3 size={18} />
              تسلسل الخطوات
            </div>
            <div className="space-y-3">
              {template.transactionSteps.map(step => (
                <div
                  key={`${step.sectionId}-${step.stepOrder}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-3"
                >
                  <div className="font-semibold">
                    الخطوة {step.stepOrder}: {step.sectionName}
                  </div>
                  <div className="text-sm text-[var(--color-sub-text)]">
                    المؤسسة: {step.institutionName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="mb-4 text-lg font-bold">المفاتيح الأولية المطلوبة</div>
            <div className="space-y-3">
              {isKeysLoading ? (
                <div className="text-[var(--color-sub-text)]">جارٍ تحميل المفاتيح...</div>
              ) : keyRows.length ? (
                keyRows.map(key => (
                  <div
                    key={key.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-3"
                  >
                    <div>
                      <div className="font-semibold">{key.keyName}</div>
                      <div className="text-sm text-[var(--color-sub-text)]">
                        النوع: {key.keyType} • أضيف في: {formatDateTime(key.createdAt)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className={[
                          'inline-flex rounded-xl px-3 py-1 text-sm font-semibold',
                          key.isRequired
                            ? 'bg-[color-mix(in_srgb,var(--color-action),transparent_85%)]'
                            : 'bg-[color-mix(in_srgb,var(--color-danger),transparent_85%)]',
                        ].join(' ')}
                      >
                        {key.isRequired ? 'إجباري' : 'اختياري'}
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditingKey(key)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-3 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
                      >
                        <Pencil size={16} />
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmToggleKey(key)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-3 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
                      >
                        <Power size={16} />
                        تبديل الإلزام
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteKey(key)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-danger)] px-3 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-danger-hover)] transition-colors"
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[var(--color-sub-text)]">لا توجد مفاتيح أولية بعد.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[var(--color-sub-text)]">القالب غير موجود</div>
      )}

      <Modal open={isOptionsOpen} title="إضافة مفاتيح أولية" onClose={() => setIsOptionsOpen(false)}>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsOptionsOpen(false);
              setIsAddSingleOpen(true);
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-[var(--color-outine)] bg-[var(--color-primary)] px-4 py-3 text-right font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
          >
            <span>إضافة مفتاح واحد</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOptionsOpen(false);
              setIsAddBulkOpen(true);
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-[var(--color-outine)] bg-[var(--color-primary)] px-4 py-3 text-right font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
          >
            <span>إضافة مفاتيح بالجملة</span>
          </button>
        </div>
      </Modal>

      <Modal open={isAddSingleOpen} title="إضافة مفتاح واحد" onClose={() => setIsAddSingleOpen(false)}>
        <IntialDataKeyForm
          mode="single"
          submitLabel="إضافة"
          onCancel={() => setIsAddSingleOpen(false)}
          onSubmit={addSingleKey}
        />
      </Modal>

      <Modal open={isAddBulkOpen} title="إضافة مفاتيح بالجملة" onClose={() => setIsAddBulkOpen(false)}>
        <IntialDataKeyForm
          mode="bulk"
          submitLabel="إضافة"
          onCancel={() => setIsAddBulkOpen(false)}
          onSubmit={addBulkKeys}
        />
      </Modal>

      <Modal open={editingKey !== null} title="تعديل المفتاح" onClose={() => setEditingKey(null)}>
        <IntialDataKeyForm
          mode="single"
          initialValues={{
            keyName: editingKey?.keyName,
            keyType: editingKey?.keyType as any,
            isRequired: editingKey?.isRequired,
          }}
          submitLabel="تحديث"
          onCancel={() => setEditingKey(null)}
          onSubmit={updateKey}
        />
      </Modal>

      <Modal
        open={confirmToggleKey !== null}
        title="تأكيد تبديل الإلزام"
        onClose={() => setConfirmToggleKey(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmToggleKey(null)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-5 py-2.5 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              disabled={isMutatingKey}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={toggleKeyRequired}
              className="rounded-2xl bg-[var(--color-action)] px-5 py-2.5 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] disabled:opacity-50 transition-colors"
              disabled={isMutatingKey}
            >
              {isMutatingKey ? 'جارٍ التنفيذ...' : 'تأكيد'}
            </button>
          </>
        }
      >
        <div className="text-[var(--color-sub-text)] leading-relaxed">
          هل أنت متأكد من تبديل حالة الإلزام للمفتاح{' '}
          <span className="font-semibold text-[var(--color-text)]">{confirmToggleKey?.keyName ?? ''}</span>؟
        </div>
      </Modal>

      <Modal
        open={confirmDeleteKey !== null}
        title="تأكيد حذف المفتاح"
        onClose={() => setConfirmDeleteKey(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmDeleteKey(null)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-5 py-2.5 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              disabled={isMutatingKey}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={deleteKey}
              className="rounded-2xl bg-[var(--color-danger)] px-5 py-2.5 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-danger-hover)] disabled:opacity-50 transition-colors"
              disabled={isMutatingKey}
            >
              {isMutatingKey ? 'جارٍ التنفيذ...' : 'حذف'}
            </button>
          </>
        }
      >
        <div className="text-[var(--color-sub-text)] leading-relaxed">
          هل أنت متأكد من حذف المفتاح{' '}
          <span className="font-semibold text-[var(--color-text)]">{confirmDeleteKey?.keyName ?? ''}</span>؟
        </div>
      </Modal>
    </div>
  );
}
