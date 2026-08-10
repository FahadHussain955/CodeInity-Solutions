import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreConnection } from '@/contexts/StoreConnectionContext';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/services/settingsService';
import { authService } from '@/services/authService';
import { integrationsService } from '@/services/integrationsService';
import { ROUTES } from '@/constants/routes';

const SECTIONS = [
  { key: 'store', label: 'Store Details', icon: 'storefront' },
  { key: 'billing', label: 'Billing & Plan', icon: 'credit_card' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications' },
  { key: 'integrations', label: 'Integrations', icon: 'extension' },
  { key: 'security', label: 'Security', icon: 'lock' },
];

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const TIMEZONES = ['Asia/Karachi', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai'];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [active, setActive] = useState('store');
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [description, setDescription] = useState('');
  const [notifs, setNotifs] = useState({
    orders: true,
    inventory: true,
    customers: false,
    marketing: true,
    campaign: true,
    ai: true,
    email: true,
  });
  const [billing, setBilling] = useState(null);
  const [securityInfo, setSecurityInfo] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);

  const { openConnectModal, disconnectStore, syncStore, getStoreForPlatform, getStoresForPlatform, stores } =
    useStoreConnection();
  const [syncingId, setSyncingId] = useState(null);
  const [integrationNotice, setIntegrationNotice] = useState(null);

  const inputClass = 'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm';

  const integrationOptions = [
    { name: 'TikTok Shop', desc: 'Connect your TikTok Marketplace storefront.', icon: '🎵', comingSoon: false },
    { name: 'Shopify', desc: 'Sync products and orders seamlessly.', icon: '🛍️', comingSoon: true },
    { name: 'WooCommerce', desc: 'Connect your WordPress store.', icon: '🛒', comingSoon: true },
  ];

  const loadSettings = async () => {
    try {
      const data = await settingsService.get();
      const store = data?.store || data;
      setStoreName(store.storeName || '');
      setStoreUrl(store.storeUrl || '');
      setBusinessName(store.businessName || '');
      setContactEmail(store.contactEmail || '');
      setContactPhone(store.contactPhone || '');
      setAddressLine1(store.addressLine1 || '');
      setAddressLine2(store.addressLine2 || '');
      setCity(store.city || '');
      setCountry(store.country || 'Pakistan');
      setCurrency(store.currency || 'USD');
      setTimezone(store.timezone || 'Asia/Karachi');
      setDescription(store.description || '');
      if (data?.notifications) setNotifs((p) => ({ ...p, ...data.notifications }));
      if (data?.billing) setBilling(data.billing);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (active === 'billing') {
      settingsService.billing().then(setBilling).catch((e) => setError(e.message));
    }
    if (active === 'security') {
      settingsService.security().then(setSecurityInfo).catch((e) => setError(e.message));
    }
    if (active === 'integrations') {
      const tiktok = getStoreForPlatform('TikTok Shop');
      if (tiktok?.id) loadSyncHistory(tiktok.id);
      else setSyncLogs([]);
    }
  }, [active]);

  const saveStore = async () => {
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateStore({
        storeName,
        storeUrl,
        businessName,
        contactEmail,
        contactPhone,
        addressLine1,
        addressLine2,
        city,
        country,
        currency,
        timezone,
        description,
      });
      setNotice('Store settings saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveNotifs = async (next) => {
    setNotifs(next);
    try {
      await settingsService.updateNotifications(next);
      setNotice('Notification preferences saved.');
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePassword = async () => {
    if (passwordForm.next !== passwordForm.confirm) {
      setError('New passwords do not match.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setNotice('Password updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadSyncHistory = async (storeId) => {
    try {
      const data = await integrationsService.syncLogs(storeId, { limit: 5 });
      setSyncLogs(data?.items || []);
    } catch {
      setSyncLogs([]);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <div className="flex items-center gap-2 text-on-surface-variant mb-2">
          <span className="text-label-caps uppercase tracking-wider">Account</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-label-caps uppercase tracking-wider text-primary">Settings</span>
        </div>
        <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Settings</h2>
      </div>

      {(notice || error) && (
        <div className={`rounded-lg border px-4 py-3 text-body-sm ${error ? 'border-error/30 bg-error-container text-on-error-container' : 'border-success-border bg-success-bg text-success'}`}>
          {error || notice}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="glass-panel rounded-xl p-3 space-y-1 h-fit">
          {SECTIONS.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setActive(key); setNotice(null); setError(null); }}
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

        <div className="xl:col-span-3 space-y-6">
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
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
                        {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Store Description</label>
                    <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + ' resize-none'} />
                  </div>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6">
                <h3 className="text-headline-md text-on-background mb-5">Business & Contact</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Business Name</label>
                      <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Contact Email</label>
                      <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Contact Phone</label>
                    <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Address Line 1</label>
                    <input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Address Line 2</label>
                    <input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">City</label>
                      <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Country</label>
                      <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={loadSettings} className="px-6 py-2.5 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors">Discard</button>
                <button type="button" disabled={saving} onClick={saveStore} className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </>
          )}

          {active === 'notifications' && (
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-headline-md text-on-background mb-5">Notification Preferences</h3>
              <div className="space-y-5 divide-y divide-outline-variant/10">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive important updates by email' },
                  { key: 'orders', label: 'New Orders', desc: 'Get notified when a new order is placed' },
                  { key: 'campaign', label: 'Campaign Notifications', desc: 'Updates on campaign status and performance' },
                  { key: 'ai', label: 'AI Recommendation Notifications', desc: 'Alerts when new AI insights are ready' },
                  { key: 'customers', label: 'New Customers', desc: 'Notify on new customer registrations' },
                  { key: 'marketing', label: 'Marketing Reports', desc: 'Weekly performance report emails' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between pt-5 first:pt-0">
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{label}</p>
                      <p className="text-label-caps text-on-surface-variant mt-0.5">{desc}</p>
                    </div>
                    <Toggle
                      checked={Boolean(notifs[key])}
                      onChange={(v) => saveNotifs({ ...notifs, [key]: v })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 'integrations' && (
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-headline-md text-on-background">Connected Shops</h3>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Connect multiple TikTok shops and switch between them in the navbar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openConnectModal('TikTok Shop')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-body-sm font-medium bg-primary text-on-primary hover:bg-surface-tint transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  {stores.length > 0 ? 'Connect Another Shop' : 'Connect TikTok Shop'}
                </button>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {integrationOptions.map(({ name, desc, icon, comingSoon }) => {
                  const platformStores = comingSoon ? [] : getStoresForPlatform(name);
                  const isThisConnected = platformStores.length > 0;
                  return (
                    <div key={name} className="p-6 flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-[24px] shrink-0 border border-outline-variant/20 shadow-sm">{icon}</div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-body-md font-semibold text-on-surface">{name}</p>
                              {isThisConnected && (
                                <span className="flex items-center gap-1 text-label-caps text-success bg-success-bg border border-success-border px-2 py-0.5 rounded-full">
                                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                  {platformStores.length} connected
                                </span>
                              )}
                              {comingSoon && (
                                <span className="text-label-caps text-outline bg-surface-container px-2 py-0.5 rounded-full">Coming Soon</span>
                              )}
                            </div>
                            <p className="text-body-sm text-on-surface-variant mt-0.5">{desc}</p>
                          </div>
                        </div>
                        {!comingSoon && !isThisConnected && (
                          <button
                            type="button"
                            onClick={() => openConnectModal(name)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-body-sm font-medium bg-primary text-on-primary hover:bg-surface-tint transition-colors shadow-sm"
                          >
                            Connect
                          </button>
                        )}
                        {comingSoon && (
                          <button
                            type="button"
                            disabled
                            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-body-sm font-medium bg-surface-container-high text-outline cursor-not-allowed"
                          >
                            Connect
                          </button>
                        )}
                      </div>

                      {isThisConnected && (
                        <div className="space-y-3">
                          {platformStores.map((shop) => (
                            <div
                              key={shop.id}
                              className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div>
                                <p className="text-body-sm font-medium text-on-surface">{shop.name || shop.storeName}</p>
                                <p className="text-[11px] text-on-surface-variant">{shop.url || shop.storeUrl}</p>
                                <p className="text-[11px] text-on-surface-variant mt-1">
                                  Last sync: {shop.lastSyncLabel || shop.lastSync || 'Never'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  disabled={syncingId === shop.id}
                                  onClick={async () => {
                                    try {
                                      setSyncingId(shop.id);
                                      await syncStore(shop.id);
                                      setIntegrationNotice('Store synced successfully.');
                                      await loadSyncHistory(shop.id);
                                    } catch (err) {
                                      setIntegrationNotice(err.message || 'Sync failed.');
                                    } finally {
                                      setSyncingId(null);
                                    }
                                  }}
                                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-outline-variant/50 rounded-lg text-body-sm font-medium text-on-surface hover:bg-surface-variant/30 transition-colors shadow-sm disabled:opacity-60"
                                >
                                  <span className={`material-symbols-outlined text-[18px] ${syncingId === shop.id ? 'animate-spin' : ''}`}>sync</span>
                                  {syncingId === shop.id ? 'Syncing…' : 'Sync'}
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!window.confirm(`Disconnect ${shop.name || shop.storeName}?`)) return;
                                    try {
                                      await disconnectStore(shop.id);
                                      setIntegrationNotice('Store disconnected.');
                                      setSyncLogs([]);
                                    } catch (err) {
                                      setIntegrationNotice(err.message || 'Disconnect failed.');
                                    }
                                  }}
                                  className="flex items-center justify-center p-2 border border-error/30 text-error rounded-lg hover:bg-error-container/50 transition-colors"
                                  title="Disconnect Store"
                                >
                                  <span className="material-symbols-outlined text-[18px]">link_off</span>
                                </button>
                              </div>
                            </div>
                          ))}
                          {syncLogs.length > 0 && (
                            <div className="px-1">
                              <p className="text-label-caps text-outline uppercase mb-1">Recent Sync History</p>
                              <ul className="space-y-1">
                                {syncLogs.slice(0, 3).map((log) => (
                                  <li key={log.id} className="text-[11px] text-on-surface-variant">
                                    {log.status} · {log.message || 'Sync'} · {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {integrationNotice && (
                <div className="px-6 py-3 border-t border-outline-variant/10 text-body-sm text-on-surface-variant">{integrationNotice}</div>
              )}
            </div>
          )}

          {active === 'security' && (
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-headline-md text-on-background mb-5">Security Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-body-md font-semibold text-on-surface mb-4">Change Password</h4>
                  <div className="space-y-3 max-w-sm">
                    {[
                      ['current', 'Current Password'],
                      ['next', 'New Password'],
                      ['confirm', 'Confirm New Password'],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">{label}</label>
                        <input
                          type="password"
                          value={passwordForm[key]}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, [key]: e.target.value }))}
                          className={inputClass}
                          placeholder="••••••••"
                        />
                      </div>
                    ))}
                  </div>
                  <button type="button" disabled={saving} onClick={updatePassword} className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60">
                    Update Password
                  </button>
                </div>
                <div className="border-t border-outline-variant/20 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">Two-Factor Authentication</p>
                      <p className="text-label-caps text-on-surface-variant mt-0.5">Coming soon — architecture reserved</p>
                    </div>
                    <Toggle checked={false} onChange={() => {}} />
                  </div>
                </div>
                <div className="border-t border-outline-variant/20 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-body-sm font-semibold text-on-surface">Active Sessions</p>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await authService.logoutAll();
                          setNotice('Logged out from all devices. Please sign in again on other devices.');
                          const sec = await settingsService.security();
                          setSecurityInfo(sec);
                        } catch (err) {
                          setError(err.message);
                        }
                      }}
                      className="text-body-sm text-error hover:underline"
                    >
                      Logout all devices
                    </button>
                  </div>
                  {(securityInfo?.sessions || []).length === 0 && (
                    <p className="text-body-sm text-on-surface-variant">No tracked sessions yet.</p>
                  )}
                  {(securityInfo?.sessions || []).map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant">computer</span>
                        <div>
                          <p className="text-body-sm font-medium text-on-surface">{session.userAgent || 'Unknown device'}</p>
                          <p className="text-label-caps text-outline">{session.ip || '—'} · {session.lastSeenAt ? new Date(session.lastSeenAt).toLocaleString() : ''}</p>
                        </div>
                      </div>
                      {!session.revokedAt && (
                        <span className="text-label-caps text-success bg-success-bg px-2 py-0.5 rounded-full border border-success-border">Active</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t border-outline-variant/20 pt-6">
                  <p className="text-body-sm font-semibold text-on-surface mb-3">Login History</p>
                  {(securityInfo?.loginHistory || []).slice(0, 8).map((row) => (
                    <div key={row.id} className="flex justify-between py-2 border-b border-outline-variant/10 last:border-0 text-body-sm">
                      <span className="text-on-surface">{row.success ? 'Successful login' : 'Failed login'}</span>
                      <span className="text-on-surface-variant">{row.createdAt ? new Date(row.createdAt).toLocaleString() : ''}</span>
                    </div>
                  ))}
                  {!securityInfo?.loginHistory?.length && (
                    <p className="text-body-sm text-on-surface-variant">No login history yet.</p>
                  )}
                </div>
                <div className="border-t border-error/20 pt-6">
                  <p className="text-body-sm font-semibold text-error">Delete Account</p>
                  <p className="text-label-caps text-on-surface-variant mt-1 mb-3">
                    Soft-deletes your account. You will be signed out immediately.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm('Delete your account? This cannot be undone from the UI.')) return;
                      try {
                        await authService.deleteAccount();
                        logout();
                        navigate(ROUTES.LOGIN);
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                    className="px-6 py-2.5 border border-error/40 text-error rounded-lg text-body-sm font-medium hover:bg-error-container/50 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === 'billing' && (
            <div className="glass-panel rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-headline-md text-on-background mb-2">Billing & Plan</h3>
                <p className="text-body-sm text-on-surface-variant">Stripe billing is reserved for a future release.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-outline-variant/30">
                  <p className="text-label-caps text-on-surface-variant uppercase">Current Plan</p>
                  <p className="text-headline-md font-bold text-on-background mt-1">{billing?.planName || 'Growth'}</p>
                  <p className="text-body-sm text-success mt-1">{billing?.planStatus || 'Active'}</p>
                </div>
                <div className="p-4 rounded-xl border border-outline-variant/30">
                  <p className="text-label-caps text-on-surface-variant uppercase">Usage</p>
                  <p className="text-body-sm text-on-surface mt-2">Seats: {billing?.usage?.seats ?? 1}</p>
                  <p className="text-body-sm text-on-surface">Orders: {billing?.usage?.orders ?? 0}</p>
                  <p className="text-body-sm text-on-surface">Storage: {billing?.usage?.storageMb ?? 0} MB</p>
                </div>
                <div className="p-4 rounded-xl border border-outline-variant/30">
                  <p className="text-label-caps text-on-surface-variant uppercase">Billing History</p>
                  <p className="text-body-sm text-on-surface-variant mt-2">No invoices yet — placeholder for Stripe.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
