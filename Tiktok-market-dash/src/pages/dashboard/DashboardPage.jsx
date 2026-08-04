import { useNavigate } from 'react-router-dom';
import { mockDashboardStats, mockRecentOrders, mockLowStock } from '@/data/mockDashboard';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';

const StatCard = ({ label, value, change, positive, icon, onClick }) => (
  <button
    onClick={onClick}
    className="glass-panel rounded-xl p-6 flex items-start justify-between hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer w-full text-left"
  >
    <div>
      <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">{label}</p>
      <p className="font-display-lg-mobile text-display-lg-mobile text-on-background font-bold">{value}</p>
      <p className={`font-body-sm text-body-sm mt-1 ${positive ? 'text-[#137333]' : 'text-error'}`}>
        {positive ? '↑' : '↓'} {change} vs last month
      </p>
    </div>
    <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
  </button>
);

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2">Business Command Center</p>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background">Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-body-sm text-body-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            AI Insights
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant/50 bg-surface text-on-surface hover:bg-surface-variant/30 transition-colors font-body-sm text-body-sm font-medium shadow-sm">
            <span className="material-symbols-outlined text-[18px]">date_range</span>
            Last 30 days
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {mockDashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            {...stat}
            onClick={() => navigate(stat.route)}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="xl:col-span-2 glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-background">Revenue Overview</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Monthly performance trend</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.ANALYTICS)}
              className="flex items-center gap-1 font-body-sm text-body-sm text-primary hover:text-primary-fixed-variant transition-colors"
            >
              View Analytics
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {/* Chart Area */}
          <div className="h-44 rounded-lg flex items-end gap-2 px-2 bg-surface-container-low/50">
            {[42, 58, 51, 67, 73, 84].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end pb-1">
                <span className="text-label-caps text-outline text-[9px]">${h}K</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/50 transition-all duration-500 hover:from-primary/80"
                  style={{ height: `${Math.max((h / 84) * 90, 4)}%` }}
                />
                <span className="text-label-caps text-outline text-[9px]">
                  {['F', 'M', 'A', 'M', 'J', 'J'][i]}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Low Stock Alert */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-headline-md text-on-background">Low Stock</h3>
            <button
              onClick={() => navigate(ROUTES.INVENTORY)}
              className="font-body-sm text-body-sm text-primary hover:text-primary-fixed-variant transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {mockLowStock.map((item) => (
              <div
                key={item.sku}
                onClick={() => navigate(ROUTES.INVENTORY)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-variant/30 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-body-sm text-body-sm font-medium text-on-surface">{item.name}</p>
                  <p className="font-label-caps text-label-caps text-outline mt-0.5">{item.sku}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-error" />
                  <span className="font-mono text-body-sm font-medium text-error">{item.stock}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(ROUTES.INVENTORY)}
            className="mt-4 w-full py-2 border border-outline-variant/50 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-variant/30 transition-colors"
          >
            Manage Inventory
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-outline-variant/20">
          <h3 className="font-headline-md text-headline-md text-on-background">Recent Orders</h3>
          <button
            onClick={() => navigate(ROUTES.ORDERS)}
            className="flex items-center gap-1 font-body-sm text-body-sm text-primary hover:text-primary-fixed-variant transition-colors"
          >
            View All Orders
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'].map((col) => (
                  <th key={col} className="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant/10">
              {mockRecentOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  className="table-row-hover transition-all duration-200 cursor-pointer"
                >
                  <td className="py-3 px-6 font-mono text-primary font-medium">{order.id}</td>
                  <td className="py-3 px-6 text-on-surface">{order.customer}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{order.product}</td>
                  <td className="py-3 px-6 font-mono font-medium text-on-surface">{order.amount}</td>
                  <td className="py-3 px-6"><StatusBadge status={order.status} /></td>
                  <td className="py-3 px-6 text-on-surface-variant">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Add Product', icon: 'add_box', route: ROUTES.PRODUCT_NEW, color: 'bg-primary' },
          { label: 'View Customers', icon: 'group', route: ROUTES.CUSTOMERS, color: 'bg-secondary' },
          { label: 'Media Library', icon: 'photo_library', route: ROUTES.MEDIA, color: 'bg-tertiary-container' },
          { label: 'Settings', icon: 'settings', route: ROUTES.SETTINGS, color: 'bg-surface-container-high' },
        ].map(({ label, icon, route, color }) => (
          <button
            key={label}
            onClick={() => navigate(route)}
            className="glass-panel rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[20px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <span className="font-body-sm text-body-sm font-medium text-on-surface">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
