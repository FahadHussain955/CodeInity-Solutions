import { useState, useEffect, useRef } from 'react';
import { useStoreConnection } from '@/contexts/StoreConnectionContext';

const ConnectStoreModal = () => {
  const { isModalOpen, activePlatform, closeConnectModal, connectStore } = useStoreConnection();

  const [storeUrl, setStoreUrl] = useState('');
  const [storeName, setStoreName] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error, success
  const [errorMsg, setErrorMsg] = useState('');
  const submittingRef = useRef(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isModalOpen) {
      setStoreUrl('');
      setStoreName('');
      setApiToken('');
      setStatus('idle');
      setErrorMsg('');
      submittingRef.current = false;
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && status !== 'loading') {
        closeConnectModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen, status, closeConnectModal]);

  if (!isModalOpen) return null;

  const handleConnect = async (e) => {
    e.preventDefault();
    if (submittingRef.current || status === 'loading') return;

    if (!storeUrl.trim() || !storeName.trim()) {
      setStatus('error');
      setErrorMsg('Store URL and Name are required.');
      return;
    }

    submittingRef.current = true;
    setStatus('loading');
    setErrorMsg('');

    try {
      await connectStore({
        platform: activePlatform || 'TikTok Shop',
        name: storeName.trim(),
        url: storeUrl.trim(),
        apiToken: apiToken.trim() || undefined,
      });
      setStatus('success');
      setTimeout(() => {
        closeConnectModal();
      }, 1200);
    } catch (error) {
      setStatus('error');
      setErrorMsg(error.message || 'Failed to connect to the store. Please check your details and try again.');
      submittingRef.current = false;
    }
  };

  const inputClass =
    'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm disabled:opacity-60';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
        onClick={() => status !== 'loading' && closeConnectModal()}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-store-title"
        className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30 flex flex-col"
      >
        <div className="p-6 border-b border-outline-variant/20 flex items-center gap-4 bg-surface/50">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="connect-store-title" className="text-headline-md text-on-background leading-tight">
              Connect {activePlatform || 'TikTok Shop'}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Link your shop using Nexora&apos;s existing connection flow.
            </p>
          </div>
          {status !== 'loading' && (
            <button
              type="button"
              onClick={closeConnectModal}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-variant/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-success-bg text-success flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <h4 className="text-body-lg font-semibold text-on-surface">Connected successfully.</h4>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Your shop is now available in Nexora. You can switch shops from the navbar.
              </p>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label htmlFor="connect-store-url" className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Store URL
                </label>
                <input
                  id="connect-store-url"
                  type="text"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="e.g. yourshop.tiktok.com"
                  className={inputClass}
                  disabled={status === 'loading'}
                  autoComplete="url"
                />
              </div>
              <div>
                <label htmlFor="connect-store-name" className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Store Name
                </label>
                <input
                  id="connect-store-name"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. My TikTok Shop"
                  className={inputClass}
                  disabled={status === 'loading'}
                  autoComplete="organization"
                />
              </div>
              <div>
                <label htmlFor="connect-store-token" className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  TikTok Shop API Token (Optional)
                </label>
                <input
                  id="connect-store-token"
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="••••••••••••••••"
                  className={inputClass}
                  disabled={status === 'loading'}
                  autoComplete="off"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 rounded-lg bg-error-container/50 border border-error/20 flex items-start gap-2" role="alert">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <p className="text-body-sm text-on-error-container">{errorMsg}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10 mt-6">
                <button
                  type="button"
                  onClick={closeConnectModal}
                  disabled={status === 'loading'}
                  className="px-5 py-2.5 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]" aria-hidden="true">
                        progress_activity
                      </span>
                      Connecting...
                    </>
                  ) : (
                    'Connect TikTok Shop'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectStoreModal;
