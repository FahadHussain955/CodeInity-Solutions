export const mockDashboardStats = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$84,320',
    change: '+12.5%',
    positive: true,
    icon: 'payments',
    route: '/dashboard/analytics',
  },
  {
    id: 'orders',
    label: 'Total Orders',
    value: '1,284',
    change: '+8.2%',
    positive: true,
    icon: 'shopping_cart',
    route: '/dashboard/orders',
  },
  {
    id: 'products',
    label: 'Active Products',
    value: '98',
    change: '+3',
    positive: true,
    icon: 'inventory_2',
    route: '/dashboard/products',
  },
  {
    id: 'customers',
    label: 'Total Customers',
    value: '3,942',
    change: '+5.1%',
    positive: true,
    icon: 'group',
    route: '/dashboard/customers',
  },
];

export const mockRecentOrders = [
  { id: 'ORD-1042', customer: 'Aisha Khan', product: 'Aura Pro Headphones', amount: '$299.00', status: 'Delivered', date: 'Aug 3, 2026' },
  { id: 'ORD-1041', customer: 'Bilal Ahmed', product: 'Chrono M2 Smartwatch', amount: '$149.50', status: 'Processing', date: 'Aug 3, 2026' },
  { id: 'ORD-1040', customer: 'Sara Malik', product: 'Ergo Mesh Chair', amount: '$399.00', status: 'Pending', date: 'Aug 2, 2026' },
  { id: 'ORD-1039', customer: 'Usman Ali', product: 'Aura Pro Headphones', amount: '$299.00', status: 'Delivered', date: 'Aug 2, 2026' },
];

export const mockRevenueChart = [
  { month: 'Feb', revenue: 42000 },
  { month: 'Mar', revenue: 58000 },
  { month: 'Apr', revenue: 51000 },
  { month: 'May', revenue: 67000 },
  { month: 'Jun', revenue: 73000 },
  { month: 'Jul', revenue: 84320 },
];

export const mockLowStock = [
  { name: 'Chrono M2 Smartwatch', stock: 12, sku: 'CHR-M2-SLV' },
  { name: 'USB-C Hub Pro', stock: 5, sku: 'USB-HUB-PRO' },
  { name: 'Desk Mat XL', stock: 8, sku: 'DSK-MAT-XL' },
];
