import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, HandHeartIcon, UserIcon, PackageIcon, RepeatIcon } from './ui/Icons';

export const BottomNav: React.FC = () => {
    const navItems = [
        { to: '/dashboard', icon: <HomeIcon className="w-6 h-6" />, label: 'Home' },
        { to: '/community', icon: <UsersIcon className="w-6 h-6" />, label: 'Community' },
        { to: '/requests', icon: <HandHeartIcon className="w-6 h-6" />, label: 'Richieste' },
        { to: '/loans', icon: <RepeatIcon className="w-6 h-6" />, label: 'Prestiti' },
        // Adding Items as a distinct tab as per UI reference potential
        { to: '/items', icon: <PackageIcon className="w-6 h-6" />, label: 'Oggetti' },
        { to: '/me', icon: <UserIcon className="w-6 h-6" />, label: 'Profilo' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe pt-2 px-6 h-[var(--bottom-nav-height)] lg:hidden">
            <div className="flex justify-between items-center max-w-md mx-auto h-full pb-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full space-y-1
              transition-colors duration-200
              ${isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}
            `}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`transform transition-transform duration-200 ${isActive ? '-translate-y-1' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 absolute bottom-3`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
