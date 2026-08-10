import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import FilterTabs from '@/components/ui/FilterTabs';
import UserAvatar from '@/components/ui/UserAvatar';
import { authService } from '@/services/authService';
import { activityService, uploadsService } from '@/services/settingsService';
import { fetchCurrentUser } from '@/features/auth/authSlice';
import { relativeTime } from '@/utils/dateHelpers';

const TABS = [
  { key: 'Overview', label: 'Overview' },
  { key: 'Activity', label: 'Activity' },
  { key: 'Security', label: 'Security' },
];

const ProfilePage = () => {
  const { logout, user, refreshUser } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [activity, setActivity] = useState([]);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const inputClass = 'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm disabled:opacity-60';

  useEffect(() => {
    if (!user) return;
    setName(user.fullName || user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setRole(user.role === 'admin' ? 'Admin' : 'User');
  }, [user]);

  useEffect(() => {
    if (tab !== 'Activity') return;
    activityService.list({ limit: 20 }).then((data) => {
      setActivity(
        (data?.items || []).map((a) => ({
          action: a.message || a.action,
          time: relativeTime(a.createdAt),
          icon: a.icon || 'history',
        }))
      );
    }).catch(() => setActivity([]));
  }, [tab]);

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      await authService.updateMe({ fullName: name, email, phone });
      await dispatch(fetchCurrentUser());
      setEditing(false);
      setNotice('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
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

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      await uploadsService.uploadAvatar(file);
      await refreshUser();
      setNotice('Avatar updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const removeAvatar = async () => {
    setSaving(true);
    try {
      await uploadsService.deleteAvatar();
      await refreshUser();
      setNotice('Avatar removed.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <div className="flex items-center gap-2 text-on-surface-variant mb-2">
          <span className="text-label-caps uppercase tracking-wider">Account</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-label-caps uppercase tracking-wider text-primary">Profile</span>
        </div>
        <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">My Profile</h2>
      </div>

      {(notice || error) && (
        <div className={`rounded-lg border px-4 py-3 text-body-sm ${error ? 'border-error/30 bg-error-container text-on-error-container' : 'border-success-border bg-success-bg text-success'}`}>
          {error || notice}
        </div>
      )}

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary via-primary/80 to-secondary/70 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-8">
            <div className="flex items-end gap-4">
              <div className="relative group">
                <UserAvatar
                  user={user}
                  alt=""
                  className="w-20 h-20 rounded-xl border-4 border-surface shadow-sm"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                  <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                </label>
              </div>
              <div className="pb-1">
                <h3 className="text-headline-md text-on-background">{name || 'User'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-body-sm text-on-surface-variant">{role}</span>
                  <span className="w-1 h-1 rounded-full bg-outline" />
                  <span className="inline-flex items-center gap-1 text-label-caps text-success">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Verified
                  </span>
                </div>
                {user?.avatar && (
                  <button type="button" onClick={removeAvatar} className="text-label-caps text-error mt-1 hover:underline">
                    Remove photo
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className="toolbar-control flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">{editing ? 'close' : 'edit'}</span>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                type="button"
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

      <FilterTabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'Overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                  <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors">Discard</button>
                  <button type="button" disabled={saving} onClick={saveProfile} className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Account Provider', value: user?.provider || 'local', icon: 'badge' },
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—', icon: 'calendar_month' },
              { label: 'Email Status', value: user?.isEmailVerified ? 'Verified' : 'Pending', icon: 'mark_email_read' },
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

      {tab === 'Activity' && (
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-headline-md text-on-background mb-6">Recent Activity</h3>
          {!activity.length && (
            <p className="text-body-sm text-on-surface-variant">No activity yet. Actions across Nexora will appear here.</p>
          )}
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-outline-variant/30" />
            <div className="space-y-6">
              {activity.map(({ action, time, icon }) => (
                <div key={`${action}-${time}`} className="flex items-start gap-4 relative">
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

      {tab === 'Security' && (
        <div className="glass-panel rounded-xl p-6 space-y-6">
          <h3 className="text-headline-md text-on-background">Account Security</h3>
          <div className="max-w-sm space-y-4">
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
            <button type="button" disabled={saving} onClick={changePassword} className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm w-full disabled:opacity-60">
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
