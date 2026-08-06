import { useState, useEffect } from 'react';
import { useStoreConnection } from '@/contexts/StoreConnectionContext';

const ConnectStoreModal = () => {
  const { isModalOpen, activePlatform, closeConnectModal, connectStore } = useStoreConnection();
  
  const [storeUrl, setStoreUrl] = useState('');
  const [storeName, setStoreName] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error, success
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      setStoreUrl('');
      setStoreName('');
      setApiToken('');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!storeUrl || !storeName) {
      setStatus('error');
      setErrorMsg('Store URL and Name are required.');
      return;
    }

    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      // Simulate random error sometimes, or just succeed
      if (storeUrl.includes('error')) {
        setStatus('error');
        setErrorMsg('Failed to connect to the store. Please check your credentials.');
      } else {
        setStatus('success');
        connectStore({
          platform: activePlatform,
          name: storeName,
          url: storeUrl,
          connectedAt: new Date().toISOString(),
        });
        setTimeout(() => {
          closeConnectModal();
        }, 1500);
      }
    }, 1200);
  };

  const inputClass = 'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" 
        onClick={() => status !== 'loading' && closeConnectModal()}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-center gap-4 bg-surface/50">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
            {activePlatform === 'Shopify' && <span className="text-[24px]">🛍️</span>}
            {activePlatform === 'TikTok Shop' && <span className="text-[24px]">🎵</span>}
            {activePlatform === 'WooCommerce' && <span className="text-[24px]">🛒</span>}
          </div>
          <div>
            <h3 className="text-headline-md text-on-background leading-tight">Connect {activePlatform}</h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5">Enter your store details to sync.</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <h4 className="text-body-lg font-semibold text-on-surface">Connection Successful!</h4>
              <p className="text-body-sm text-on-surface-variant mt-1">Your store is now connected and syncing.</p>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Store URL</label>
                <input 
                  type="text" 
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="e.g. mystore.myshopify.com" 
                  className={inputClass} 
                  disabled={status === 'loading'}
                />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Store Name</label>
                <input 
                  type="text" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. My Awesome Store" 
                  className={inputClass} 
                  disabled={status === 'loading'}
                />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">API Token / Credentials (Optional)</label>
                <input 
                  type="password" 
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="••••••••••••••••" 
                  className={inputClass} 
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && (
                <div className="p-3 rounded-lg bg-error-container/50 border border-error/20 flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <p className="text-body-sm text-on-error-container">{errorMsg}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10 mt-6">
                <button 
                  type="button" 
                  onClick={closeConnectModal}
                  disabled={status === 'loading'}
                  className="px-5 py-2.5 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Connecting...
                    </>
                  ) : (
                    'Connect'
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
