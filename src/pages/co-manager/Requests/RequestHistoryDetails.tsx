import { ArrowLeft, FileDown, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DataCard from '../../../components/common/DataCard';
import RequestHistoryTimeline from '../../../components/common/RequestHistoryTimeline';
import { Toast } from '../../../components/common/Toast';
import sectionStyles from '../../../components/layout/section.module.css';
import { ENV } from '../../../env';
import { api } from '../../../services/api';
import { requestHistoryService } from '../../../services/requestHistory.service';
import { DocumentLibrary } from '../../../packages/document-generator/src/index.js';
import type { RequestHistoryDetailsResponse } from '../../../types/requestHistory.types';
import { formatDateTime } from '../../../utils/dateFormatter';

export default function RequestHistoryDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [details, setDetails] = useState<RequestHistoryDetailsResponse | null>(null);

  const fetchDetails = async () => {
    if (!requestId) return;
    setIsLoading(true);
    try {
      const response = await requestHistoryService.getCoManagerHistoryDetails(requestId);
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

  const handlePreviewDocument = () => {
    if (!details) return;

    const hash = details.transactionHashes?.initialDataHash
      ? '0x' + details.transactionHashes.initialDataHash
      : '0x' + details.request.id.replace(/-/g, '').padStart(64, '0').slice(0, 64);

    const lib = DocumentLibrary.getInstance({ primaryColor: '#154239' });

    const doc = lib.createDocument({
      citizen: {
        name: details.citizen.name,
        nationalId: details.citizen.nationalId,
      },
      request: {
        id: details.request.id,
        transactionName: details.transaction.name,
        status: details.request.status,
        createdAt: details.request.createdAt,
        updatedAt: details.request.updatedAt,
      },
      institution: {
        name: details.steps[0]?.institutionName || '',
      },
      intialData: details.cumulativeData,
      stepData: details.steps.map(step => ({
        stepOrder: step.stepOrder,
        sectionName: step.sectionName,
        sectionId: step.sectionId || step.id,
        status: step.status === 'approved' ? 'completed' : step.status,
        employeeName: step.processor.name,
        employeeId: step.processor.email,
        processedAt: step.processedAt,
        data: step.data,
      })),
      signature: {
        name: details.steps[details.steps.length - 1]?.processor?.name || '',
        title: details.steps[details.steps.length - 1]?.processor?.role || '',
        date: details.steps[details.steps.length - 1]?.processedAt || '',
      },
      dataHash: hash,
    }, { previewOnly: true });

    try {
      doc.preview();
    } catch (err) {
      console.error('Document preview error:', err);
      Toast.error('حدث خطأ أثناء فتح معاينة المستند');
    }
  };

  const handleDownloadPdf = async () => {
    if (!requestId) return;
    setIsGenerating(true);
    try {
      const response = await api.get(`/co-manager/documents/requests/history/${requestId}/generate`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${requestId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      Toast.error('حدث خطأ أثناء تحميل المستند');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تفاصيل سجل الطلب</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard/co-manager/requests/history')}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          العودة للقائمة
        </button>

        {details?.request.status === 'completed' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2 font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileDown size={16} />
              {isGenerating ? 'جارٍ التحميل...' : 'تحميل المستند الرسمي'}
            </button>
            <button
              type="button"
              onClick={handlePreviewDocument}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-all cursor-pointer"
            >
              <Printer size={16} />
              معاينة
            </button>
          </div>
        )}
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

