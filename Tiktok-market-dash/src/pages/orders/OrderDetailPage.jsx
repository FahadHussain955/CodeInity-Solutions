import { useParams, useNavigate } from 'react-router-dom';
import { mockOrders } from '@/data/mockOrders';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';

const timeline = [
  { label: 'Order Placed', time: '10:24 AM', done: true, icon: 'receipt_long' },
  { label: 'Payment Confirmed', time: '10:25 AM', done: true, icon: 'payments' },
  { label: 'Processing', time: '10:40 AM', done: true, icon: 'autorenew' },
  { label: 'Shipped', time: '2:15 PM', done: false, icon: 'local_shipping' },
  { label: 'Delivered', time: '—', done: false, icon: 'check_circle' },
];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = mockOrders.find((o) => o.id === id) || mockOrders[0];

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <button onClick={() => navigate(ROUTES.ORDERS)} className="text-label-caps uppercase tracking-wider hover:text-primary transition-colors">Orders</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">{order.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-display-lg-mobile text-on-background">{order.id}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">Placed on {order.date} · {order.items} item{order.items > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="toolbar-control flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Invoice
          </button>
          <button className="toolbar-control flex items-center gap-2 bg-primary text-on-primary px-4 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20">
              <h3 className="text-headline-md text-on-background">Order Items</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-outline text-[28px]">inventory_2</span>
                </div>
                <div className="flex-1">
                  <p className="text-body-md font-medium text-on-surface">{order.product}</p>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">Qty: {order.items} · SKU: AUR-PRO-NC-BLK</p>
                </div>
                <p className="text-body-md font-mono font-semibold text-on-surface">{order.amount}</p>
              </div>
            </div>
            <div className="border-t border-outline-variant/20 p-6 bg-surface-container-low/30">
              <div className="space-y-2 max-w-xs ml-auto">
                {[
                  { label: 'Subtotal', value: order.amount },
                  { label: 'Shipping', value: 'Free' },
                  { label: 'Tax', value: '$0.00' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="font-medium text-on-surface">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-outline-variant/20">
                  <span className="text-body-md font-semibold text-on-surface">Total</span>
                  <span className="text-body-md font-mono font-bold text-primary">{order.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-6">Order Timeline</h3>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-outline-variant/30" />
              <div className="space-y-6">
                {timeline.map(({ label, time, done, icon }) => (
                  <div key={label} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${done ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container border border-outline-variant/30 text-outline'}`}>
                      <span className="material-symbols-outlined text-[18px]" style={done ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                    </div>
                    <div className="pt-1.5">
                      <p className={`text-body-sm font-medium ${done ? 'text-on-surface' : 'text-on-surface-variant'}`}>{label}</p>
                      <p className="text-label-caps text-outline mt-0.5">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-4">Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-semibold shrink-0">
                {order.customer.charAt(0)}
              </div>
              <div>
                <p className="text-body-sm font-semibold text-on-surface">{order.customer}</p>
                <p className="text-label-caps text-outline">{order.email}</p>
              </div>
            </div>
            <div className="space-y-3 text-body-sm">
              {[
                { label: 'Total Orders', value: '8 orders' },
                { label: 'Total Spent', value: '$1,840.00' },
                { label: 'Member Since', value: 'Jan 2026' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-medium text-on-surface">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/dashboard/customers/C001')}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors"
            >
              View Profile
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Shipping Address */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-4">Shipping Address</h3>
            <div className="text-body-sm text-on-surface-variant space-y-1">
              <p className="font-medium text-on-surface">{order.customer}</p>
              <p>House 42, Street 7, F-8/3</p>
              <p>Islamabad, Pakistan</p>
              <p>44000</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-4">Payment</h3>
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
              <div>
                <p className="text-body-sm font-medium text-on-surface">{order.payment}</p>
                <p className="text-label-caps text-outline">Paid in full</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
