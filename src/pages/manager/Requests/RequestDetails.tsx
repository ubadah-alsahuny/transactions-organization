import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import sectionStyles from '../../../components/layout/section.module.css';
import { Toast } from '../../../components/common/Toast';
import { requestsService } from '../../../services/requests.service';
import type { RunningRequestItem } from '../../../types/request.types';
import { formatDateTime } from '../../../utils/dateFormatter';

export default function RequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<RunningRequestItem | null>(
    (location.state as any)?.request ?? null
  );

  useEffect(() => {
    const fallbackFetch = async () => {
      if (request) {
        setIsLoading(false);
        return;
      }
      if (!requestId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await requestsService.listManagerRunningRequests({ page: 1, limit: 50, order: 'ASC' });
        const found = response.data?.items.find(item => item.requestId === requestId) ?? null;
        if (found) setRequest(found);
        else Toast.error('لم يتم العثور على الطلب ضمن أول صفحة من النتائج');
      } catch (error: any) {
        Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب بيانات الطلب');
      } finally {
        setIsLoading(false);
      }
    };

    fallbackFetch();
  }, [request, requestId]);

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تفاصيل الطلب</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="mb-5 flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate('/dashboard/manager/requests/running')}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          العودة للقائمة
        </button>

        <button
          type="button"
          onClick={() => window.open(`/print/request/${requestId}`, '_blank')}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] text-[var(--color-action)] transition-colors cursor-pointer"
        >
          <Printer size={16} />
          طباعة المعاملة
        </button>
      </div>

      {isLoading ? (
        <div className="text-[var(--color-sub-text)]">جارٍ التحميل...</div>
      ) : request ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">المعاملة</div>
            <div className="mt-1 font-bold">{request.transactionName}</div>
          </div>
          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">المواطن</div>
            <div className="mt-1 font-bold">{request.citizen.name}</div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">حالة الطلب</div>
            <div className="mt-1 font-semibold">{request.requestStatus}</div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">آخر تقدم</div>
            <div className="mt-1 font-semibold">
              الخطوة {request.lastProgress.stepOrder} • {request.lastProgress.sectionName}
            </div>
            <div className="mt-1 text-sm text-[var(--color-sub-text)]">
              حالة الخطوة: {request.lastProgress.lastStepStatus}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">تاريخ الإنشاء</div>
            <div className="mt-1 font-semibold">{formatDateTime(request.createdAt)}</div>
          </div>
          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">آخر تحديث</div>
            <div className="mt-1 font-semibold">{formatDateTime(request.updatedAt)}</div>
          </div>
        </div>
      ) : (
        <div className="text-[var(--color-sub-text)]">الطلب غير موجود</div>
      )}
    </div>
  );
}
