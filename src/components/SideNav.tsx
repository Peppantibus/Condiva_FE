import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, HandHeartIcon, UserIcon, PackageIcon, LogOutIcon, RepeatIcon } from './ui/Icons';
import { useAuth } from '../state/auth';
import { Button } from './ui/Button';
import logo from '../assets/logo.png';

export const SideNav: React.FC = () => {
    const { logout } = useAuth();

    const navItems = [
        { to: '/dashboard', icon: <HomeIcon className="w-6 h-6" />, label: 'Home' },
        { to: '/community', icon: <UsersIcon className="w-6 h-6" />, label: 'Community' },
        { to: '/requests', icon: <HandHeartIcon className="w-6 h-6" />, label: 'Richieste' },
        { to: '/loans', icon: <RepeatIcon className="w-6 h-6" />, label: 'Prestiti' },
        { to: '/items', icon: <PackageIcon className="w-6 h-6" />, label: 'Oggetti' },
        { to: '/me', icon: <UserIcon className="w-6 h-6" />, label: 'Profilo' },
    ];

    return (
        <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50">
            <div className="p-6 border-b border-slate-100 flex items-center justify-center lg:justify-start gap-3">
                <img src={logo} alt="Condiva Logo" width={1536} height={1024} loading="eager" decoding="async" className="h-10 w-auto object-contain" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent hidden lg:block">
                    Condiva
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-primary-50 text-primary-700 font-medium shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
                    onClick={logout}
                >
                    <LogOutIcon className="w-5 h-5" />
                    Esci
                </Button>
            </div>
        </aside>
    );
};
