import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useStoreConnection } from '@/contexts/StoreConnectionContext';
import {
  clearTikTokConnectPromptDismiss,
  dismissTikTokConnectPrompt,
  isTikTokConnectPromptDismissed,
} from '@/utils/tiktokConnectPrompt';

/**
 * Post-login onboarding when the user has zero connected shops.
 * Session-dismissible; reopens after the last shop is disconnected (new eligibility).
 * Opens the existing ConnectStoreModal — does not invent a separate connect path.
 */
const TikTokConnectPrompt = () => {
  const userId = useSelector((s) => s.auth?.user?.id);
  const isAuthenticated = useSelector((s) => Boolean(s.auth?.isAuthenticated && s.auth?.token));
  const { loadStatus, openConnectModal, isConnected, stores, isModalOpen } = useStoreConnection();
  const [open, setOpen] = useState(false);
  const prevShopCount = useRef(stores.length);
  const dialogRef = useRef(null);

  // After disconnecting the final shop, allow the prompt again this session.
  useEffect(() => {
    if (prevShopCount.current > 0 && stores.length === 0 && userId) {
      clearTikTokConnectPromptDismiss(userId);
    }
    prevShopCount.current = stores.length;
  }, [stores.length, userId]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setOpen(false);
      return;
    }
    // Wait until integrations have loaded — avoid flash before shop count is known.
    if (loadStatus === 'loading' || loadStatus === 'idle') return;
    if (isConnected) {
      setOpen(false);
      return;
    }
    // Don't stack on top of the connect form.
    if (isModalOpen) {
      setOpen(false);
      return;
    }
    if (isTikTokConnectPromptDismissed(userId)) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [isAuthenticated, userId, loadStatus, isConnected, isModalOpen]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        dismissTikTokConnectPrompt(userId);
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    dialogRef.current?.querySelector('button')?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, userId]);

  if (!open) return null;

  const onLater = () => {
    dismissTikTokConnectPrompt(userId);
    setOpen(false);
  };

  const onConnect = () => {
    dismissTikTokConnectPrompt(userId);
    setOpen(false);
    openConnectModal('TikTok Shop');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={onLater} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tiktok-connect-prompt-title"
        aria-describedby="tiktok-connect-prompt-desc"
        className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30"
      >
        <button
          type="button"
          onClick={onLater}
          className="absolute top-3 right-3 p-2 rounded-lg text-on-surface-variant hover:bg-surface-variant/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="p-6 border-b border-outline-variant/20 flex items-center gap-4 bg-surface/50 pr-12">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>
          <div>
            <h3 id="tiktok-connect-prompt-title" className="text-headline-md text-on-background leading-tight">
              Connect Your TikTok Shop
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5">You&apos;re almost ready to start using Nexora.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p id="tiktok-connect-prompt-desc" className="text-body-md text-on-surface">
            Connect your TikTok Shop to manage your products, orders, inventory and analytics in one place.
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Nexora uses the project&apos;s sandbox-style shop connection for development and demos. Production TikTok
            Partner OAuth is planned for a later release.
          </p>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
            <button
              type="button"
              onClick={onLater}
              className="px-5 py-2.5 rounded-lg border border-outline-variant/50 text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={onConnect}
              className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                link
              </span>
              Connect TikTok Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokConnectPrompt;
