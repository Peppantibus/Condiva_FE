import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { useSession } from '../state/session';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { LogOutIcon } from './ui/Icons';
import { Button } from './ui/Button';
import { NotificationsBell } from './NotificationsBell';

const AppLayout: React.FC = () => {
  const { logout } = useAuth();
  const { activeCommunityName } = useSession();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/community')) return activeCommunityName || 'Community';
    if (pathname.startsWith('/items')) return 'Oggetti';
    if (pathname.startsWith('/requests')) return 'Richieste';
    if (pathname.startsWith('/me')) return 'Profilo';
    if (pathname === '/dashboard') return 'Home';
    return 'Condiva';
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-[var(--bottom-nav-height)] lg:pb-0 lg:pl-64">
      <SideNav />

      {/* Top Header - Mobile Optimized, Adapted for Desktop */}
      <header
        className={`fixed top-0 left-0 right-0 lg:left-64 z-40 bg-white transition-shadow duration-200 px-4 lg:px-8 h-[var(--header-height)] flex items-center justify-between
          ${scrolled ? 'shadow-md' : 'border-b border-slate-100'}
        `}
      >
        <div className="flex items-center gap-2 max-w-md lg:max-w-7xl w-full mx-auto justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent truncate flex-1">
            {getPageTitle(location.pathname)}
          </h1>

          <div className="flex items-center gap-2">
            <span className="hidden lg:block text-sm text-slate-500 mr-2">
              {activeCommunityName}
            </span>
            <NotificationsBell />
            <Button variant="ghost" size="sm" onClick={logout} className="!p-2 text-slate-400 lg:hidden">
              <LogOutIcon className="w-5 h-5" />
            </Button>
            {/* Desktop Profile/Logout could go here if not in sidebar, but kept sidebar-only for logout for now to be clean */}
            <div className="hidden lg:block w-8 h-8 rounded-full bg-slate-200" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-[calc(var(--header-height)+16px)] lg:pt-[calc(var(--header-height)+32px)] px-4 lg:px-8 max-w-md lg:max-w-7xl mx-auto w-full min-h-[calc(100vh-var(--bottom-nav-height))] lg:min-h-screen transition-[padding] duration-200">
        <div className="mx-auto w-full lg:max-w-none">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
