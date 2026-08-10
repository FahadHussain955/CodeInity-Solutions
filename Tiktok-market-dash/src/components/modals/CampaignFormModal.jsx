import { useEffect, useState } from 'react';

const inputClass =
  'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm disabled:opacity-60';

const OBJECTIVES = [
  { value: 'CONVERSIONS', label: 'Conversions' },
  { value: 'TRAFFIC', label: 'Traffic' },
  { value: 'AWARENESS', label: 'Awareness' },
];

const STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
];

const emptyForm = {
  name: '',
  objective: 'CONVERSIONS',
  status: 'DRAFT',
  budget: '',
  dailyBudget: '',
  startDate: '',
  endDate: '',
};

/**
 * Create or edit a campaign via the real campaigns API.
 * Success only after the backend confirms the record.
 */
const CampaignFormModal = ({ open, onClose, onSubmit, initial = null, mode = 'create' }) => {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setErrorMsg('');
    if (initial) {
      setForm({
        name: initial.name || initial.campaignName || '',
        objective: mapObjectiveToEnum(initial.objectiveRaw || initial.objective),
        status: mapStatusToEnum(initial.statusRaw || initial.status),
        budget: initial.budget != null ? String(initial.budget) : '',
        dailyBudget: initial.dailyBudget != null ? String(initial.dailyBudget) : '',
        startDate: toDateInput(initial.startDateRaw || initial.startDate),
        endDate: toDateInput(initial.endDateRaw || initial.endDate),
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, initial]);

  if (!open) return null;

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (name.length < 2) {
      setStatus('error');
      setErrorMsg('Campaign name must be at least 2 characters.');
      return;
    }
    const budget = Number(form.budget);
    if (!Number.isFinite(budget) || budget < 0) {
      setStatus('error');
      setErrorMsg('Budget must be a valid number (0 or greater).');
      return;
    }
    if (form.dailyBudget !== '' && (!Number.isFinite(Number(form.dailyBudget)) || Number(form.dailyBudget) < 0)) {
      setStatus('error');
      setErrorMsg('Daily budget must be a valid number (0 or greater).');
      return;
    }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      setStatus('error');
      setErrorMsg('End date cannot be before start date.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const payload = {
      name,
      objective: form.objective,
      status: form.status,
      budget,
      dailyBudget: form.dailyBudget === '' ? null : Number(form.dailyBudget),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      platform: 'TikTok',
    };

    try {
      await onSubmit(payload);
      setStatus('success');
      setTimeout(() => onClose(), 900);
    } catch (error) {
      setStatus('error');
      setErrorMsg(error?.message || (mode === 'create' ? 'Unable to create campaign.' : 'Unable to update campaign.'));
    }
  };

  const title = mode === 'edit' ? 'Edit Campaign' : 'Create Campaign';
  const subtitle = mode === 'edit' ? 'Update campaign settings' : 'Add a new TikTok Ads campaign';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
        onClick={() => status !== 'loading' && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-form-title"
        className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-outline-variant/20 flex items-center gap-4 bg-surface/50 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container">
            <span className="material-symbols-outlined text-[28px]">campaign</span>
          </div>
          <div>
            <h3 id="campaign-form-title" className="text-headline-md text-on-background leading-tight">
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
                {mode === 'edit' ? 'Campaign updated' : 'Campaign created'}
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
                  Campaign name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Summer Flash Sale"
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
                    Objective
                  </label>
                  <select
                    value={form.objective}
                    onChange={(e) => setField('objective', e.target.value)}
                    className={inputClass}
                    disabled={status === 'loading'}
                  >
                    {OBJECTIVES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                    className={inputClass}
                    disabled={status === 'loading'}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    Total budget (USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budget}
                    onChange={(e) => setField('budget', e.target.value)}
                    placeholder="1000"
                    className={inputClass}
                    disabled={status === 'loading'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    Daily budget (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.dailyBudget}
                    onChange={(e) => setField('dailyBudget', e.target.value)}
                    placeholder="50"
                    className={inputClass}
                    disabled={status === 'loading'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setField('startDate', e.target.value)}
                    className={inputClass}
                    disabled={status === 'loading'}
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    End date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setField('endDate', e.target.value)}
                    className={inputClass}
                    disabled={status === 'loading'}
                  />
                </div>
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
                  disabled={status === 'loading'}
                  className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === 'loading' && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  )}
                  {mode === 'edit' ? 'Save changes' : 'Create campaign'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const mapObjectiveToEnum = (value) => {
  const v = String(value || '').toUpperCase().replace(/\s+/g, '_');
  if (['CONVERSIONS', 'TRAFFIC', 'AWARENESS'].includes(v)) return v;
  const label = String(value || '').toLowerCase();
  if (label.includes('traffic')) return 'TRAFFIC';
  if (label.includes('aware')) return 'AWARENESS';
  return 'CONVERSIONS';
};

const mapStatusToEnum = (value) => {
  const raw = String(value || '').toUpperCase().replace(/\s+/g, '_');
  if (['ACTIVE', 'PAUSED', 'UNDER_REVIEW', 'DRAFT'].includes(raw)) return raw;
  const label = String(value || '').toLowerCase();
  if (label.includes('pause')) return 'PAUSED';
  if (label.includes('review')) return 'UNDER_REVIEW';
  if (label.includes('draft')) return 'DRAFT';
  if (label.includes('active')) return 'ACTIVE';
  return 'DRAFT';
};

const toDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const m = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
  }
  return d.toISOString().slice(0, 10);
};

export default CampaignFormModal;
