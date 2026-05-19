import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export default function Modal({ open, title, children, onClose, footer }: ModalProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }

    setIsVisible(false);
    const t = window.setTimeout(() => setShouldRender(false), 200);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!shouldRender) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, shouldRender]);

  if (!shouldRender) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      <div
        className={[
          'absolute inset-0 bg-black/50 transition-opacity duration-200',
          isVisible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
        role="presentation"
      />
      <div className="absolute inset-0 flex items-center justify-center px-4 py-8">
        <div
          className={[
            'flex max-h-[calc(100vh-4rem)] w-full max-w-xl flex-col rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] text-[var(--color-text)] shadow-[rgba(0,0,0,0.2)_0_1rem_2rem] transition-all duration-200',
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.98]',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-4 border-b border-[var(--color-outine)] px-6 py-4">
            <div className="min-w-0">
              {title ? <div className="truncate text-lg font-bold">{title}</div> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer ? (
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--color-outine)] px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
