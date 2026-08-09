import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination, { PAGE_SIZE } from '@/components/ui/Pagination';
import FilterTabs from '@/components/ui/FilterTabs';
import { fetchAdsList, setAdsFilters, setAdsPage } from '@/features/ads/adsSlice';

const fmt = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const FORMAT_COLORS = {
  'In-Feed Video': 'bg-primary/10 text-primary border-primary/20',
  'TopView': 'bg-warning-bg text-warning border-warning-border',
  'Spark Ad': 'bg-success-bg text-success border-success-border',
  'Brand Takeover': 'bg-error-container text-on-error-container border-error/20',
};

const TABS = ['All', 'Active', 'Paused', 'Under Review'];

const AdsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, filters, pagination, status, error } = useSelector((s) => s.ads);
  const [view, setView] = useState('table');

  useEffect(() => {
    dispatch(fetchAdsList());
  }, [dispatch, filters.status, filters.search, pagination.page]);

  const tabCounts = TABS.map((t) => ({
    key: t,
    label: t,
    count: t === 'All' ? pagination.total : undefined,
  }));

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">TikTok Ads</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Ads</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Ad Manager</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="filter-tabs flex items-center p-1 gap-1 border border-outline-variant/30 rounded-lg toolbar-control">
            {[{ v: 'table', icon: 'view_list' }, { v: 'grid', icon: 'grid_view' }].map(({ v, icon }) => (
              <button key={v} onClick={() => setView(v)} className={`h-full px-2 rounded-md transition-colors flex items-center ${view === v ? 'bg-surface shadow-sm text-primary' : 'font-normal text-on-surface-variant hover:text-on-surface'}`}>
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard/ads/new')}
            className="toolbar-control flex items-center gap-2 bg-primary text-on-primary px-4 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Ad
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-body-sm">{error}</div>
      )}

      <div className="table-toolbar">
        <FilterTabs
          tabs={tabCounts}
          value={filters.status}
          onChange={(key) => dispatch(setAdsFilters({ status: key }))}
        />
        <span className="text-body-sm text-on-surface-variant">{pagination.total} ad{pagination.total !== 1 ? 's' : ''}</span>
      </div>

      {view === 'table' && (
        <div className="glass-panel rounded-xl overflow-hidden shadow-sm">
          <div className="table-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                  {['Ad Creative', 'Campaign', 'Format', 'Impressions', 'CTR', 'Conversions', 'Spend', 'ROAS', 'Status', ''].map((h) => (
                    <th key={h} className="py-3 px-5 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-body-sm divide-y divide-outline-variant/10">
                {status === 'loading' && items.length === 0 && (
                  <tr><td colSpan={10} className="py-10 text-center text-on-surface-variant">Loading ads…</td></tr>
                )}
                {status !== 'loading' && items.length === 0 && (
                  <tr><td colSpan={10} className="py-10 text-center text-on-surface-variant">No ads found.</td></tr>
                )}
                {items.map((ad) => (
                  <tr key={ad.id} onClick={() => navigate(`/dashboard/ads/${ad.id}`)} className="table-row-hover cursor-pointer transition-all duration-200">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center border border-outline-variant/20">
                          {ad.thumbnail
                            ? <img src={ad.thumbnail} alt="" className="w-full h-full object-cover" />
                            : <span className="material-symbols-outlined text-outline">smart_display</span>}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{ad.name}</p>
                          <p className="text-outline text-[11px] mt-0.5">{ad.duration} · {ad.code || ad.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant max-w-[180px] truncate">{ad.campaignName}</td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-label-caps border ${FORMAT_COLORS[ad.format] || 'bg-surface-container text-on-surface-variant border-outline-variant/30'}`}>
                        {ad.format}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-mono text-on-surface-variant">{fmt(ad.impressions)}</td>
                    <td className="py-3 px-5 font-mono text-on-surface">{ad.ctr > 0 ? `${ad.ctr.toFixed(2)}%` : '—'}</td>
                    <td className="py-3 px-5 font-mono text-on-surface">{ad.conversions > 0 ? ad.conversions : '—'}</td>
                    <td className="py-3 px-5 font-mono text-on-surface">{ad.spend > 0 ? `$${ad.spend.toLocaleString()}` : '—'}</td>
                    <td className="py-3 px-5 font-mono font-bold text-success">{ad.roas > 0 ? `${ad.roas.toFixed(1)}x` : '—'}</td>
                    <td className="py-3 px-5"><StatusBadge status={ad.status} /></td>
                    <td className="py-3 px-5" onClick={(e) => e.stopPropagation()}>
                      <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant/50">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            current={pagination.page}
            total={pagination.total}
            pageSize={pagination.limit || PAGE_SIZE}
            onPageChange={(page) => dispatch(setAdsPage(page))}
          />
        </div>
      )}

      {view === 'grid' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((ad) => {
              const isUnderReview = ad.status === 'Under Review';
              return (
                <div
                  key={ad.id}
                  onClick={() => navigate(`/dashboard/ads/${ad.id}`)}
                  className="glass-panel rounded-xl overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="relative w-full h-72 bg-black flex items-center justify-center overflow-hidden">
                    {isUnderReview ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center bg-surface-container-high">
                        <span className="material-symbols-outlined text-[40px] text-warning">rate_review</span>
                        <div className="space-y-1.5 max-w-[240px]">
                          <p className="text-body-sm font-semibold text-on-surface">Under Review</p>
                          <p className="text-label-caps text-on-surface-variant leading-relaxed">
                            Your creative is currently being reviewed. You&apos;ll be notified once the review is complete.
                          </p>
                        </div>
                      </div>
                    ) : ad.thumbnail ? (
                      <img src={ad.thumbnail} alt={ad.name} className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:opacity-90 transition-opacity" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/40">
                        <span className="material-symbols-outlined text-[48px]">smart_display</span>
                        <span className="text-body-sm">No Preview</span>
                      </div>
                    )}
                    {!isUnderReview && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />}
                    <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2">
                      <div className="shrink-0"><StatusBadge status={ad.status} /></div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end min-w-0">
                        <span className={`text-label-caps px-2 py-0.5 rounded-full whitespace-nowrap ${isUnderReview ? 'text-on-surface-variant bg-surface-container border border-outline-variant/30' : 'text-white/80 bg-black/40'}`}>{ad.format}</span>
                        <span className={`text-label-caps px-2 py-0.5 rounded-full whitespace-nowrap ${isUnderReview ? 'text-on-surface-variant bg-surface-container border border-outline-variant/30' : 'text-white bg-black/50'}`}>{ad.duration}</span>
                      </div>
                    </div>
                    {!isUnderReview && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                          <p className="text-body-sm font-semibold text-white truncate">{ad.name}</p>
                          <p className="text-label-caps text-white/70 truncate mt-0.5">{ad.caption}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Impressions', value: fmt(ad.impressions) },
                      { label: 'CTR', value: ad.ctr > 0 ? `${ad.ctr.toFixed(2)}%` : '—' },
                      { label: 'ROAS', value: ad.roas > 0 ? `${ad.roas.toFixed(1)}x` : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p className="text-label-caps text-on-surface-variant uppercase">{label}</p>
                        <p className="text-body-sm font-bold text-on-surface">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4">
                    <p className="text-label-caps text-outline truncate">{ad.campaignName}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="glass-panel rounded-xl overflow-hidden shadow-sm">
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.limit || PAGE_SIZE}
              onPageChange={(page) => dispatch(setAdsPage(page))}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdsPage;
