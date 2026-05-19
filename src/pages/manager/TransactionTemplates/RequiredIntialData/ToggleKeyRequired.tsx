import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from '../../../../components/common/Toast';
import sectionStyles from '../../../../components/layout/section.module.css';
import Modal from '../../../../components/common/Modal';
import { templatesService } from '../../../../services/templates.service';
import { useEffect, useState } from 'react';

export default function ToggleKeyRequired() {
  const { keyId } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) navigate(-1);
  }, [navigate, open]);

  const confirm = async () => {
    if (!keyId) return;
    setIsLoading(true);
    try {
      const response = await templatesService.toggleIntialDataKeyRequired(keyId);
      if (response.success) Toast.success('تم تغيير حالة الإلزام');
      else Toast.error(response.error ?? 'فشل تغيير حالة الإلزام');
      setOpen(false);
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء تغيير حالة الإلزام');
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={sectionStyles.section}>
      <Modal
        open={open}
        title="تأكيد تبديل الإلزام"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-5 py-2.5 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={confirm}
              className="rounded-2xl bg-[var(--color-action)] px-5 py-2.5 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] disabled:opacity-50 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'جارٍ التنفيذ...' : 'تأكيد'}
            </button>
          </>
        }
      >
        <div className="text-[var(--color-sub-text)] leading-relaxed">هل أنت متأكد من تبديل حالة الإلزام؟</div>
      </Modal>
    </div>
  );
}
