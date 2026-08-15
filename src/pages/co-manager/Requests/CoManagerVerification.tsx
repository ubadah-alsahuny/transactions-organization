import { Search } from 'lucide-react';
import { useState } from 'react';
import VerificationModal from '../../../components/verification/VerificationModal';
import { Toast } from '../../../components/common/Toast';
import sectionStyles from '../../../components/layout/section.module.css';
import { verificationService } from '../../../services/verification.service';
import type { VerificationResult } from '../../../types/verification.types';

export default function CoManagerVerification() {
  const [requestId, setRequestId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    const trimmed = requestId.trim();
    if (!trimmed) {
      Toast.error('الرجاء إدخال معرف الطلب');
      return;
    }

    setIsVerifying(true);
    setShowModal(true);
    setVerifyResult(null);

    try {
      const data = await verificationService.verifyBlockchainRequest(trimmed);
      if (data.success) {
        if (data.data.verification.status === 'failed' && data.data.request.status !== 'completed') {
          setShowModal(false);
          Toast.error('الطلب غير مكتمل');
          return;
        }
        setVerifyResult(data.data);
      } else {
        Toast.error(data.error ?? 'فشل التحقق');
        setShowModal(false);
      }
    } catch (err: any) {
      setShowModal(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerify();
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>التحقق من صحة المعاملة</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-[500px]">
          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-6">
            <div className="mb-4 text-sm text-[var(--color-sub-text)]">
              أدخل معرف الطلب للتحقق من صحته عبر سلسلة الكتل
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={requestId}
                onChange={e => setRequestId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="معرف الطلب"
                className="flex-1 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-action)]"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-5 py-3 font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search size={16} />
                )}
                تحقق
              </button>
            </div>
          </div>
        </div>
      </div>

      <VerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        result={verifyResult}
        isLoading={isVerifying}
      />
    </div>
  );
}
