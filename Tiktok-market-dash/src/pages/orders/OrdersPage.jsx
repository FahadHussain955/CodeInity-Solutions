import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockOrders, orderCounts } from '@/data/mockOrders';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';

const TABS = [
  { key: 'all', label: 'All', count: orderCounts.all },
  { key: 'processing', label: 'Processing', count: orderCounts.processing },
  { key: 'pending', label: 'Pending', count: orderCounts.pending },
  { key: 'delivered', label: 'Delivered', count: orderCounts.delivered },
  { key: 'cancelled', label: 'Cancelled', count: orderCounts.cancelled },
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockOrders.filter((o) => {
    const matchTab = activeTab === 'all' || o.status.toLowerCase() === activeTab;
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">Store</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Orders</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Orders</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: '1,284', icon: 'shopping_cart', color: 'bg-primary-container text-on-primary-container' },
          { label: 'Processing', value: '132', icon: 'autorenew', color: 'bg-[#e8f0fe] text-[#1a73e8]' },
          { label: 'Pending', value: '48', icon: 'schedule', color: 'bg-[#fef3c7] text-[#b06000]' },
          { label: 'Delivered', value: '1,056', icon: 'check_circle', color: 'bg-[#e6f4ea] text-[#137333]' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass-panel rounded-xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase">{label}</p>
              <p className="text-headline-md font-bold text-on-background mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="glass-panel rounded-xl flex flex-col shadow-sm">
        {/* Filters */}
        <div className="p-6 border-b border-outline-variant/20 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex space-x-1 p-1 bg-surface-container-low rounded-lg border border-outline-variant/30 overflow-x-auto">
            {TABS.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-md text-body-sm whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'bg-surface shadow-sm text-primary font-medium'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-64 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-[18px] transition-colors">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 rounded-lg py-1.5 pl-9 pr-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="Search orders or customers..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-scroll">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Order ID', 'Customer', 'Product', 'Items', 'Amount', 'Payment', 'Date', 'Status', ''].map((h) => (
                  <th key={h} className="py-3 px-6 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/10">
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  className="table-row-hover transition-all duration-200 cursor-pointer"
                >
                  <td className="py-3 px-6 font-mono font-medium text-primary">{order.id}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-body-sm font-semibold shrink-0">
                        {order.customer.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{order.customer}</p>
                        <p className="text-outline text-[11px]">{order.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-on-surface-variant max-w-[200px] truncate">{order.product}</td>
                  <td className="py-3 px-6 text-on-surface-variant text-center">{order.items}</td>
                  <td className="py-3 px-6 font-mono font-medium text-on-surface">{order.amount}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{order.payment}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{order.date}</td>
                  <td className="py-3 px-6"><StatusBadge status={order.status} /></td>
                  <td className="py-3 px-6" onClick={(e) => e.stopPropagation()}>
                    <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant/50">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={orderCounts.all} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default OrdersPage;
