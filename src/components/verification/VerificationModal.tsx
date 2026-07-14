import { ShieldCheck, ShieldX, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { VerificationResult } from '../../types/verification.types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult | null;
  isLoading: boolean;
};

export default function VerificationModal({ isOpen, onClose, result, isLoading }: Props) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-1000 overflow-y-auto bg-black/40"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="w-full max-w-[600px] rounded-3xl bg-white p-5 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">التحقق من صحة المعاملة</h2>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-action)] border-t-transparent" />
              <span className="mr-3 text-gray-500">جارٍ التحقق...</span>
            </div>
          ) : result ? (
            <>
              <div
                className={`mb-3 flex items-center gap-3 rounded-2xl p-3 ${result.verification.status === 'verified'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
                  }`}
              >
                {result.verification.status === 'verified' ? (
                  <ShieldCheck size={28} />
                ) : (
                  <ShieldX size={28} />
                )}
                <div>
                  <div className="text-lg font-bold">
                    {result.verification.status === 'verified'
                      ? 'المعاملة موثقة ✓'
                      : 'فشل التحقق ✗'}
                  </div>
                  <div className="text-sm opacity-80">
                    {result.verification.status === 'verified'
                      ? 'جميع فحوصات سلسلة الكتل ناجحة'
                      : 'بعض فحوصات سلسلة الكتل فشلت'}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="mb-1.5 text-sm font-bold text-gray-500">الفحوصات</div>
                <div className="space-y-1">
                  {result.verification.checks.map(check => (
                    <div
                      key={check.key}
                      className={`flex items-center justify-between rounded-xl px-3 py-1.5 text-sm ${check.passed ? 'bg-green-50' : 'bg-red-50'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={check.passed ? 'text-green-600' : 'text-red-600'}>
                          {check.passed ? '✓' : '✗'}
                        </span>
                        <span className={check.passed ? 'text-green-800' : 'text-red-800'}>
                          {check.label}
                        </span>
                      </div>
                      <span className={`text-xs ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {check.value || ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {result.verification.issues.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5 text-sm font-bold text-gray-500">المشكلات</div>
                  <div className="space-y-1">
                    {result.verification.issues.map((issue, idx) => (
                      <div
                        key={`${issue.code}-${idx}`}
                        className="rounded-xl bg-red-50 px-3 py-1.5 text-sm text-red-700"
                      >
                        <span className="font-bold">{issue.code}</span>: {issue.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-400">
                سلسلة الكتل: {result.chain.isValid ? 'سليمة' : 'غير سليمة'} | أحداث الإثبات:{' '}
                {result.chain.proofEventsCount}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-500">حدث خطأ أثناء التحقق</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
