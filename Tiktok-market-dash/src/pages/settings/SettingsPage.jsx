import { useState } from 'react';
import { useStoreConnection } from '@/contexts/StoreConnectionContext';

const SECTIONS = [
  { key: 'store', label: 'Store Details', icon: 'storefront' },
  { key: 'billing', label: 'Billing & Plan', icon: 'credit_card' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications' },
  { key: 'integrations', label: 'Integrations', icon: 'extension' },
  { key: 'security', label: 'Security', icon: 'lock' },
];

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SettingsPage = () => {
  const [active, setActive] = useState('store');
  const [storeName, setStoreName] = useState('Nexora Enterprise');
  const [storeUrl, setStoreUrl] = useState('nexora-enterprise.myshopify.com');
  const [currency, setCurrency] = useState('USD');
  const [notifs, setNotifs] = useState({ orders: true, inventory: true, customers: false, marketing: true });

  const { isConnected, storeDetails, openConnectModal, disconnectStore } = useStoreConnection();

  const inputClass = 'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm';

  const integrationOptions = [
    { name: 'Shopify', desc: 'Sync products and orders seamlessly.', icon: '🛍️', comingSoon: false },
    { name: 'TikTok Shop', desc: 'Manage your TikTok storefront.', icon: '🎵', comingSoon: false },
    { name: 'WooCommerce', desc: 'Connect your WordPress store.', icon: '🛒', comingSoon: true },
  ];

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-on-surface-variant mb-2">
          <span className="text-label-caps uppercase tracking-wider">Account</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-label-caps uppercase tracking-wider text-primary">Settings</span>
        </div>
        <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Settings</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="glass-panel rounded-xl p-3 space-y-1 h-fit">
          {SECTIONS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm transition-colors ${
                active === key
                  ? 'bg-primary-container text-on-primary-container font-medium'
                  : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" style={active === key ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Store Details */}
          {active === 'store' && (
            <>
              <div className="glass-panel rounded-xl p-6">
                <h3 className="text-headline-md text-on-background mb-5">Store Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Store Name</label>
                      <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Store URL</label>
                      <input value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                        {['USD', 'EUR', 'GBP', 'PKR', 'AED'].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Timezone</label>
                      <select className={inputClass}>
                        <option>Asia/Karachi (PKT)</option>
                        <option>UTC</option>
                        <option>America/New_York</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Store Description</label>
                    <textarea rows={3} className={inputClass + ' resize-none'} defaultValue="Enterprise e-commerce powered by Nexora." />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button className="px-6 py-2.5 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors">Discard</button>
                <button className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">Save Changes</button>
              </div>
            </>
          )}

          {/* Notifications */}
          {active === 'notifications' && (
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-headline-md text-on-background mb-5">Notification Preferences</h3>
              <div className="space-y-5 divide-y divide-outline-variant/10">
                {[
                  { key: 'orders', label: 'New Orders', desc: 'Get notified when a new order is placed' },
                  { key: 'inventory', label: 'Low Stock Alerts', desc: 'Alert when products reach reorder point' },
                  { key: 'customers', label: 'New Customers', desc: 'Notify on new customer registrations' },
                  { key: 'marketing', label: 'Marketing Reports', desc: 'Weekly performance report emails' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between pt-5 first:pt-0">
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{label}</p>
                      <p className="text-label-caps text-on-surface-variant mt-0.5">{desc}</p>
                    </div>
                    <Toggle
                      checked={notifs[key]}
                      onChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations */}
          {active === 'integrations' && (
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="p-6 border-b border-outline-variant/20">
                <h3 className="text-headline-md text-on-background">Connected Integrations</h3>
                <p className="text-body-sm text-on-surface-variant mt-1">Manage your connected stores and platforms.</p>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {integrationOptions.map(({ name, desc, icon, comingSoon }) => {
                  const isThisConnected = isConnected && storeDetails?.platform === name;

                  return (
                    <div key={name} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-[24px] shrink-0 border border-outline-variant/20 shadow-sm">{icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-body-md font-semibold text-on-surface">{name}</p>
                            {isThisConnected && (
                              <span className="flex items-center gap-1 text-label-caps text-success bg-success-bg border border-success-border px-2 py-0.5 rounded-full">
                                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                Connected
                              </span>
                            )}
                            {comingSoon && (
                              <span className="text-label-caps text-outline bg-surface-container px-2 py-0.5 rounded-full">Coming Soon</span>
                            )}
                          </div>
                          <p className="text-body-sm text-on-surface-variant mt-0.5">{desc}</p>
                          
                          {isThisConnected && (
                            <div className="mt-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center gap-6">
                              <div>
                                <p className="text-label-caps text-outline uppercase tracking-wider mb-0.5">Store Details</p>
                                <p className="text-body-sm font-medium text-on-surface">{storeDetails.name}</p>
                                <p className="text-[11px] text-on-surface-variant">{storeDetails.url}</p>
                              </div>
                              <div className="hidden sm:block w-px h-8 bg-outline-variant/20" />
                              <div className="hidden sm:block">
                                <p className="text-label-caps text-outline uppercase tracking-wider mb-0.5">Last Sync</p>
                                <p className="text-body-sm text-on-surface">Just now</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        {isThisConnected ? (
                          <div className="flex items-center gap-2 w-full">
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-outline-variant/50 rounded-lg text-body-sm font-medium text-on-surface hover:bg-surface-variant/30 transition-colors shadow-sm">
                              <span className="material-symbols-outlined text-[18px]">sync</span>
                              Sync Now
                            </button>
                            <button 
                              onClick={disconnectStore}
                              className="flex items-center justify-center p-2 border border-error/30 text-error rounded-lg hover:bg-error-container/50 transition-colors"
                              title="Disconnect Store"
                            >
                              <span className="material-symbols-outlined text-[18px]">link_off</span>
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => !comingSoon && openConnectModal(name)}
                            disabled={comingSoon}
                            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-body-sm font-medium transition-colors shadow-sm ${
                              comingSoon
                                ? 'bg-surface-container-high text-outline cursor-not-allowed'
                                : 'bg-primary text-on-primary hover:bg-surface-tint'
                            }`}
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security */}
          {active === 'security' && (
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-headline-md text-on-background mb-5">Security Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-body-md font-semibold text-on-surface mb-4">Change Password</h4>
                  <div className="space-y-3 max-w-sm">
                    {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                      <div key={label}>
                        <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">{label}</label>
                        <input type="password" className={inputClass} placeholder="••••••••" />
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">Update Password</button>
                </div>
                <div className="border-t border-outline-variant/20 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">Two-Factor Authentication</p>
                      <p className="text-label-caps text-on-surface-variant mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <Toggle checked={false} onChange={() => {}} />
                  </div>
                </div>
                <div className="border-t border-outline-variant/20 pt-6">
                  <p className="text-body-sm font-semibold text-on-surface mb-3">Active Sessions</p>
                  {[
                    { device: 'Chrome on Windows', location: 'Islamabad, PK', time: 'Active now', current: true },
                    { device: 'Safari on iPhone', location: 'Lahore, PK', time: '2 days ago', current: false },
                  ].map(({ device, location, time, current }) => (
                    <div key={device} className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant">{device.includes('iPhone') ? 'smartphone' : 'computer'}</span>
                        <div>
                          <p className="text-body-sm font-medium text-on-surface">{device}</p>
                          <p className="text-label-caps text-outline">{location} · {time}</p>
                        </div>
                      </div>
                      {current ? (
                        <span className="text-label-caps text-success bg-success-bg px-2 py-0.5 rounded-full border border-success-border">Current</span>
                      ) : (
                        <button className="text-body-sm text-error hover:underline">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other placeholders */}
          {['billing'].includes(active) && (
            <div className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  credit_card
                </span>
              </div>
              <h3 className="text-headline-md text-on-background mb-2">Billing & Plan</h3>
              <p className="text-body-sm text-on-surface-variant max-w-xs">
                Manage your subscription plan and billing details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
