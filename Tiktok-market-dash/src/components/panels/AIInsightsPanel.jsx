import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAiError, fetchAiInsights, refreshAiInsights } from '@/features/ai/aiSlice';

const AIInsightsPanel = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { forecast, groups, actions, status, error, provider, cached } = useSelector((s) => s.ai);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      dispatch(fetchAiInsights());
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!error) return undefined;
    const t = window.setTimeout(() => dispatch(clearAiError()), 4000);
    return () => window.clearTimeout(t);
  }, [error, dispatch]);

  if (!isOpen) return null;

  const forecastRevenue = forecast?.revenueFormatted || forecast?.revenue || '—';
  const forecastChange = forecast?.changeLabel || forecast?.change || '';

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-headline-md text-on-background">AI Insights</h2>
              <p className="text-label-caps text-on-surface-variant">
                Powered by Nexora{provider ? ` · ${provider}` : ''}{cached ? ' · cached' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => dispatch(refreshAiInsights())}
              disabled={status === 'loading'}
              className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors disabled:opacity-50"
              title="Refresh insights"
            >
              <span className={`material-symbols-outlined ${status === 'loading' ? 'animate-spin' : ''}`}>refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-error-container/50 border border-error/20 text-body-sm text-on-error-container">
              {error}
            </div>
          )}

          <div className="p-4 bg-primary-container/30 border border-primary/20 rounded-xl">
            <h4 className="text-body-sm font-semibold text-primary mb-1">Sales Forecast</h4>
            <p className="text-body-sm text-on-surface-variant">
              {status === 'loading' && !forecast ? (
                'Generating forecast…'
              ) : (
                <>
                  Projected revenue for this week is{' '}
                  <span className="font-semibold text-on-surface">{forecastRevenue}</span>
                  {forecastChange ? ` (${forecastChange}).` : '.'}
                </>
              )}
            </p>
          </div>

          {status === 'loading' && groups.length === 0 && (
            <p className="text-body-sm text-on-surface-variant text-center py-8">Generating AI insights…</p>
          )}

          {groups.map((group, idx) => (
            <div key={`${group.category}-${idx}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${group.bg} ${group.color} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[18px]">{group.icon}</span>
                </div>
                <h3 className="text-body-md font-semibold text-on-surface">{group.category}</h3>
              </div>
              <ul className="space-y-3 pl-[40px]">
                {(group.items || []).map((item, i) => (
                  <li key={i} className="flex gap-3 text-body-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/50 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border-t border-outline-variant/20 pt-6">
            <h3 className="text-body-md font-semibold text-on-surface mb-3">AI Action Items</h3>
            {(actions.length ? actions : [{ title: 'Auto-optimize Campaigns', description: 'Apply suggested budget changes' }]).map((action) => (
              <button
                key={action.title}
                type="button"
                className="w-full text-left px-4 py-3 rounded-lg border border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group mb-2"
              >
                <div>
                  <p className="text-body-sm font-medium text-on-surface">{action.title}</p>
                  <p className="text-label-caps text-on-surface-variant">{action.description}</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_forward</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
