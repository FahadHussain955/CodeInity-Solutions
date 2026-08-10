import { useEffect, useState } from 'react';
import { campaignsService } from '@/services/campaignsService';

const inputClass =
  'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm disabled:opacity-60';

const FORMATS = ['In-Feed Video', 'TopView', 'Spark Ad', 'Brand Takeover'];

const emptyForm = {
  name: '',
  campaignId: '',
  format: 'In-Feed Video',
  caption: '',
  duration: '',
  mediaUrl: '',
  thumbnail: '',
  adGroup: '',
};

/**
 * Create or edit an ad creative via the real ads API.
 * Campaign select is limited to the authenticated user's campaigns.
 */
const AdFormModal = ({ open, onClose, onSubmit, initial = null, mode = 'create', defaultCampaignId = '' }) => {
  const [form, setForm] = useState(emptyForm);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setErrorMsg('');
    if (initial) {
      setForm({
        name: initial.name || initial.title || '',
        campaignId: initial.campaignId || '',
        format: initial.format || initial.mediaType || 'In-Feed Video',
        caption: initial.caption || '',
        duration: initial.duration || '',
        mediaUrl: initial.mediaUrl || '',
        thumbnail: initial.thumbnail || '',
        adGroup: initial.adGroup || '',
      });
    } else {
      setForm({ ...emptyForm, campaignId: defaultCampaignId || '' });
    }

    let cancelled = false;
    setLoadingCampaigns(true);
    campaignsService
      .list({ page: 1, limit: 100, sort: 'recent' })
      .then((data) => {
        if (cancelled) return;
        setCampaigns(data?.items || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(err.message || 'Unable to load campaigns.');
      })
      .finally(() => {
        if (!cancelled) setLoadingCampaigns(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, initial, defaultCampaignId]);

  if (!open) return null;

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (name.length < 2) {
      setStatus('error');
      setErrorMsg('Ad title must be at least 2 characters.');
      return;
    }
    if (!form.campaignId) {
      setStatus('error');
      setErrorMsg('Please select a campaign.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const payload = {
      name,
      campaignId: form.campaignId,
      format: form.format,
      caption: form.caption.trim() || null,
      duration: form.duration.trim() || null,
      mediaUrl: form.mediaUrl.trim() || null,
      thumbnail: form.thumbnail.trim() || null,
      adGroup: form.adGroup.trim() || null,
    };

    try {
      await onSubmit(payload);
      setStatus('success');
      setTimeout(() => onClose(), 900);
    } catch (error) {
      setStatus('error');
      setErrorMsg(error?.message || (mode === 'create' ? 'Unable to create ad.' : 'Unable to update ad.'));
    }
  };

  const title = mode === 'edit' ? 'Edit Ad' : 'Create Ad';
  const subtitle =
    mode === 'edit' ? 'Update creative details' : 'Create an ad under one of your campaigns';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
        onClick={() => status !== 'loading' && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-form-title"
        className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-outline-variant/20 flex items-center gap-4 bg-surface/50 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container">
            <span className="material-symbols-outlined text-[28px]">smart_display</span>
          </div>
          <div>
            <h3 id="ad-form-title" className="text-headline-md text-on-background leading-tight">
              {title}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-success-bg text-success flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <h4 className="text-body-lg font-semibold text-on-surface">
                {mode === 'edit' ? 'Ad updated' : 'Ad created'}
              </h4>
              <p className="text-body-sm text-on-surface-variant mt-1">Saved to your account.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-body-sm">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Campaign *
                </label>
                <select
                  value={form.campaignId}
                  onChange={(e) => setField('campaignId', e.target.value)}
                  className={inputClass}
                  disabled={status === 'loading' || loadingCampaigns || mode === 'edit'}
                  required
                >
                  <option value="">
                    {loadingCampaigns ? 'Loading campaigns…' : 'Select a campaign'}
                  </option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code || c.id})
                    </option>
                  ))}
                </select>
                {!loadingCampaigns && campaigns.length === 0 && (
                  <p className="text-body-sm text-warning mt-1.5">
                    No campaigns yet. Create a campaign first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Ad title *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Summer Hook Video"
                  className={inputClass}
                  disabled={status === 'loading'}
                  required
                  minLength={2}
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    Format
                  </label>
                  <select
                    value={form.format}
                    onChange={(e) => setField('format', e.target.value)}
                    className={inputClass}
                    disabled={status === 'loading'}
                  >
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setField('duration', e.target.value)}
                    placeholder="e.g. 15s"
                    className={inputClass}
                    disabled={status === 'loading'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Caption
                </label>
                <textarea
                  value={form.caption}
                  onChange={(e) => setField('caption', e.target.value)}
                  rows={3}
                  placeholder="Ad caption / copy"
                  className={inputClass}
                  disabled={status === 'loading'}
                  maxLength={2000}
                />
              </div>

              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Ad group
                </label>
                <input
                  type="text"
                  value={form.adGroup}
                  onChange={(e) => setField('adGroup', e.target.value)}
                  placeholder="Optional ad group name"
                  className={inputClass}
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Media URL
                </label>
                <input
                  type="url"
                  value={form.mediaUrl}
                  onChange={(e) => setField('mediaUrl', e.target.value)}
                  placeholder="https://…"
                  className={inputClass}
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={form.thumbnail}
                  onChange={(e) => setField('thumbnail', e.target.value)}
                  placeholder="https://…"
                  className={inputClass}
                  disabled={status === 'loading'}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === 'loading'}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant/50 text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading' || (!form.campaignId && mode === 'create')}
                  className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === 'loading' && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  )}
                  {mode === 'edit' ? 'Save changes' : 'Create ad'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdFormModal;
