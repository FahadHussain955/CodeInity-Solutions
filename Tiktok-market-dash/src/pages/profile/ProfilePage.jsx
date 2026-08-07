import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import FilterTabs from '@/components/ui/FilterTabs';

const TABS = [
  { key: 'Overview', label: 'Overview' },
  { key: 'Activity', label: 'Activity' },
  { key: 'Security', label: 'Security' },
];

const ProfilePage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('Enterprise User');
  const [email, setEmail] = useState('user@nexora.com');
  const [phone, setPhone] = useState('+92 300 0000000');
  const [role, setRole] = useState('Admin');

  const inputClass = 'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm disabled:opacity-60';

  const activity = [
    { action: 'Added new product "Aura Pro Headphones"', time: '2h ago', icon: 'add_box' },
    { action: 'Updated order ORD-1041 status to Processing', time: '4h ago', icon: 'autorenew' },
    { action: 'Exported customer list (284 records)', time: '1d ago', icon: 'download' },
    { action: 'Integrated Stripe payment gateway', time: '2d ago', icon: 'extension' },
    { action: 'Changed store currency to USD', time: '4d ago', icon: 'settings' },
  ];

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-on-surface-variant mb-2">
          <span className="text-label-caps uppercase tracking-wider">Account</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-label-caps uppercase tracking-wider text-primary">Profile</span>
        </div>
        <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">My Profile</h2>
      </div>

      {/* Profile Hero Card */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-primary via-primary/80 to-secondary/70 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
        </div>
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-8">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-xl bg-primary-container border-4 border-surface flex items-center justify-center text-on-primary-container text-[32px] font-bold shrink-0 shadow-sm">
                E
              </div>
              <div className="pb-1">
                <h3 className="text-headline-md text-on-background">{name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-body-sm text-on-surface-variant">{role}</span>
                  <span className="w-1 h-1 rounded-full bg-outline" />
                  <span className="inline-flex items-center gap-1 text-label-caps text-success">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Verified
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing((e) => !e)}
                className="toolbar-control flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">{editing ? 'close' : 'edit'}</span>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                onClick={() => { logout(); navigate(ROUTES.LOGIN); }}
                className="toolbar-control flex items-center gap-2 bg-error-container text-on-error-container px-4 rounded-lg text-body-sm font-medium hover:bg-error/10 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <FilterTabs tabs={TABS} value={tab} onChange={setTab} />

      {/* Overview Tab */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Edit Form */}
          <div className="xl:col-span-2 glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-5">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Full Name</label>
                  <input disabled={!editing} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Role</label>
                  <input disabled value={role} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Email Address</label>
                <input disabled={!editing} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Phone Number</label>
                <input disabled={!editing} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
              {editing && (
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditing(false)} className="px-6 py-2.5 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors">Discard</button>
                  <button onClick={() => setEditing(false)} className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">Save Changes</button>
                </div>
              )}
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="space-y-4">
            {[
              { label: 'Products Managed', value: '98', icon: 'inventory_2' },
              { label: 'Orders Processed', value: '1,284', icon: 'shopping_cart' },
              { label: 'Customers Served', value: '3,942', icon: 'group' },
              { label: 'Revenue Generated', value: '$84.3K', icon: 'payments' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="glass-panel rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <div>
                  <p className="text-label-caps text-on-surface-variant uppercase">{label}</p>
                  <p className="text-headline-md font-bold text-on-background">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {tab === 'Activity' && (
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-headline-md text-on-background mb-6">Recent Activity</h3>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-outline-variant/30" />
            <div className="space-y-6">
              {activity.map(({ action, time, icon }) => (
                <div key={action} className="flex items-start gap-4 relative">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 z-10">
                    <span className="material-symbols-outlined text-[16px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div className="pt-2.5">
                    <p className="text-body-sm text-on-surface">{action}</p>
                    <p className="text-label-caps text-outline mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'Security' && (
        <div className="glass-panel rounded-xl p-6 space-y-6">
          <h3 className="text-headline-md text-on-background">Account Security</h3>
          <div className="max-w-sm space-y-4">
            {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
              <div key={label}>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">{label}</label>
                <input type="password" className={inputClass} placeholder="••••••••" />
              </div>
            ))}
            <button className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm w-full">Update Password</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
