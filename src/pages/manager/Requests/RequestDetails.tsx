import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import sectionStyles from '../../../components/layout/section.module.css';
import { Toast } from '../../../components/common/Toast';
import { requestsService } from '../../../services/requests.service';
import { DocumentLibrary } from '../../../packages/document-generator/src/index.js';
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

  const getDocument = () => {
    if (!request) return null;

    const hash = '0x' + request.requestId.replace(/-/g, '').padStart(64, '0').slice(0, 64);
    const lib = DocumentLibrary.getInstance({
      primaryColor: '#154239',
    });

    return lib.createDocument({
      citizen: { id: request.citizen.id, name: request.citizen.name },
      request: {
        requestId: request.requestId,
        transactionName: request.transactionName,
        requestStatus: request.requestStatus,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      },
      institution: { id: '', name: '' },
      dataHash: hash,
    });
  };

  const handlePrintDocument = () => {
    try {
      const doc = getDocument();
      if (doc) {
        doc.preview();
      }
    } catch (err) {
      console.error('Document generation error:', err);
      Toast.error('حدث خطأ أثناء إنشاء المستند');
    }
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تفاصيل الطلب</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard/manager/requests/running')}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          العودة للقائمة
        </button>

        {request?.requestStatus === 'completed' && (
          <button
            type="button"
            onClick={handlePrintDocument}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2 font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            <Printer size={16} />
            طباعة/معاينة المستند
          </button>
        )}
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
