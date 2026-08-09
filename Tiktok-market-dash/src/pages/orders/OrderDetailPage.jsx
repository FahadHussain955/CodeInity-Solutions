import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants/routes';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  clearOrderNotice,
  clearSelectedOrder,
  fetchOrderById,
  updateOrderStatus,
} from '@/features/orders/ordersSlice';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected: order, detailStatus, actionStatus, error, notice } = useSelector(
    (state) => state.orders
  );
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id));
    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!notice && !error) return undefined;
    const t = window.setTimeout(() => dispatch(clearOrderNotice()), 3500);
    return () => window.clearTimeout(t);
  }, [notice, error, dispatch]);

  if (detailStatus === 'loading' && !order) {
    return (
      <div className="space-y-6 py-2">
        <p className="text-body-sm text-on-surface-variant">Loading order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 py-2">
        <button
          type="button"
          onClick={() => navigate(ROUTES.ORDERS)}
          className="text-label-caps uppercase tracking-wider text-primary"
        >
          Back to Orders
        </button>
        <p className="text-body-sm text-on-surface-variant">{error || 'Order not found.'}</p>
      </div>
    );
  }

  const customer = order.customer;
  const customerName = customer?.name || '—';
  const customerEmail = customer?.email || '—';
  const timeline = order.timeline || [];
  const items = order.items || [];

  const onStatusChange = async (next) => {
    setStatusOpen(false);
    if (next === order.statusRaw) return;
    await dispatch(updateOrderStatus({ id: order.id, status: next }));
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ORDERS)}
              className="text-label-caps uppercase tracking-wider hover:text-primary transition-colors"
            >
              Orders
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-display-lg-mobile text-on-background">{order.orderNumber}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Placed on {order.date} · {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 relative">
          <button
            type="button"
            className="toolbar-control flex items-center gap-2 bg-surface text-on-surface border border-outline-variant/50 px-4 rounded-lg text-body-sm font-medium hover:bg-surface-variant/30 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Invoice
          </button>
          <button
            type="button"
            onClick={() => setStatusOpen((v) => !v)}
            disabled={actionStatus === 'loading'}
            className="toolbar-control flex items-center gap-2 bg-primary text-on-primary px-4 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Update Status
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-2 z-20 min-w-[180px] rounded-lg border border-outline-variant/40 bg-surface shadow-lg py-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onStatusChange(opt.value)}
                  className={`w-full text-left px-4 py-2 text-body-sm hover:bg-surface-variant/40 ${
                    order.statusRaw === opt.value ? 'text-primary font-medium' : 'text-on-surface'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {(notice || error) && (
        <div
          className={`rounded-lg border px-4 py-3 text-body-sm ${
            error
              ? 'border-error/30 bg-error-container text-on-error-container'
              : 'border-success-border bg-success-bg text-success'
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20">
              <h3 className="text-headline-md text-on-background">Order Items</h3>
            </div>
            <div className="p-6 space-y-4">
              {items.length === 0 && (
                <p className="text-body-sm text-on-surface-variant">No line items.</p>
              )}
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-outline text-[28px]">
                      inventory_2
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md font-medium text-on-surface truncate">
                      {item.productName}
                    </p>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      Qty: {item.quantity}
                      {item.sku ? ` · SKU: ${item.sku}` : ''}
                    </p>
                  </div>
                  <p className="text-body-md font-mono font-semibold text-on-surface shrink-0">
                    {item.lineTotalFormatted}
                  </p>
                </div>
              ))}
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

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-6">Order Timeline</h3>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-outline-variant/30" />
              <div className="space-y-6">
                {timeline.map(({ label, time, done, icon }) => (
                  <div key={label} className="flex items-start gap-4 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        done
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container border border-outline-variant/30 text-outline'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={done ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        {icon}
                      </span>
                    </div>
                    <div className="pt-1.5">
                      <p
                        className={`text-body-sm font-medium ${
                          done ? 'text-on-surface' : 'text-on-surface-variant'
                        }`}
                      >
                        {label}
                      </p>
                      <p className="text-label-caps text-outline mt-0.5">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-4">Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-semibold shrink-0">
                {customerName.charAt(0)}
              </div>
              <div>
                <p className="text-body-sm font-semibold text-on-surface">{customerName}</p>
                <p className="text-label-caps text-outline">{customerEmail}</p>
              </div>
            </div>
            <div className="space-y-3 text-body-sm">
              {[
                {
                  label: 'Total Orders',
                  value: customer?.totalOrders != null ? `${customer.totalOrders} orders` : '—',
                },
                { label: 'Total Spent', value: customer?.totalSpent || '—' },
                { label: 'Member Since', value: customer?.memberSince || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-medium text-on-surface">{value}</span>
                </div>
              ))}
            </div>
            {customer?.id && (
              <button
                type="button"
                onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors"
              >
                View Profile
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-4">Shipping Address</h3>
            <div className="text-body-sm text-on-surface-variant space-y-1">
              <p className="font-medium text-on-surface">{customerName}</p>
              <p>{customer?.address || '—'}</p>
              <p>
                {[customer?.city, customer?.country].filter(Boolean).join(', ') || '—'}
              </p>
              {customer?.postalCode && <p>{customer.postalCode}</p>}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-4">Payment</h3>
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                credit_card
              </span>
              <div>
                <p className="text-body-sm font-medium text-on-surface">{order.payment}</p>
                <p className="text-label-caps text-outline">{order.paymentLabel || 'Recorded'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
