import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DataCard from '../../../components/common/DataCard';
import RequestHistoryTimeline from '../../../components/common/RequestHistoryTimeline';
import { Toast } from '../../../components/common/Toast';
import sectionStyles from '../../../components/layout/section.module.css';
import { requestHistoryService } from '../../../services/requestHistory.service';
import type { RequestHistoryDetailsResponse } from '../../../types/requestHistory.types';
import { formatDateTime } from '../../../utils/dateFormatter';

export default function RequestHistoryDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<RequestHistoryDetailsResponse | null>(null);

  const fetchDetails = async () => {
    if (!requestId) return;
    setIsLoading(true);
    try {
      const response = await requestHistoryService.getManagerHistoryDetails(requestId);
      if (response.success && response.data) {
        setDetails(response.data);
      } else {
        Toast.error(response.error ?? 'فشل في جلب تفاصيل الطلب');
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب تفاصيل الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [requestId]);

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تفاصيل سجل الطلب</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="mb-5 flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate('/dashboard/manager/requests/history')}
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
      ) : details ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">المعاملة</div>
              <div className="mt-1 font-bold">{details.transaction.name}</div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">المواطن</div>
              <div className="mt-1 font-bold">
                {details.citizen.name} ({details.citizen.nationalId})
              </div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">حالة الطلب</div>
              <div className="mt-1 font-semibold">{details.request.status}</div>
            </div>

            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">تاريخ الإنشاء</div>
              <div className="mt-1 font-semibold">{formatDateTime(details.request.createdAt)}</div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">آخر تحديث</div>
              <div className="mt-1 font-semibold">{formatDateTime(details.request.updatedAt)}</div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">آخر خطوة</div>
              <div className="mt-1 font-semibold">الخطوة {details.request.currentStep}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="mb-4 text-lg font-bold">سجل المعالجة</div>
            <RequestHistoryTimeline steps={details.steps} />
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-lg font-bold">البيانات التراكمية</div>
            <DataCard data={details.cumulativeData} />
          </div>
        </div>
      ) : (
        <div className="text-[var(--color-sub-text)]">الطلب غير موجود</div>
      )}
    </div>
  );
}

