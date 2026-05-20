import { useEffect, useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import sectionStyles from '../../components/layout/section.module.css';
import { Toast } from '../../components/common/Toast';
import { requestsService } from '../../services/requests.service';
import type { EmployeeRequestDetailsResponse } from '../../types/request.types';
import { formatDateTime } from '../../utils/dateFormatter';
import { Button } from '../../components/common/Button';

export default function EmployeeRequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [details, setDetails] = useState<EmployeeRequestDetailsResponse | null>(null);
  const [customData, setCustomData] = useState<string>('{}');

  const fetchDetails = async () => {
    if (!requestId) return;
    setIsLoading(true);
    try {
      const response = await requestsService.getEmployeeRequestDetails(requestId);
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

  const handleProcess = async (status: 'approved' | 'rejected') => {
    if (!requestId) return;
    
    let parsedData = undefined;
    try {
      parsedData = JSON.parse(customData);
      if (typeof parsedData !== 'object' || Array.isArray(parsedData) || parsedData === null) {
        throw new Error();
      }
    } catch (e) {
      Toast.error('البيانات المرفقة يجب أن تكون بصيغة JSON صحيحة');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await requestsService.processEmployeeRequest(requestId, {
        status,
        data: Object.keys(parsedData).length > 0 ? parsedData : undefined
      });
      if (response.success) {
        Toast.success(status === 'approved' ? 'تم الموافقة على الخطوة' : 'تم رفض الخطوة');
        fetchDetails(); // refresh details
      } else {
        Toast.error(response.error ?? 'فشل في معالجة الطلب');
      }
    } catch (error: any ) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تفاصيل الطلب</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="mb-5 flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate('/employee/requests/pending')}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
        >
          <ArrowLeft size={16} />
          العودة للقائمة
        </button>
      </div>

      {isLoading ? (
        <div className="text-[var(--color-sub-text)]">جارٍ التحميل...</div>
      ) : details ? (
        <div className="flex flex-col gap-6">
          {/* Basic Request Info */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">المعاملة</div>
              <div className="mt-1 font-bold">{details.request.transactionName}</div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">المواطن</div>
              <div className="mt-1 font-bold">{details.request.citizen.name} ({details.request.citizen.nationalId})</div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">القسم الحالي</div>
              <div className="mt-1 font-semibold">{details.currentStep.sectionName} (الخطوة {details.currentStep.stepOrder})</div>
            </div>
          </div>

          {/* Initial Data */}
          {details.request.intialData && Object.keys(details.request.intialData).length > 0 && (
             <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-lg font-bold mb-3">البيانات الأولية من المواطن</div>
              <pre className="bg-[var(--color-section)] p-4 rounded-xl text-sm overflow-auto text-left" dir="ltr">
                {JSON.stringify(details.request.intialData, null, 2)}
              </pre>
             </div>
          )}

          {/* Previous Steps */}
          {details.previousSteps.length > 0 && (
             <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
               <div className="text-lg font-bold mb-4">الخطوات السابقة</div>
               <div className="flex flex-col gap-4">
                 {details.previousSteps.map((step) => (
                   <div key={step.id} className="border border-[var(--color-outine)] rounded-xl p-4 bg-[var(--color-section)]">
                     <div className="flex justify-between mb-2">
                       <span className="font-semibold">الخطوة {step.stepOrder} - {step.sectionName}</span>
                       <span className={`text-sm px-2 py-1 rounded-full ${step.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {step.status}
                       </span>
                     </div>
                     <div className="text-sm text-[var(--color-sub-text)] mb-2">
                       معالجة بواسطة: {step.employeeName} في {formatDateTime(step.processedAt)}
                     </div>
                     {step.data && Object.keys(step.data).length > 0 && (
                       <pre className="bg-[var(--color-primary)] p-3 rounded-lg text-xs overflow-auto text-left" dir="ltr">
                         {JSON.stringify(step.data, null, 2)}
                       </pre>
                     )}
                   </div>
                 ))}
               </div>
             </div>
          )}

          {/* Process Step Area */}
          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-lg font-bold mb-4">معالجة الخطوة الحالية</div>
            
            {details.requestStep.status === 'waiting' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">إضافة بيانات (JSON - اختياري)</label>
                  <textarea
                    value={customData}
                    onChange={(e) => setCustomData(e.target.value)}
                    className="w-full h-32 p-3 rounded-xl border border-[var(--color-outine)] bg-[var(--color-section)] text-left font-mono text-sm"
                    dir="ltr"
                    placeholder="{}"
                  />
                </div>
                
                <div className="flex gap-4 mt-2">
                  <Button
                    onClick={() => handleProcess('approved')}
                    isLoading={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white flex justify-center items-center gap-2"
                  >
                    <Check size={18} />
                    موافقة
                  </Button>
                  <Button
                    onClick={() => handleProcess('rejected')}
                    isLoading={isProcessing}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white flex justify-center items-center gap-2"
                  >
                    <X size={18} />
                    رفض
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-[var(--color-section)] rounded-xl">
                <div className="text-lg font-bold mb-2">تمت معالجة هذه الخطوة</div>
                <div className="text-[var(--color-sub-text)]">
                  الحالة: <span className="font-semibold">{details.requestStep.status}</span>
                </div>
                {details.requestStep.processedAt && (
                   <div className="text-sm mt-1 text-[var(--color-sub-text)]">
                     تاريخ المعالجة: {formatDateTime(details.requestStep.processedAt)}
                   </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      ) : (
        <div className="text-[var(--color-sub-text)]">الطلب غير موجود</div>
      )}
    </div>
  );
}
