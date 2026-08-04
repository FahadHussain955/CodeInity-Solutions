import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', route: ROUTES.DASHBOARD },
  { label: 'Products', icon: 'inventory_2', route: ROUTES.PRODUCTS },
  { label: 'Orders', icon: 'shopping_cart', route: ROUTES.ORDERS },
  { label: 'Inventory', icon: 'warehouse', route: ROUTES.INVENTORY },
  { label: 'Customers', icon: 'group', route: ROUTES.CUSTOMERS },
  { label: 'Analytics', icon: 'monitoring', route: ROUTES.ANALYTICS },
  { label: 'Media', icon: 'image', route: ROUTES.MEDIA },
];

const bottomItems = [
  { label: 'Settings', icon: 'settings', route: ROUTES.SETTINGS },
];

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex flex-col h-full border-r border-outline-variant/30 bg-surface-container-low fixed left-0 top-0 w-sidebar-width z-50">
      {/* Logo */}
      <div className="px-6 py-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
          <span className="material-symbols-outlined font-bold text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            insights
          </span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">GrowthAI</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant">Enterprise Merchant</p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-1">
        {navItems.map(({ label, icon, route }) => (
          <NavLink
            key={route}
            to={route}
            end={route === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg border-l-4 border-primary'
                : 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/50 transition-colors rounded-lg group hover:text-on-surface'
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[20px] transition-colors"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                <span className="font-body-sm text-body-sm font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="h-px bg-outline-variant/30 my-4 mx-2" />

        {bottomItems.map(({ label, icon, route }) => (
          <NavLink
            key={route}
            to={route}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg border-l-4 border-primary'
                : 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/50 transition-colors rounded-lg group hover:text-on-surface'
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[20px] transition-colors"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                <span className="font-body-sm text-body-sm font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* CTA Button */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => navigate(ROUTES.PRODUCT_NEW)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-3 rounded-lg font-body-sm text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Product
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
