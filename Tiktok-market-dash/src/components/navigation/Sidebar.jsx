import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useStoreConnection } from '@/contexts/StoreConnectionContext';
import nexoraLogo from '@/assets/nexora-logo.png';

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
        <span className="material-symbols-outlined text-[20px] transition-colors shrink-0" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
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
    <nav className="hidden md:flex flex-col h-full border-r border-outline-variant/30 bg-sidebar fixed left-0 top-0 w-sidebar-width z-50 transition-colors duration-200">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <img
          src={nexoraLogo}
          alt="Nexora"
          className="w-9 h-9 object-contain shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-body-md font-bold text-on-background leading-none">Nexora</h1>
          <p className="text-[10px] leading-snug text-on-surface-variant mt-1">AI powered commerce growth</p>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-0.5">
        <NavItem label="Dashboard" icon="dashboard" route={ROUTES.DASHBOARD} end />

        <Divider />
        <SectionLabel>Store</SectionLabel>
        {storeItems.map((item) => <NavItem key={item.route} {...item} />)}

        <Divider />
        <SectionLabel>TikTok Ads</SectionLabel>
        {tiktokItems.map((item) => <NavItem key={item.route} {...item} />)}

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
