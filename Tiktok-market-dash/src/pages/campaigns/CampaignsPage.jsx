import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCampaigns, campaignStats } from '@/data/mockCampaigns';
import StatusBadge from '@/components/ui/StatusBadge';

const fmt = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
  { key: 'under review', label: 'Under Review' },
];

const objectiveColor = {
  Conversions: 'bg-primary/10 text-primary border-primary/20',
  Traffic: 'bg-[#e8f0fe] text-[#1a73e8] border-[#aecbfa]',
  Awareness: 'bg-[#fef3c7] text-[#b06000] border-[#fde68a]',
};

const CampaignsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const filtered = mockCampaigns.filter(
    (c) => activeTab === 'all' || c.status.toLowerCase() === activeTab
  );

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">TikTok Ads</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Campaigns</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Campaigns</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button
            onClick={() => navigate('/dashboard/campaigns/new')}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Campaign
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Spend', value: campaignStats.totalSpend, icon: 'payments', sub: 'This month' },
          { label: 'Total Revenue', value: campaignStats.totalRevenue, icon: 'trending_up', sub: 'From ads' },
          { label: 'Avg. ROAS', value: `${campaignStats.avgRoas}x`, icon: 'show_chart', sub: 'Return on ad spend' },
          { label: 'Impressions', value: campaignStats.totalImpressions, icon: 'visibility', sub: 'Total reach' },
          { label: 'Total Clicks', value: campaignStats.totalClicks, icon: 'ads_click', sub: 'All campaigns' },
          { label: 'Conversions', value: campaignStats.totalConversions, icon: 'shopping_bag', sub: 'Completed' },
        ].map(({ label, value, icon, sub }) => (
          <div key={label} className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[14px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <span className="text-label-caps text-on-surface-variant uppercase">{label}</span>
            </div>
            <p className="text-headline-md font-bold text-on-background">{value}</p>
            <p className="text-label-caps text-outline mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* TikTok Account Banner */}
      <div className="glass-panel rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-primary/10 bg-primary/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.84a8.16 8.16 0 0 0 4.77 1.52V6.92a4.85 4.85 0 0 1-1-.23z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-body-sm font-semibold text-on-surface">@growthAI_store</p>
              <span className="flex items-center gap-1 text-label-caps text-[#137333] bg-[#e6f4ea] border border-[#ceead6] px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Connected
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-0.5">TikTok Business Account · 48.2K followers · 1.2M views this month</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/50 rounded-lg text-body-sm font-medium text-on-surface hover:bg-surface-variant/30 transition-colors shrink-0">
          <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
          Manage Account
        </button>
      </div>

      {/* Campaign Table */}
      <div className="glass-panel rounded-xl flex flex-col shadow-sm">
        <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex space-x-1 p-1 bg-surface-container-low rounded-lg border border-outline-variant/30">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-md text-body-sm transition-colors capitalize ${
                  activeTab === key
                    ? 'bg-surface shadow-sm text-primary font-medium'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-scroll">
          <table className="w-full text-left border-collapse whitespace-nowrap" style={{ minWidth: '900px' }}>
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Campaign', 'Objective', 'Budget / Spent', 'Impressions', 'Clicks', 'CTR', 'Conv.', 'ROAS', 'Status', ''].map((h) => (
                  <th key={h} className="py-3 px-4 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/10">
              {filtered.map((c) => {
                const pct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/dashboard/campaigns/${c.id}`)}
                    className="table-row-hover transition-all duration-200 cursor-pointer"
                  >
                    {/* Campaign Name */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.84a8.16 8.16 0 0 0 4.77 1.52V6.92a4.85 4.85 0 0 1-1-.23z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{c.name}</p>
                          <p className="text-outline text-[11px]">{c.adGroups} ad groups · {c.ads} ads · {c.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Objective */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-label-caps border ${objectiveColor[c.objective] || ''}`}>
                        {c.objective}
                      </span>
                    </td>

                    {/* Budget / Spent */}
                    <td className="py-3 px-4" style={{ minWidth: '150px' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-on-surface font-medium">${c.spent.toLocaleString()}</span>
                        <span className="text-outline text-[11px]">/ ${c.budget.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-error' : 'bg-primary'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-label-caps text-outline">{pct}% used</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-on-surface-variant">{fmt(c.impressions)}</td>
                    <td className="py-3 px-4 font-mono text-on-surface-variant">{fmt(c.clicks)}</td>
                    <td className="py-3 px-4 font-mono text-on-surface">{c.ctr > 0 ? `${c.ctr.toFixed(2)}%` : '—'}</td>
                    <td className="py-3 px-4 font-mono text-on-surface">{c.conversions > 0 ? c.conversions : '—'}</td>

                    {/* ROAS */}
                    <td className="py-3 px-4">
                      {c.roas > 0 ? (
                        <span className={`font-mono font-bold ${c.roas >= 10 ? 'text-[#137333]' : 'text-[#b06000]'}`}>
                          {c.roas.toFixed(1)}x
                        </span>
                      ) : <span className="text-outline">—</span>}
                    </td>

                    <td className="py-3 px-4"><StatusBadge status={c.status} /></td>

                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant/50">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
