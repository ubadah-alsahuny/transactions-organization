import { ArrowLeft, Search, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DataCard from '../../components/common/DataCard';
import Modal from '../../components/common/Modal';
import RequestHistoryTimeline from '../../components/common/RequestHistoryTimeline';
import { Toast } from '../../components/common/Toast';
import VerificationModal from '../../components/verification/VerificationModal';
import sectionStyles from '../../components/layout/section.module.css';
import { requestHistoryService } from '../../services/requestHistory.service';
import { verificationService } from '../../services/verification.service';
import type { RequestHistoryDetailsResponse } from '../../types/requestHistory.types';
import type { VerificationResult } from '../../types/verification.types';
import { formatDateTime } from '../../utils/dateFormatter';

export default function TrackRequest({ role }: { role: 'employee' | 'co_manager' }) {
  const [searchParams] = useSearchParams();
  const initialNid = searchParams.get('nationalId') || '';
  const initialRefTx = searchParams.get('refTxId') || '';
  const initialReqId = searchParams.get('requestId') || '';
  const initialNested = searchParams.get('nested') === '1';

  const [citizenNationalId, setCitizenNationalId] = useState(initialNid);
  const [referenceTransactionId, setReferenceTransactionId] = useState(initialRefTx);
  const [requestId, setRequestId] = useState(initialReqId);
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<RequestHistoryDetailsResponse | null>(null);
  const [isNested, setIsNested] = useState(initialNested);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [mismatchRequestId, setMismatchRequestId] = useState('');
  const [mismatchNationalId, setMismatchNationalId] = useState('');

  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  const executeSearch = async (reqId: string, nid: string, refTx: string) => {
    setIsLoading(true);
    setDetails(null);
    try {
      const params: { citizenNationalId?: string; transactionId?: string } = {};
      if (nid) params.citizenNationalId = nid;
      if (refTx) params.transactionId = refTx;

      const response =
        role === 'employee'
          ? await requestHistoryService.getExternalEmployeeHistoryDetails(reqId, params)
          : await requestHistoryService.getExternalCoManagerHistoryDetails(reqId, params);

      if (response.success && response.data) {
        setDetails(response.data);
      } else {
        Toast.error(response.error ?? 'فشل في جلب تفاصيل الطلب');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error;
      if (msg === 'Cannot provide both citizenNationalId and transactionId') {
        Toast.error('لا يمكن إدخال الرقم الوطني ومعرف المعاملة المرجعية معاً');
      } else if (msg === 'Reference transaction request not found') {
        Toast.error('لم يتم العثور على طلب المعاملة المرجعي');
      } else if (msg?.includes('Citizen national ID does not match')) {
        if (isNested) {
          setMismatchRequestId(reqId);
          setMismatchNationalId(nid);
          setShowMismatchModal(true);
        } else {
          Toast.error('الرقم الوطني لا يتطابق مع هذا الطلب');
        }
      } else if (msg?.includes('request not found')) {
        Toast.error('الطلب غير موجود');
      } else {
        Toast.error(msg ?? 'حدث خطأ أثناء جلب تفاصيل الطلب');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasAutoSearched && initialReqId && (initialNid || initialRefTx)) {
      executeSearch(initialReqId, initialNid, initialRefTx);
      setHasAutoSearched(true);
    }
  }, [hasAutoSearched, initialReqId, initialNid, initialRefTx]);

  const handleSearch = () => {
    const trimmedId = requestId.trim();
    const trimmedNid = citizenNationalId.trim();
    const trimmedRefTx = referenceTransactionId.trim();
    setIsNested(false);

    if (!trimmedId) {
      Toast.error('الرجاء إدخال معرف الطلب');
      return;
    }

    if (trimmedNid && trimmedRefTx) {
      Toast.error('لا يمكن إدخال الرقم الوطني ومعرف المعاملة المرجعية معاً');
      return;
    }

    if (!trimmedNid && !trimmedRefTx) {
      Toast.error('الرجاء إدخال الرقم الوطني أو معرف المعاملة المرجعية');
      return;
    }

    executeSearch(trimmedId, trimmedNid, trimmedRefTx);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleVerifyUuid = async (uuidToVerify: string) => {
    setShowVerifyModal(true);
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const data = await verificationService.verifyBlockchainRequest(uuidToVerify);
      if (data.success) {
        if (data.data.verification.status === 'failed' && data.data.request.status !== 'completed') {
          setShowVerifyModal(false);
          Toast.error('الطلب غير مكتمل');
          return;
        }
        setVerifyResult(data.data);
      } else {
        Toast.error(data.error ?? 'فشل التحقق');
        setShowVerifyModal(false);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setShowVerifyModal(false);
      const msg = err.response?.data?.error || 'حدث خطأ أثناء التحقق';
      if (msg.includes('request not found') || msg.includes('لم يتم')) {
        Toast.error('الطلب غير موجود');
      } else {
        Toast.error(msg);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleViewDetails = (uuid: string) => {
    if (details) {
      const basePath = role === 'employee' ? '/employee/track' : '/dashboard/co-manager/track';
      const url = `${basePath}?requestId=${uuid}&nationalId=${details.citizen.nationalId}&nested=1`;
      window.open(url, '_blank');
    }
  };

  const handleMismatchResubmit = () => {
    const trimmed = mismatchNationalId.trim();
    if (!trimmed) {
      Toast.error('الرجاء إدخال الرقم الوطني');
      return;
    }
    setShowMismatchModal(false);
    setCitizenNationalId(trimmed);
    executeSearch(mismatchRequestId, trimmed, '');
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تتبع وتحقق من المعاملة</div>
        <div className={sectionStyles.line} />
      </div>

      {!details ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-full max-w-[500px]">
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-6">
              <div className="mb-4 text-sm text-[var(--color-sub-text)]">
                أدخل معرف الطلب بالإضافة إلى (الرقم الوطني) أو (معرف معاملة مرجعية) لعرض التفاصيل
              </div>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={requestId}
                  onChange={e => setRequestId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="معرف الطلب المراد تتبعه (مطلوب)"
                  className="w-full rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-action)]"
                />
                
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-outine)]" />
                  </div>
                  <div className="relative bg-[var(--color-primary)] px-2 text-xs font-semibold text-[var(--color-sub-text)]">
                    التحقق بواسطة
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={citizenNationalId}
                    onChange={e => {
                      setCitizenNationalId(e.target.value);
                      if (e.target.value) setReferenceTransactionId('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="الرقم الوطني للمواطن"
                    className="w-full rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-action)] disabled:opacity-50"
                  />
                  <div className="text-center text-xs text-[var(--color-sub-text)]">أو</div>
                  <input
                    type="text"
                    value={referenceTransactionId}
                    onChange={e => {
                      setReferenceTransactionId(e.target.value);
                      if (e.target.value) setCitizenNationalId('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="معرف معاملة مرجعية"
                    className="w-full rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-action)] disabled:opacity-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isLoading || (!citizenNationalId.trim() && !referenceTransactionId.trim()) || !requestId.trim()}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-action)] px-5 py-3 font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search size={16} />
                  )}
                  بحث
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setDetails(null);
                setIsNested(false);
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              بحث جديد
            </button>

            {details.request.status === 'completed' && (
              <button
                type="button"
                onClick={() => handleVerifyUuid(details.request.id)}
                className="inline-flex items-center gap-2 rounded-2xl border border-green-600 bg-green-50 px-4 py-2 font-semibold text-green-700 hover:bg-green-100 transition-all cursor-pointer"
              >
                <ShieldCheck size={16} />
                تحقق من الطلب
              </button>
            )}
          </div>

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
            <DataCard data={details.cumulativeData} onVerifyUuid={handleVerifyUuid} onViewDetails={handleViewDetails} />
          </div>
        </div>
      )}

      <VerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        result={verifyResult}
        isLoading={isVerifying}
      />

      <Modal
        open={showMismatchModal}
        title="الرقم الوطني لا يتطابق مع هذا الطلب"
        onClose={() => setShowMismatchModal(false)}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowMismatchModal(false)}
              className="px-4 py-2 rounded-xl border border-[var(--color-outine)] bg-transparent font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleMismatchResubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-action)] px-4 py-2 font-semibold text-white hover:opacity-90 transition-all cursor-pointer"
            >
              إعادة البحث
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-sub-text)]">
            هذا الطلب يشير إلى معاملة مرجعية تابعة لمواطن آخر، الرجاء إدخال الرقم الوطني الصحيح لعرض تفاصيلها.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">الرقم الوطني</label>
            <input
              type="text"
              value={mismatchNationalId}
              onChange={e => setMismatchNationalId(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleMismatchResubmit();
              }}
              placeholder="الرقم الوطني للمواطن"
              className="w-full rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-action)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">معرف الطلب المرجعي</label>
            <input
              type="text"
              value={mismatchRequestId}
              readOnly
              disabled
              className="w-full rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-3 text-sm font-mono outline-none opacity-60"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
