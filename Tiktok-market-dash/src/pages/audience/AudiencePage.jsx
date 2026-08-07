import { useState } from 'react';
import { mockAudiences, audienceDemographics } from '@/data/mockAudiences';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination, { PAGE_SIZE, paginateItems } from '@/components/ui/Pagination';

const TYPE_COLORS = {
  Interest: 'bg-primary/10 text-primary border-primary/20',
  Lookalike: 'bg-info-bg text-info border-info-border',
  Custom: 'bg-success-bg text-success border-success-border',
};

const AudiencePage = () => {
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const demo = audienceDemographics;
  const rows = paginateItems(mockAudiences, page, PAGE_SIZE);

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">TikTok Ads</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Audience</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Audience</h2>
        </div>
        <button className="toolbar-control flex items-center gap-2 bg-primary text-on-primary px-4 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Audience
        </button>
      </div>

      {/* Pixel Status */}
      <div className="glass-panel rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-success-border bg-success-bg/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <div>
            <p className="text-body-sm font-semibold text-on-surface">TikTok Pixel · Active</p>
            <p className="text-body-sm text-on-surface-variant mt-0.5">Firing on all pages · Last event 2 min ago · 4,820 events today</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-success-border rounded-lg text-body-sm font-medium text-success bg-success-bg hover:bg-success-border transition-colors shrink-0">
          <span className="material-symbols-outlined text-[18px]">settings</span>
          Configure Pixel
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Audience List */}
        <div className="xl:col-span-2 glass-panel rounded-xl overflow-hidden">
          <div className="p-5 border-b border-outline-variant/20">
            <h3 className="text-headline-md text-on-background">Saved Audiences</h3>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {rows.map((aud) => (
              <div
                key={aud.id}
                onClick={() => setSelected(aud.id === selected ? null : aud.id)}
                className={`p-5 cursor-pointer transition-all hover:bg-surface-variant/20 ${selected === aud.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-body-sm font-semibold text-on-surface">{aud.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-label-caps border ${TYPE_COLORS[aud.type] || ''}`}>{aud.type}</span>
                      <StatusBadge status={aud.status} />
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-1">{aud.source}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-body-sm font-medium text-on-surface">{aud.size}</p>
                    <p className="text-label-caps text-outline">{aud.campaigns} campaign{aud.campaigns !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Expanded detail */}
                {selected === aud.id && (
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center bg-surface-container-low/50 rounded-xl p-4">
                    {[
                      { label: 'Match Rate', value: `${aud.match}%` },
                      { label: 'Est. Reach', value: aud.size },
                      { label: 'Created', value: aud.createdAt },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-label-caps text-on-surface-variant uppercase">{label}</p>
                        <p className="text-body-sm font-semibold text-on-surface mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination current={page} total={mockAudiences.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>

        {/* Demographics Panel */}
        <div className="space-y-4">
          {/* Gender */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-headline-md text-on-background mb-4">Gender Split</h3>
            <div className="space-y-3">
              {demo.gender.map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-body-sm text-on-surface">{label}</span>
                    <span className="text-body-sm font-semibold text-on-surface">{value}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-headline-md text-on-background mb-4">Age Groups</h3>
            <div className="flex items-end gap-1.5 h-28">
              {demo.age.map(({ label, value }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-label-caps text-outline text-[9px]">{value}%</span>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-secondary to-secondary/40"
                    style={{ height: `${Math.max((value / 34) * 100, 4)}%` }}
                  />
                  <span className="text-label-caps text-outline text-[9px]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Regions */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-headline-md text-on-background mb-4">Top Regions</h3>
            <div className="space-y-3">
              {demo.topRegions.map(({ country, share }) => (
                <div key={country}>
                  <div className="flex justify-between mb-1">
                    <span className="text-body-sm text-on-surface">{country}</span>
                    <span className="text-body-sm font-semibold text-on-surface">{share}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudiencePage;
