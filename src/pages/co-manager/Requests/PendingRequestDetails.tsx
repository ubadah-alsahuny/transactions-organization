import { useEffect, useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import sectionStyles from '../../../components/layout/section.module.css';
import { Toast } from '../../../components/common/Toast';
import Modal from '../../../components/common/Modal';
import { requestsService } from '../../../services/requests.service';
import type { CoManagerRequestDetailsResponse } from '../../../types/request.types';
import { formatDateTime } from '../../../utils/dateFormatter';
import { filterInitialData, filterStepOneData } from '../../../utils/dataFilter';
import { useAuthStore } from '../../../stores/authStore';

const DataCard = ({ data, title }: { data: Record<string, any>; title?: string }) => {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-2" dir="rtl">
      {title && (
        <div className="text-sm font-semibold text-[var(--color-sub-text)] border-b border-[var(--color-outine)] pb-1">
          {title}
        </div>
      )}
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="bg-[var(--color-section)] p-3 rounded-xl border border-[var(--color-outine)] flex flex-col gap-1"
        >
          <div className="text-xs text-[var(--color-sub-text)] font-mono font-bold text-[var(--color-action)]">
            {key}
          </div>
          <div className="text-sm font-medium break-words whitespace-pre-wrap text-[var(--color-text)]">
            {typeof value === 'boolean'
              ? value
                ? 'نعم'
                : 'لا'
              : typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function PendingRequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const uuidPrefix = user?.id ? user.id.substring(0, 2).toUpperCase() : 'XX';

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [details, setDetails] = useState<CoManagerRequestDetailsResponse | null>(null);

  const [personalNote, setPersonalNote] = useState('');
  const [legalParagraph, setLegalParagraph] = useState('');
  const [showPersonal, setShowPersonal] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDetails = async () => {
    if (!requestId) return;
    setIsLoading(true);
    try {
      const response = await requestsService.getCoManagerRequestDetails(requestId);
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

    const dataToSend: Record<string, any> = {};

    if (status === 'approved') {
      if (showPersonal && personalNote.trim()) {
        dataToSend[`${uuidPrefix}PersonalNote`] = personalNote.trim();
      }
      if (showLegal && legalParagraph.trim()) {
        dataToSend[`${uuidPrefix}LegalParagraph`] = legalParagraph.trim();
      }
    }

    if (status === 'rejected' && rejectionReason.trim()) {
      dataToSend.rejectionReason = rejectionReason.trim();
    }

    setIsProcessing(true);
    try {
      const response = await requestsService.processCoManagerRequest(requestId, {
        status,
        data: Object.keys(dataToSend).length > 0 ? dataToSend : undefined,
      });
      if (response.success) {
        Toast.success(status === 'approved' ? 'تم الموافقة على الخطوة' : 'تم رفض الخطوة');
        setPersonalNote('');
        setLegalParagraph('');
        setShowPersonal(false);
        setShowLegal(false);
        setRejectionReason('');
        setConfirmAction(null);
        navigate('/dashboard/co-manager/requests/pending');
      } else {
        Toast.error(response.error ?? 'فشل في معالجة الطلب');
      }
    } catch (error: any) {
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
          onClick={() => navigate('/dashboard/co-manager/requests/pending')}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">المعاملة</div>
              <div className="mt-1 font-bold">{details.request.transactionName}</div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">المواطن</div>
              <div className="mt-1 font-bold">
                {details.request.citizen.name} ({details.request.citizen.nationalId})
              </div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">القسم الحالي</div>
              <div className="mt-1 font-semibold">
                {details.currentStep.sectionName} (الخطوة {details.currentStep.stepOrder})
              </div>
            </div>
          </div>

          {details.request.intialData && Object.keys(details.request.intialData).length > 0 && (
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-lg font-bold mb-3">البيانات الأولية من المواطن</div>
              <DataCard data={filterInitialData(details.request.intialData)} />
            </div>
          )}

          {details.previousSteps.length > 0 && (
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-lg font-bold mb-4">الخطوات السابقة</div>
              <div className="flex flex-col gap-4">
                {details.previousSteps.map(step => {
                  const stepData = step.stepOrder === 1 ? filterStepOneData(step.data) : step.data;
                  return (
                    <div key={step.id} className="border border-[var(--color-outine)] rounded-xl p-4 bg-[var(--color-section)]">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">
                          الخطوة {step.stepOrder} - {step.sectionName}
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            step.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                      <div className="text-sm text-[var(--color-sub-text)] mb-2">
                        معالجة بواسطة: {step.employeeName} في {formatDateTime(step.processedAt)}
                      </div>
                      {stepData && Object.keys(stepData).length > 0 && <DataCard data={stepData} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-lg font-bold mb-4">معالجة الخطوة الحالية</div>

            {details.requestStep.status === 'waiting' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="block text-sm font-semibold mb-3">إضافة ملاحظات (اختياري)</div>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowPersonal(!showPersonal)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                        showPersonal
                          ? 'bg-[var(--color-action)] text-white border-[var(--color-action)]'
                          : 'bg-transparent border-[var(--color-outine)] hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)]'
                      }`}
                    >
                      {showPersonal ? '- إخفاء الملاحظة الشخصية' : '+ إضافة ملاحظة شخصية'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLegal(!showLegal)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                        showLegal
                          ? 'bg-[var(--color-action)] text-white border-[var(--color-action)]'
                          : 'bg-transparent border-[var(--color-outine)] hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)]'
                      }`}
                    >
                      {showLegal ? '- إخفاء الملاحظة القانونية' : '+ إضافة ملاحظة قانونية'}
                    </button>
                  </div>

                  {showPersonal && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2" dir="ltr">
                        {uuidPrefix}PersonalNote
                      </label>
                      <textarea
                        value={personalNote}
                        onChange={(e) => setPersonalNote(e.target.value)}
                        className="w-full h-24 p-3 rounded-xl border border-[var(--color-outine)] bg-[var(--color-section)] text-sm"
                        placeholder="أضف ملاحظة شخصية هنا..."
                      />
                    </div>
                  )}

                  {showLegal && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2" dir="ltr">
                        {uuidPrefix}LegalParagraph
                      </label>
                      <textarea
                        value={legalParagraph}
                        onChange={(e) => setLegalParagraph(e.target.value)}
                        className="w-full h-24 p-3 rounded-xl border border-[var(--color-outine)] bg-[var(--color-section)] text-sm"
                        placeholder="أضف ملاحظة قانونية هنا..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmAction('approved')}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-green-600 bg-transparent px-4 py-2 font-semibold text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check size={18} />
                    موافقة
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction('rejected')}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-red-600 bg-transparent px-4 py-2 font-semibold text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <X size={18} />
                    رفض
                  </button>
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

      <Modal
        open={confirmAction !== null}
        title={confirmAction === 'approved' ? 'تأكيد الموافقة' : 'تأكيد الرفض'}
        onClose={() => setConfirmAction(null)}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 rounded-xl border border-[var(--color-outine)] bg-transparent font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirmAction) handleProcess(confirmAction);
              }}
              disabled={isProcessing || (confirmAction === 'rejected' && !rejectionReason.trim())}
              className={`px-4 py-2 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                confirmAction === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isProcessing
                ? 'جارٍ المعالجة...'
                : confirmAction === 'approved'
                  ? 'تأكيد الموافقة'
                  : 'تأكيد الرفض'}
            </button>
          </div>
        }
      >
        {confirmAction === 'rejected' ? (
          <div className="flex flex-col gap-2">
            <p className="text-[var(--color-text)]">هل أنت متأكد من رفض هذه الخطوة؟</p>
            <label className="block text-sm font-semibold mb-1">سبب الرفض *</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-[var(--color-outine)] bg-[var(--color-primary)] text-sm"
              placeholder="أدخل سبب الرفض هنا..."
            />
          </div>
        ) : (
          <p className="text-[var(--color-text)]">هل أنت متأكد من الموافقة على هذه الخطوة؟</p>
        )}
      </Modal>
    </div>
  );
}

