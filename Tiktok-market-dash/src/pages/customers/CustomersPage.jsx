import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCustomers, customerStats } from '@/data/mockCustomers';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';

const CustomersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockCustomers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">Store</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Customers</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Customers</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {customerStats.map(({ label, value, icon, change }) => (
          <div key={label} className="glass-panel rounded-xl p-5 flex items-start justify-between">
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase mb-1">{label}</p>
              <p className="text-headline-md font-bold text-on-background">{value}</p>
              <p className="text-label-caps text-[#137333] mt-1">{change}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="glass-panel rounded-xl flex flex-col shadow-sm">
        <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-headline-md text-on-background">All Customers</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-[18px] transition-colors">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-outline-variant/50 rounded-lg py-1.5 pl-9 pr-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                placeholder="Search customers..."
              />
            </div>
            <button className="flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-3 py-1.5 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Customer', 'Email', 'Phone', 'Orders', 'Total Spent', 'Joined', 'Status', ''].map((h) => (
                  <th key={h} className="py-3 px-6 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/10">
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
                  className="table-row-hover transition-all duration-200 cursor-pointer"
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-semibold text-body-sm shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-on-surface">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-on-surface-variant">{customer.email}</td>
                  <td className="py-3 px-6 text-on-surface-variant font-mono text-[12px]">{customer.phone}</td>
                  <td className="py-3 px-6 text-on-surface text-center font-medium">{customer.orders}</td>
                  <td className="py-3 px-6 font-mono font-medium text-on-surface">{customer.spent}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{customer.joined}</td>
                  <td className="py-3 px-6"><StatusBadge status={customer.status} /></td>
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
        <Pagination current={page} total={3942} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default CustomersPage;

