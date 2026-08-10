import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '@/components/navigation/Sidebar';
import Navbar from '@/components/navigation/Navbar';
import ConnectStoreModal from '@/components/modals/ConnectStoreModal';
import TikTokConnectPrompt from '@/components/modals/TikTokConnectPrompt';
import AIInsightsPanel from '@/components/panels/AIInsightsPanel';
import { fetchDashboardOverview } from '@/features/dashboard/dashboardSlice';

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const dispatch = useDispatch();
  const selectedShopId = useSelector((s) => s.integrations?.selectedShopId);
  const storeCount = useSelector((s) => s.integrations?.stores?.length || 0);
  const integrationsStatus = useSelector((s) => s.integrations?.status);
  const range = useSelector((s) => s.dashboard?.range);

  // Re-fetch dashboard when the active shop filter changes — only if a shop is connected.
  useEffect(() => {
    if (integrationsStatus !== 'succeeded' || storeCount === 0) return;
    if (!selectedShopId) return;
    dispatch(fetchDashboardOverview(range || { preset: 'today' }));
  }, [dispatch, selectedShopId, storeCount, integrationsStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-sidebar-width z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-sidebar-width w-full h-full overflow-hidden">
        {/* Main Content Header */}
        <Navbar 
          onMenuToggle={() => setMobileSidebarOpen((o) => !o)} 
          onInsightsClick={() => setIsInsightsOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar mt-18 bg-background">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Global Modals */}
      <TikTokConnectPrompt />
      <ConnectStoreModal />
      <AIInsightsPanel isOpen={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
