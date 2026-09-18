import React from 'react';
import {
  PenLine,
  Home,
  FileText,
  History,
  Settings,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  savedDraftsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  savedDraftsCount,
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'new-message' as ActiveTab, label: 'New Message', icon: PenLine },
    {
      id: 'drafts' as ActiveTab,
      label: 'Drafts',
      icon: FileText,
      badge: savedDraftsCount > 0 ? savedDraftsCount : undefined,
    },
    { id: 'history' as ActiveTab, label: 'History', icon: History },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-60 shrink-0 h-screen sticky top-0 flex flex-col justify-between border-r border-[#E6E4DE] bg-[#F7F6F2]/90 backdrop-blur-xs select-none"
    >
      {/* Top Brand & Primary Nav */}
      <div className="p-5 flex flex-col gap-6">
        {/* Logo */}
        <button
          id="brand-logo-btn"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#242A33] text-white flex items-center justify-center font-serif text-sm tracking-tight shadow-xs transition-transform group-hover:scale-102">
            <span className="font-semibold">B</span>
            <span className="text-[#C5B39A] -ml-0.5">U</span>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-[#1C1B18] group-hover:text-black">
              Between Us
            </h1>
            <p className="text-[11px] text-[#7C7A75] font-normal tracking-wide">
              Interpersonal Writing
            </p>
          </div>
        </button>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EAE8E2] text-[#1C1B18] font-semibold shadow-2xs'
                    : 'text-[#63615C] hover:bg-[#EFEBEE] hover:text-[#1C1B18]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#242A33]' : 'text-[#8E8C86]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#E0DED7] text-[#55534E] font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Settings */}
      <div className="p-4 border-t border-[#E6E4DE] flex flex-col gap-2">
        <div className="px-2 py-1 text-[11px] text-[#8C8A84] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#697A62]" />
          <span>Intent & Boundary First</span>
        </div>

        <button
          id="nav-settings-btn"
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#EAE8E2] text-[#1C1B18]'
              : 'text-[#63615C] hover:bg-[#EFEBEE] hover:text-[#1C1B18]'
          }`}
        >
          <Settings className="w-4 h-4 text-[#8E8C86]" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
