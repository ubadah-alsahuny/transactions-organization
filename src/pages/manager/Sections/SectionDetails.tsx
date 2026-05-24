import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Pencil, Power } from 'lucide-react';
import { Toast } from '../../../components/common/Toast';
import { sectionsService } from '../../../services/sections.service';
import type { Section } from '../../../types/section.types';
import sectionStyles from '../../../components/layout/section.module.css';
import Modal from '../../../components/common/Modal';
import SectionForm from '../../../components/forms/SectionForm';

export default function SectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState<Section | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'deactivate' | 'activate' | null>(null);

  const fetchSection = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await sectionsService.getManagerSectionById(id);
      if (res.success && res.data) setSection(res.data);
      else Toast.error(res.error ?? 'فشل في جلب بيانات القسم');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب بيانات القسم');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSection();
  }, [id]);

  const deactivate = async () => {
    if (!id) return;
    setIsToggling(true);
    try {
      const res = await sectionsService.deactivateManagerSection(id);
      if (res.success) {
        Toast.success('تم تعطيل القسم');
        fetchSection();
      } else {
        Toast.error(res.error ?? 'فشل تعطيل القسم');
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء تعطيل القسم');
    } finally {
      setIsToggling(false);
    }
  };

  const activate = async () => {
    if (!id) return;
    setIsToggling(true);
    try {
      const res = await sectionsService.updateManagerSection(id, { is_active: true });
      if (res.success) {
        Toast.success('تم تفعيل القسم');
        fetchSection();
      } else {
        Toast.error(res.error ?? 'فشل تفعيل القسم');
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء تفعيل القسم');
    } finally {
      setIsToggling(false);
    }
  };

  const update = async (data: { name: string; description: string }) => {
    if (!id) return;
    try {
      const res = await sectionsService.updateManagerSection(id, {
        name: data.name,
        description: data.description,
      });
      if (res.success) {
        Toast.success('تم تحديث القسم');
        setIsEditOpen(false);
        fetchSection();
        return;
      }
      Toast.error(res.error ?? 'فشل تحديث القسم');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء تحديث القسم');
    }
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تفاصيل القسم</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard/manager/sections')}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
        >
          <ArrowLeft size={18} />
          العودة للقائمة
        </button>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
            disabled={!section}
          >
            <Pencil size={18} />
            تحديث
          </button>
          <button
            type="button"
            onClick={() => setConfirmAction('deactivate')}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-danger)] px-4 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-danger-hover)] disabled:opacity-50 transition-colors"
            disabled={!section || !section.is_active || isToggling}
          >
            <Power size={18} />
            تعطيل
          </button>
          {section && !section.is_active ? (
            <button
              type="button"
              onClick={() => setConfirmAction('activate')}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] disabled:opacity-50 transition-colors"
              disabled={isToggling}
            >
              <CheckCircle2 size={18} />
              تفعيل
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {isLoading ? (
          <div className="text-[var(--color-sub-text)]">جارٍ التحميل...</div>
        ) : section ? (
          <>
            <div className="hover-lift rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">الاسم</div>
              <div className="mt-1 font-bold">{section.name}</div>
            </div>
            <div className="hover-lift rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">الوصف</div>
              <div className="mt-1 font-semibold">{section.description}</div>
            </div>
            <div className="hover-lift rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">الحالة</div>
              <div className="mt-1 font-semibold">{section.is_active ? 'مفعّل' : 'معطّل'}</div>
            </div>
          </>
        ) : (
          <div className="text-[var(--color-sub-text)]">القسم غير موجود</div>
        )}
      </div>

      <Modal open={isEditOpen} title="تحديث القسم" onClose={() => setIsEditOpen(false)}>
        <SectionForm
          initialValues={{ name: section?.name, description: section?.description }}
          submitLabel="تحديث"
          onCancel={() => setIsEditOpen(false)}
          onSubmit={update}
        />
      </Modal>

      <Modal
        open={confirmAction !== null}
        title={confirmAction === 'deactivate' ? 'تأكيد تعطيل القسم' : 'تأكيد تفعيل القسم'}
        onClose={() => setConfirmAction(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-5 py-2.5 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              disabled={isToggling}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={async () => {
                const action = confirmAction;
                if (action === 'deactivate') await deactivate();
                if (action === 'activate') await activate();
                setConfirmAction(null);
              }}
              className={[
                'rounded-2xl px-5 py-2.5 font-semibold text-[var(--color-text-button)] transition-colors disabled:opacity-50',
                confirmAction === 'deactivate'
                  ? 'bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)]'
                  : 'bg-[var(--color-action)] hover:bg-[var(--color-action-hover)]',
              ].join(' ')}
              disabled={isToggling}
            >
              {isToggling ? 'جارٍ التنفيذ...' : 'تأكيد'}
            </button>
          </>
        }
      >
        <div className="text-[var(--color-sub-text)] leading-relaxed">
          {confirmAction === 'deactivate'
            ? 'هل أنت متأكد من تعطيل هذا القسم؟ لن يظهر للخطوات الفعالة حتى تتم إعادة تفعيله.'
            : 'هل أنت متأكد من تفعيل هذا القسم؟'}
        </div>
      </Modal>
    </div>
  );
}
