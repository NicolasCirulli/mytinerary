import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@features/auth/store/auth.store';
import { AdminCities } from './AdminCities';
import { AdminItineraries } from './AdminItineraries';
import { AdminActivities } from './AdminActivities';
import { AdminOverview } from './AdminOverview';

type AdminView = 'dashboard' | 'cities' | 'itineraries' | 'activities';

// --- Icon Components ---

const DashboardIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);

const CityIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
);

const ItineraryIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);

const ActivityIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const LogoutIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

const MenuIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
);

// --- Sidebar Navigation Config ---

interface NavItem {
  id: AdminView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'cities', label: 'Cities', icon: CityIcon },
  { id: 'itineraries', label: 'Itineraries', icon: ItineraryIcon },
  { id: 'activities', label: 'Activities', icon: ActivityIcon },
];

// --- Main Component ---

export const AdminDashboard = () => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityItineraryId, setActivityItineraryId] = useState<string>('');
  const user = useAuthStore((state) => state.user);
  const setLogout = useAuthStore((state) => state.setLogout);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLogout();
    navigate('/auth/login');
  };

  const handleNavClick = (id: AdminView) => {
    setActiveView(id);
    setSidebarOpen(false);
  };

  const handleManageActivities = (itineraryId: string) => {
    setActivityItineraryId(itineraryId);
    setActiveView('activities');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r border-border bg-card transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Mytinerary</p>
            <p className="text-[10px] font-medium text-primary uppercase tracking-widest">Admin Console</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className={isActive ? 'text-primary' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border px-3 py-4 space-y-1">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-card/80 backdrop-blur-xl px-4 py-3 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <MenuIcon />
            </button>
            <h2 className="text-base font-bold text-foreground">Mytinerary Admin</h2>
            <nav className="hidden sm:flex items-center gap-1 text-sm" aria-label="Top navigation">
              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'dashboard'
                    ? 'text-foreground underline underline-offset-4 decoration-primary decoration-2'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Overview
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <img
                src={user.image || '/no-image-stock.png'}
                alt={`${user.first_name}'s avatar`}
                className="h-8 w-8 rounded-full object-cover border border-border"
              />
            )}
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeView === 'dashboard' && <AdminOverview onNavigate={setActiveView} />}
          {activeView === 'cities' && <AdminCities />}
          {activeView === 'itineraries' && <AdminItineraries onManageActivities={handleManageActivities} />}
          {activeView === 'activities' && <AdminActivities preselectedItineraryId={activityItineraryId} />}
        </div>
      </div>
    </div>
  );
};