export const mockInventory = [
  { id: '1', name: 'Aura Pro Noise Cancelling Headphones', sku: 'AUR-PRO-NC-BLK', category: 'Electronics > Audio', inStock: 342, reserved: 18, reorderPoint: 50, status: 'In Stock' },
  { id: '2', name: 'Chrono M2 Smartwatch', sku: 'CHR-M2-SLV', category: 'Electronics > Wearables', inStock: 12, reserved: 3, reorderPoint: 30, status: 'Low Stock' },
  { id: '3', name: 'USB-C Hub Pro', sku: 'USB-HUB-PRO', category: 'Electronics > Accessories', inStock: 5, reserved: 1, reorderPoint: 20, status: 'Low Stock' },
  { id: '4', name: 'Ergo Mesh Office Chair', sku: 'ERG-CH-BLK', category: 'Furniture > Office', inStock: 0, reserved: 0, reorderPoint: 10, status: 'Out of Stock' },
  { id: '5', name: 'Desk Mat XL', sku: 'DSK-MAT-XL', category: 'Accessories > Desk', inStock: 8, reserved: 2, reorderPoint: 15, status: 'Low Stock' },
  { id: '6', name: 'Mechanical Keyboard TKL', sku: 'KB-MEC-TKL', category: 'Electronics > Peripherals', inStock: 178, reserved: 12, reorderPoint: 40, status: 'In Stock' },
  { id: '7', name: 'LED Monitor 27"', sku: 'MON-LED-27', category: 'Electronics > Displays', inStock: 64, reserved: 8, reorderPoint: 20, status: 'In Stock' },
];

export const inventoryStats = [
  { label: 'Total SKUs', value: '247', icon: 'inventory_2', change: '+3 this week' },
  { label: 'Low Stock Items', value: '3', icon: 'warning', change: '↑ 1 since yesterday', alert: true },
  { label: 'Out of Stock', value: '1', icon: 'remove_shopping_cart', change: 'Restock needed', alert: true },
  { label: 'Total Units', value: '12,840', icon: 'stacked_bar_chart', change: '+240 this month' },
];
