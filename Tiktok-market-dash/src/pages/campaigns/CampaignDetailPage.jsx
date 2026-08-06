import { useParams, useNavigate } from 'react-router-dom';
import { mockCampaigns } from '@/data/mockCampaigns';
import { mockAds } from '@/data/mockAds';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';

const TikTokIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size }} className="fill-current">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.84a8.16 8.16 0 0 0 4.77 1.52V6.92a4.85 4.85 0 0 1-1-.23z" />
  </svg>
);

const fmt = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const perfData = [42, 58, 51, 67, 73, 84, 78];
const maxPerf = Math.max(...perfData);

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const campaign = mockCampaigns.find((c) => c.id === id) || mockCampaigns[0];
  const ads = mockAds.filter((a) => a.campaignId === campaign.id);
  const pct = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <button onClick={() => navigate(ROUTES.CAMPAIGNS)} className="text-label-caps uppercase tracking-wider hover:text-primary transition-colors">Campaigns</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">{campaign.id}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-display-lg-mobile text-on-background">{campaign.name}</h2>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {campaign.objective} · {campaign.adGroups} Ad Groups · {campaign.ads} Ads · {campaign.startDate} – {campaign.endDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {campaign.status === 'Active' ? (
            <button className="flex items-center gap-2 bg-[#fef3c7] text-[#b06000] border border-[#fde68a] px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-[#fde68a] transition-colors">
              <span className="material-symbols-outlined text-[18px]">pause</span>
              Pause
            </button>
          ) : (
            <button className="flex items-center gap-2 bg-[#e6f4ea] text-[#137333] border border-[#ceead6] px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-[#ceead6] transition-colors">
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Resume
            </button>
          )}
          <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Campaign
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Spent', value: `$${campaign.spent.toLocaleString()}`, note: `of $${campaign.budget.toLocaleString()}` },
          { label: 'Revenue', value: `$${campaign.revenue.toLocaleString()}`, note: 'From this campaign' },
          { label: 'ROAS', value: campaign.roas > 0 ? `${campaign.roas.toFixed(1)}x` : '—', note: 'Return on ad spend', highlight: campaign.roas >= 10 },
          { label: 'Impressions', value: fmt(campaign.impressions), note: 'Total reach' },
          { label: 'Clicks', value: fmt(campaign.clicks), note: `CTR: ${campaign.ctr}%` },
          { label: 'Conversions', value: campaign.conversions > 0 ? campaign.conversions : '—', note: `CPC: $${campaign.cpc}` },
        ].map(({ label, value, note, highlight }) => (
          <div key={label} className="glass-panel rounded-xl p-4">
            <p className="text-label-caps text-on-surface-variant uppercase mb-1">{label}</p>
            <p className={`text-headline-md font-bold ${highlight ? 'text-[#137333]' : 'text-on-background'}`}>{value}</p>
            <p className="text-label-caps text-outline mt-0.5">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="xl:col-span-2 glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-headline-md text-on-background">Daily Performance</h3>
              <p className="text-body-sm text-on-surface-variant mt-0.5">ROAS over the last 7 days</p>
            </div>
            <span className="text-body-sm font-medium text-on-surface-variant">Avg ROAS: <span className="text-primary font-bold">{campaign.roas.toFixed(1)}x</span></span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {perfData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-label-caps text-outline text-[10px]">{v}x</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/40 hover:from-primary/80 transition-all duration-300"
                  style={{ height: `${Math.max((v / maxPerf) * 100, 4)}%` }}
                />
                <span className="text-label-caps text-outline text-[9px]">{days[i]}</span>
              </div>
            ))}
          </div>

          {/* Budget Progress */}
          <div className="mt-6 p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-sm font-medium text-on-surface">Budget Utilization</span>
              <span className="text-body-sm font-mono font-bold text-on-surface">{pct}%</span>
            </div>
            <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? 'bg-error' : pct >= 70 ? 'bg-[#b06000]' : 'bg-primary'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-label-caps text-outline">${campaign.spent.toLocaleString()} spent</span>
              <span className="text-label-caps text-outline">${(campaign.budget - campaign.spent).toLocaleString()} remaining</span>
            </div>
          </div>
        </div>

        {/* Targeting & Details */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-headline-md text-on-background mb-4">Targeting</h3>
            <div className="space-y-3">
              {[
                { label: 'Objective', value: campaign.objective, icon: 'flag' },
                { label: 'Locations', value: 'PK, SA, AE, US', icon: 'location_on' },
                { label: 'Age Range', value: '18 – 44', icon: 'person' },
                { label: 'Interests', value: 'Tech, Music, Lifestyle', icon: 'category' },
                { label: 'Placements', value: 'In-Feed, TopView', icon: 'smart_display' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">{icon}</span>
                  <div>
                    <p className="text-label-caps text-on-surface-variant uppercase">{label}</p>
                    <p className="text-body-sm text-on-surface font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-headline-md text-on-background mb-3">AI Recommendation</h3>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <p className="text-body-sm text-on-surface-variant">
                Increase daily budget by 20% — this campaign's ROAS is {campaign.roas.toFixed(1)}x, well above your account average of 12x.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ads in this Campaign */}
      {ads.length > 0 && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="text-headline-md text-on-background">Ads in this Campaign</h3>
            <button onClick={() => navigate(ROUTES.ADS)} className="flex items-center gap-1 text-body-sm text-primary hover:text-primary-fixed-variant transition-colors">
              View All Ads <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          <div className="table-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                  {['Ad', 'Format', 'Impressions', 'CTR', 'Conversions', 'ROAS', 'Status'].map((h) => (
                    <th key={h} className="py-3 px-5 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-body-sm divide-y divide-outline-variant/10">
                {ads.map((ad) => (
                  <tr key={ad.id} onClick={() => navigate(`/dashboard/ads/${ad.id}`)} className="table-row-hover cursor-pointer transition-all">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center">
                          {ad.thumbnail
                            ? <img src={ad.thumbnail} alt="" className="w-full h-full object-cover" />
                            : <span className="material-symbols-outlined text-outline text-[20px]">smart_display</span>}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{ad.name}</p>
                          <p className="text-outline text-[11px]">{ad.duration} · {ad.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant">{ad.format}</td>
                    <td className="py-3 px-5 font-mono text-on-surface-variant">{fmt(ad.impressions)}</td>
                    <td className="py-3 px-5 font-mono text-on-surface">{ad.ctr > 0 ? `${ad.ctr.toFixed(2)}%` : '—'}</td>
                    <td className="py-3 px-5 font-mono text-on-surface">{ad.conversions > 0 ? ad.conversions : '—'}</td>
                    <td className="py-3 px-5 font-mono font-bold text-[#137333]">{ad.roas > 0 ? `${ad.roas.toFixed(1)}x` : '—'}</td>
                    <td className="py-3 px-5"><StatusBadge status={ad.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetailPage;
