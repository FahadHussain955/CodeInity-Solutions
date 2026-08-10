import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination, { PAGE_SIZE, paginateItems } from '@/components/ui/Pagination';
import CampaignFormModal from '@/components/modals/CampaignFormModal';
import AdFormModal from '@/components/modals/AdFormModal';
import {
  clearSelectedCampaign,
  deleteCampaign,
  fetchCampaignById,
  updateCampaign,
} from '@/features/campaigns/campaignsSlice';
import { createAd, fetchAdsList } from '@/features/ads/adsSlice';

const fmt = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected: campaign, detailStatus, error } = useSelector((s) => s.campaigns);
  const ads = useSelector((s) => s.ads.items);
  const [adsPage, setAdsPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [createAdOpen, setCreateAdOpen] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    dispatch(fetchCampaignById(id));
    dispatch(fetchAdsList({ campaignId: id, limit: 50, status: 'All' }));
    return () => {
      dispatch(clearSelectedCampaign());
    };
  }, [id, dispatch]);

  if (detailStatus === 'loading' && !campaign) {
    return <div className="py-16 text-center text-on-surface-variant text-body-sm">Loading campaign…</div>;
  }

  if (!campaign) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-on-surface-variant text-body-sm">{error || 'Campaign not found.'}</p>
        <button type="button" onClick={() => navigate(ROUTES.CAMPAIGNS)} className="text-primary text-body-sm">Back to campaigns</button>
      </div>
    );
  }

  const pct = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
  const pagedAds = paginateItems(ads, adsPage, PAGE_SIZE);
  const base = Math.max(campaign.roas || 1, 1);
  const perfData = [0.7, 0.85, 0.75, 0.95, 1.05, 1.2, 1.1].map((m) => Math.round(base * m * 10) / 10);
  const maxPerf = Math.max(...perfData, 1);
  const targeting = campaign.targeting || {};

  const toggleStatus = () => {
    const next = campaign.status === 'Active' ? 'Paused' : 'Active';
    dispatch(updateCampaign({ id: campaign.id, status: next }));
  };

  const handleEdit = async (payload) => {
    const result = await dispatch(updateCampaign({ id: campaign.id, ...payload }));
    if (updateCampaign.rejected.match(result)) {
      throw new Error(result.payload || 'Unable to update campaign.');
    }
    await dispatch(fetchCampaignById(campaign.id));
    return result.payload;
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete campaign "${campaign.name}"? Ads under it will also be removed.`)) return;
    const result = await dispatch(deleteCampaign(campaign.id));
    if (deleteCampaign.rejected.match(result)) {
      window.alert(result.payload || 'Unable to delete campaign.');
      return;
    }
    navigate(ROUTES.CAMPAIGNS);
  };

  const handleCreateAd = async (payload) => {
    const result = await dispatch(createAd({ ...payload, campaignId: campaign.id }));
    if (createAd.rejected.match(result)) {
      throw new Error(result.payload || 'Unable to create ad.');
    }
    dispatch(fetchAdsList({ campaignId: campaign.id, limit: 50, status: 'All' }));
    dispatch(fetchCampaignById(campaign.id));
    return result.payload;
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <button type="button" onClick={() => navigate(ROUTES.CAMPAIGNS)} className="text-label-caps uppercase tracking-wider hover:text-primary transition-colors">Campaigns</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">{campaign.code || campaign.id}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-display-lg-mobile text-on-background">{campaign.name}</h2>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {campaign.objective} · {campaign.adGroups} Ad Groups · {campaign.ads} Ads · {campaign.startDate} – {campaign.endDate}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {campaign.status === 'Active' ? (
            <button type="button" onClick={toggleStatus} className="toolbar-control flex items-center gap-2 bg-warning-bg text-warning border border-warning-border px-4 rounded-lg text-body-sm font-medium hover:bg-warning-border transition-colors">
              <span className="material-symbols-outlined text-[18px]">pause</span>
              Pause
            </button>
          ) : (
            <button type="button" onClick={toggleStatus} className="toolbar-control flex items-center gap-2 bg-success-bg text-success border border-success-border px-4 rounded-lg text-body-sm font-medium hover:bg-success-border transition-colors">
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Resume
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="toolbar-control flex items-center gap-2 bg-primary text-on-primary px-4 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Campaign
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="toolbar-control flex items-center gap-2 bg-error-container text-error border border-error/30 px-4 rounded-lg text-body-sm font-medium hover:bg-error/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete
          </button>
        </div>
      </div>

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
            <p className={`text-headline-md font-bold ${highlight ? 'text-success' : 'text-on-background'}`}>{value}</p>
            <p className="text-label-caps text-outline mt-0.5">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-headline-md text-on-background">Daily Performance</h3>
              <p className="text-body-sm text-on-surface-variant mt-0.5">ROAS over the last 7 days</p>
            </div>
            <span className="text-body-sm font-medium text-on-surface-variant">Avg ROAS: <span className="text-primary font-bold">{(campaign.roas || 0).toFixed(1)}x</span></span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {perfData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-label-caps text-chart-label text-[10px]">{v}x</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/40 hover:from-primary/80 transition-all duration-300"
                  style={{ height: `${Math.max((v / maxPerf) * 100, 4)}%` }}
                />
                <span className="text-label-caps text-chart-label text-[9px]">{days[i]}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-sm font-medium text-on-surface">Budget Utilization</span>
              <span className="text-body-sm font-mono font-bold text-on-surface">{pct}%</span>
            </div>
            <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? 'bg-error' : pct >= 70 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-label-caps text-outline">${campaign.spent.toLocaleString()} spent</span>
              <span className="text-label-caps text-outline">${Math.max(campaign.budget - campaign.spent, 0).toLocaleString()} remaining</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-headline-md text-on-background mb-4">Targeting</h3>
            <div className="space-y-3">
              {[
                { label: 'Objective', value: campaign.objective, icon: 'flag' },
                { label: 'Locations', value: (targeting.locations || targeting.countries || ['PK', 'SA', 'AE', 'US']).toString().replace(/,/g, ', '), icon: 'location_on' },
                { label: 'Age Range', value: targeting.ageRange || '18 – 44', icon: 'person' },
                { label: 'Interests', value: (targeting.interests || ['Tech', 'Music', 'Lifestyle']).toString().replace(/,/g, ', '), icon: 'category' },
                { label: 'Placements', value: (targeting.placements || ['In-Feed', 'TopView']).toString().replace(/,/g, ', '), icon: 'smart_display' },
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
                Increase daily budget by 20% — this campaign&apos;s ROAS is {(campaign.roas || 0).toFixed(1)}x, well above your account average of 12x.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-headline-md text-on-background">Ads in this Campaign</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCreateAdOpen(true)}
                className="flex items-center gap-1 text-body-sm text-primary hover:text-primary-fixed-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create Ad
              </button>
              <button type="button" onClick={() => navigate(ROUTES.ADS)} className="flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-primary transition-colors">
                View All Ads <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
          {ads.length === 0 ? (
            <div className="py-10 text-center text-body-sm text-on-surface-variant">No ads in this campaign yet.</div>
          ) : (
            <>
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
                    {pagedAds.map((ad) => (
                      <tr key={ad.id} className="table-row-hover transition-all">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center">
                              {ad.thumbnail
                                ? <img src={ad.thumbnail} alt="" className="w-full h-full object-cover" />
                                : <span className="material-symbols-outlined text-outline text-[20px]">smart_display</span>}
                            </div>
                            <div>
                              <p className="font-medium text-on-surface">{ad.name}</p>
                              <p className="text-outline text-[11px]">{ad.duration} · {ad.code || ad.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-on-surface-variant">{ad.format}</td>
                        <td className="py-3 px-5 font-mono text-on-surface-variant">{fmt(ad.impressions)}</td>
                        <td className="py-3 px-5 font-mono text-on-surface">{ad.ctr > 0 ? `${ad.ctr.toFixed(2)}%` : '—'}</td>
                        <td className="py-3 px-5 font-mono text-on-surface">{ad.conversions > 0 ? ad.conversions : '—'}</td>
                        <td className="py-3 px-5 font-mono font-bold text-success">{ad.roas > 0 ? `${ad.roas.toFixed(1)}x` : '—'}</td>
                        <td className="py-3 px-5"><StatusBadge status={ad.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination current={adsPage} total={ads.length} pageSize={PAGE_SIZE} onPageChange={setAdsPage} />
            </>
          )}
      </div>

      <CampaignFormModal
        open={editOpen}
        mode="edit"
        initial={campaign}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
      />
      <AdFormModal
        open={createAdOpen}
        mode="create"
        defaultCampaignId={campaign.id}
        onClose={() => setCreateAdOpen(false)}
        onSubmit={handleCreateAd}
      />
    </div>
  );
};

export default CampaignDetailPage;
