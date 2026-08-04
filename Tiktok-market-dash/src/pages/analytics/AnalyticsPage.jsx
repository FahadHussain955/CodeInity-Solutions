import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const kpiCards = [
  { label: 'Total Revenue', value: '$84,320', change: '+12.5%', positive: true, icon: 'payments', sub: 'vs last month' },
  { label: 'Conversion Rate', value: '3.8%', change: '+0.4%', positive: true, icon: 'percent', sub: 'vs last month' },
  { label: 'Avg. Order Value', value: '$186', change: '+$12', positive: true, icon: 'trending_up', sub: 'vs last month' },
  { label: 'Cart Abandonment', value: '68%', change: '-2.1%', positive: true, icon: 'remove_shopping_cart', sub: 'improvement' },
];

const topProducts = [
  { name: 'Aura Pro Headphones', revenue: '$28,400', units: 95, share: 84 },
  { name: 'Chrono M2 Smartwatch', revenue: '$17,340', units: 116, share: 61 },
  { name: 'Ergo Mesh Chair', revenue: '$11,970', units: 30, share: 42 },
  { name: 'Mechanical Keyboard TKL', revenue: '$9,200', units: 102, share: 32 },
  { name: 'LED Monitor 27"', revenue: '$6,400', units: 40, share: 22 },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
const revenueData = [38, 42, 58, 51, 67, 73, 84];
const ordersData  = [320, 410, 620, 540, 710, 850, 920];

const RANGES = ['7 days', '30 days', '90 days', '12 months'];

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState('30 days');

  const maxRevenue = Math.max(...revenueData);
  const maxOrders  = Math.max(...ordersData);

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">Store</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Analytics</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-body-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            AI Insights
          </button>
          <div className="flex p-1 gap-1 bg-surface-container-low border border-outline-variant/30 rounded-lg">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-body-sm transition-colors ${range === r ? 'bg-surface shadow-sm text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, change, positive, icon, sub }) => (
          <div key={label} className="glass-panel rounded-xl p-5 flex items-start justify-between hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase mb-2">{label}</p>
              <p className="text-display-lg-mobile font-bold text-on-background">{value}</p>
              <p className={`text-label-caps mt-1 ${positive ? 'text-[#137333]' : 'text-error'}`}>
                {positive ? '↑' : '↓'} {change} {sub}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-headline-md text-on-background">Revenue</h3>
              <p className="text-body-sm text-on-surface-variant mt-0.5">Monthly breakdown</p>
            </div>
            <span className="text-headline-md font-bold text-primary">$84.3K</span>
          </div>
          <div className="flex items-end gap-2 h-48 mt-4">
            {revenueData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-label-caps text-outline text-[10px] mb-1">${v}K</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/50 hover:from-primary/80 transition-all duration-500"
                  style={{ height: `${Math.max((v / maxRevenue) * 100, 4)}%` }}
                  title={`$${v}K`}
                />
                <span className="text-label-caps text-outline text-[9px] mt-1">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-headline-md text-on-background">Orders Volume</h3>
              <p className="text-body-sm text-on-surface-variant mt-0.5">Monthly orders count</p>
            </div>
            <span className="text-headline-md font-bold text-secondary">1,284</span>
          </div>
          <div className="flex items-end gap-2 h-48 mt-4">
            {ordersData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-label-caps text-outline text-[10px] mb-1">{v}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-secondary to-secondary/50 hover:from-secondary/80 transition-all duration-500"
                  style={{ height: `${Math.max((v / maxOrders) * 100, 4)}%` }}
                  title={`${v} orders`}
                />
                <span className="text-label-caps text-outline text-[9px] mt-1">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="xl:col-span-2 glass-panel rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="text-headline-md text-on-background">Top Products by Revenue</h3>
            <button
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className="flex items-center gap-1 text-body-sm text-primary hover:text-primary-fixed-variant transition-colors"
            >
              All Products <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          <div className="p-6 space-y-5">
            {topProducts.map(({ name, revenue, units, share }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-body-sm font-medium text-on-surface">{name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-label-caps text-on-surface-variant">{units} units</span>
                    <span className="text-body-sm font-mono font-semibold text-on-surface">{revenue}</span>
                  </div>
                </div>
                <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary/60 rounded-full transition-all duration-700"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-headline-md text-on-background mb-5">Traffic Sources</h3>
          <div className="space-y-4">
            {[
              { source: 'Organic Search', share: 42, color: 'bg-primary' },
              { source: 'Direct', share: 28, color: 'bg-secondary' },
              { source: 'Social Media', share: 18, color: 'bg-tertiary-container' },
              { source: 'Email', share: 8, color: 'bg-[#137333]' },
              { source: 'Paid Ads', share: 4, color: 'bg-outline' },
            ].map(({ source, share, color }) => (
              <div key={source}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-body-sm text-on-surface">{source}</span>
                  </div>
                  <span className="text-label-caps font-semibold text-on-surface">{share}%</span>
                </div>
                <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${share}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <div>
                <p className="text-label-caps text-primary font-semibold uppercase mb-1">AI Insight</p>
                <p className="text-body-sm text-on-surface-variant">Organic traffic up 18% this month. Consider boosting SEO for Headphones category — it has the highest conversion rate.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
