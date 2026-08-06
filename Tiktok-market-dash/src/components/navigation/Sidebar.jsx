import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useStoreConnection } from '@/contexts/StoreConnectionContext';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.84a8.16 8.16 0 0 0 4.77 1.52V6.92a4.85 4.85 0 0 1-1-.23z" />
  </svg>
);

const tiktokItems = [
  { label: 'Campaigns', iconType: 'material', icon: 'campaign', route: ROUTES.CAMPAIGNS },
  { label: 'Ad Manager', iconType: 'material', icon: 'smart_display', route: ROUTES.ADS },
  { label: 'Audience', iconType: 'material', icon: 'people_alt', route: ROUTES.AUDIENCE },
];

const storeItems = [
  { label: 'Products', icon: 'inventory_2', route: ROUTES.PRODUCTS },
  { label: 'Orders', icon: 'shopping_cart', route: ROUTES.ORDERS },
  { label: 'Inventory', icon: 'warehouse', route: ROUTES.INVENTORY },
  { label: 'Customers', icon: 'group', route: ROUTES.CUSTOMERS },
];

// Insight items removed (Analytics and Media deleted)

const bottomItems = [
  { label: 'Settings', icon: 'settings', route: ROUTES.SETTINGS },
];

const activeClass = 'flex items-center gap-3 px-3 py-2.5 bg-primary-container text-on-primary-container rounded-lg border-l-4 border-primary';
const inactiveClass = 'flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-variant/50 transition-colors rounded-lg hover:text-on-surface';

const NavItem = ({ label, icon, route, iconType, end }) => (
  <NavLink
    to={route}
    end={end}
    className={({ isActive }) => isActive ? activeClass : inactiveClass}
  >
    {({ isActive }) => (
      <>
        {iconType === 'tiktok'
          ? <span className={isActive ? 'text-on-primary-container' : 'text-on-surface-variant'}><TikTokIcon /></span>
          : <span className="material-symbols-outlined text-[20px] transition-colors shrink-0" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
        }
        <span className="text-body-sm font-medium">{label}</span>
      </>
    )}
  </NavLink>
);

const SectionLabel = ({ children }) => (
  <p className="text-label-caps text-outline uppercase tracking-widest px-3 pt-4 pb-1 first:pt-0">{children}</p>
);

const Divider = () => <div className="h-px bg-outline-variant/30 my-2 mx-2" />;

const Sidebar = () => {
  const navigate = useNavigate();
  const { isConnected, openConnectModal } = useStoreConnection();

  return (
    <nav className="hidden md:flex flex-col h-full border-r border-outline-variant/30 bg-surface-container-low fixed left-0 top-0 w-sidebar-width z-50">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shrink-0">
          <TikTokIcon />
        </div>
        <div>
          <h1 className="text-body-md font-bold text-on-background leading-none">GrowthAI</h1>
          <p className="text-label-caps text-on-surface-variant mt-0.5">TikTok Marketing</p>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-0.5">
        <NavItem label="Dashboard" icon="dashboard" route={ROUTES.DASHBOARD} end />

        <Divider />
        <SectionLabel>TikTok Ads</SectionLabel>
        {tiktokItems.map((item) => <NavItem key={item.route} {...item} />)}

        <Divider />
        <SectionLabel>Store</SectionLabel>
        {storeItems.map((item) => <NavItem key={item.route} {...item} />)}

        <Divider />
        {bottomItems.map((item) => <NavItem key={item.route} {...item} />)}
      </div>

      {/* CTA */}
      <div className="p-4 mt-auto border-t border-outline-variant/20">
        <button
          onClick={() => {
            if (isConnected) {
              navigate(ROUTES.SETTINGS);
            } else {
              openConnectModal('Shopify');
            }
          }}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isConnected ? 'storefront' : 'link'}
          </span>
          {isConnected ? 'Manage Connected Store' : 'Connect Shop'}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
