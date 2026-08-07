import { useEffect } from 'react';
import { PrivacyContent, TermsContent } from '@/components/legal/legalContent';

/**
 * In-place legal overlay — keeps auth forms mounted so filled data is not lost.
 * doc: 'terms' | 'privacy' | null
 */
const LegalModal = ({ doc, onClose, onSwitch }) => {
  useEffect(() => {
    if (!doc) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [doc, onClose]);

  if (!doc) return null;

  const title = doc === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close legal document"
        className="absolute inset-0 bg-on-background/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="relative z-10 w-full sm:max-w-2xl max-h-[88vh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-[0_16px_48px_rgba(19,27,46,0.18)]"
      >
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-3 border-b border-outline-variant/30 shrink-0">
          <div className="min-w-0">
            <p className="font-label-caps text-label-caps text-outline uppercase mb-1">Temporary draft</p>
            <h2 id="legal-modal-title" className="font-headline-md text-headline-md text-on-surface">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-variant/50 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar px-5 sm:px-6 py-5 flex-1 min-h-0">
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
            Last updated: August 7, 2026. This page is a placeholder for Nexora and may change before production launch.
          </p>
          {doc === 'privacy' ? (
            <PrivacyContent onOpenTerms={() => onSwitch?.('terms')} />
          ) : (
            <TermsContent onOpenPrivacy={() => onSwitch?.('privacy')} />
          )}
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-outline-variant/30 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto sm:min-w-[140px] bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-caps text-label-caps py-2.5 px-5 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
