import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import tourism_app_icon from "../../../public/tourism_app_icon.png";
import {
  LayoutGrid, MapPinned, Tags, Images, CalendarDays,
  Star, Heart, Trash2, Settings, LogOut,
  Users, User, X, FileText, ShieldCheck, Bell, Globe, Building2
} from "lucide-react";
import LogoutAlert from './LogoutAlert';
import { isFullAdminRole, normalizeRole } from '../../services/authService';

export default function Sidebar({ isOpen, setIsOpen, isExpanded }) {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    const handleUserSync = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
      } catch (e) { }
    };

    window.addEventListener('storage', handleUserSync);
    window.addEventListener('user-profile-updated', handleUserSync);
    return () => {
      window.removeEventListener('storage', handleUserSync);
      window.removeEventListener('user-profile-updated', handleUserSync);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  const rawRole = user?.role || 'admin';
  const normRole = normalizeRole(rawRole);
  const isPrivileged = isFullAdminRole(rawRole);
  const isSuperAdmin = normRole === 'super_admin';

  const displayRole = (() => {
    if (normRole === 'super_admin') return 'Super Admin';
    if (normRole === 'admin') return 'Admin';
    if (normRole === 'guide_editor' || normRole === 'tourism_content_editor') return 'Tourism Content Editor';
    if (normRole === 'business_owner') return 'Business Owner';
    return 'User';
  })();

  // Navigation Items defined per role
  const managementItems = [
    { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { name: "Categories", icon: Tags, path: "/categories" },
    { name: "Places", icon: MapPinned, path: "/place" },
    ...(isPrivileged ? [
      { name: "Businesses", icon: Building2, path: "/businesses" },
    ] : []),
    { name: "Provinces", icon: Globe, path: "/provinces" },
    { name: "Galleries", icon: Images, path: "/galleries" },
    { name: "Events", icon: CalendarDays, path: "/events" },
  ];

  const engagementItems = [
    { name: "Ratings & Reviews", icon: Star, path: "/ratings" },
    { name: "Favorites", icon: Heart, path: "/favorites" },
    { name: "Notifications", icon: Bell, path: "/notifications" },
    ...(isPrivileged ? [
      { name: "Reports", icon: FileText, path: "/reports" },
      { name: "Security Alerts", icon: ShieldCheck, path: "/security" },
    ] : []),
    ...(isSuperAdmin ? [
      { name: "Deletion Requests", icon: Trash2, path: "/deletion-requests" },
    ] : []),
  ];

  const accountItems = [
    ...(isPrivileged ? [{ name: "Users", icon: Users, path: "/users" }] : []),
    { name: "Profile", icon: User, path: "/profile" },
    ...(isPrivileged ? [{ name: "Settings", icon: Settings, path: "/settings" }] : []),
    { name: "Logout", icon: LogOut, action: "logout" },
  ];

  const userName = user?.name || 'Administrator';
  const userAvatar = user?.avatar || null;

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || (item.path === '/place' && location.pathname === '/places');

    if (item.action === 'logout') {
      return (
        <button
          key={item.name}
          type="button"
          onClick={() => setShowLogoutAlert(true)}
          className="group relative flex items-center w-full px-3 py-1.5 my-0.5 rounded-md cursor-pointer transition-colors duration-150 overflow-hidden text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300"
          aria-label="Log out"
        >
          <div className="flex items-center w-full min-w-0">
            <div className="flex items-center justify-center w-5 h-5 shrink-0">
              <Icon size={18} />
            </div>
            <span className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${isExpanded ? 'ml-3 opacity-100 max-w-[160px]' : 'opacity-100 md:opacity-0 md:max-w-0 md:overflow-hidden md:ml-0'}`}>
              {item.name}
            </span>
          </div>
          {!isExpanded && (
            <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md bg-gray-900 dark:bg-zinc-950 border border-gray-800 dark:border-zinc-800 text-white">
              {item.name}
            </div>
          )}
        </button>
      );
    }

    return (
      <Link
        to={item.path || '#'}
        key={item.name}
        className={`group relative flex items-center px-3 py-1.5 my-0.5 rounded-md cursor-pointer transition-colors duration-150 overflow-hidden ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-600/15 text-[#003E83] dark:text-blue-400 font-semibold shadow-xs'
            : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/70'
        }`}
        aria-label={item.name}
      >
        <div className="flex items-center w-full min-w-0">
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            <Icon size={18} />
          </div>

          <span className={`text-sm whitespace-nowrap transition-all duration-200 ${isExpanded ? 'ml-3 opacity-100 max-w-[160px]' : 'opacity-100 md:opacity-0 md:max-w-0 md:overflow-hidden md:ml-0'}`}>
            {item.name}
          </span>
        </div>

        {!isExpanded && (
          <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md bg-gray-900 dark:bg-zinc-950 border border-gray-800 dark:border-zinc-800 text-white">
            {item.name}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        ref={sidebarRef}
        className={`fixed md:static inset-y-0 left-0 z-40 transition-all duration-200 flex flex-col bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isExpanded ? 'w-56' : 'w-56 md:w-18'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 overflow-hidden shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
          <div className="flex items-center gap-2.5 w-full min-w-0">
            <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-zinc-700 transition-colors">
              <img src={tourism_app_icon} alt="AngkorVerses" className="w-7 h-7 object-contain" />
            </div>
            <div className={`flex flex-col whitespace-nowrap transition-all duration-200 ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-100 md:opacity-0 md:max-w-0 md:overflow-hidden'}`}>
              <span className="font-bold text-sm leading-tight text-gray-900 dark:text-white">AngkorVerses</span>
              <span className="text-[10px] font-normal text-gray-500 dark:text-zinc-400">Admin Portal</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded transition-colors shrink-0 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Areas */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-4">
          <div>
            <h3 className={`px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 transition-colors ${isExpanded ? 'opacity-100 mb-1' : 'opacity-100 md:opacity-0 md:h-0 md:overflow-hidden'}`}>
              Management
            </h3>
            <div className="flex flex-col">
              {managementItems.map(item => renderNavItem(item))}
            </div>
          </div>

          <div>
            <h3 className={`px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 transition-colors ${isExpanded ? 'opacity-100 mb-1' : 'opacity-100 md:opacity-0 md:h-0 md:overflow-hidden'}`}>
              Engagement
            </h3>
            <div className="flex flex-col">
              {engagementItems.map(item => renderNavItem(item))}
            </div>
          </div>

          <div>
            <h3 className={`px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 transition-colors ${isExpanded ? 'opacity-100 mb-1' : 'opacity-100 md:opacity-0 md:h-0 md:overflow-hidden'}`}>
              Preferences
            </h3>
            <div className="flex flex-col">
              {accountItems.map(item => renderNavItem(item))}
            </div>
          </div>
        </div>

        {/* Profile Card Section */}
        <div className="h-14 px-2.5 shrink-0 flex items-center border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
          <Link
            to="/profile"
            className="w-full group relative flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-colors overflow-hidden"
            aria-label="User Profile"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-zinc-700">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div className={`flex flex-col min-w-0 transition-all duration-200 ${isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-100 md:opacity-0 md:max-w-0 md:overflow-hidden'}`}>
              <span className="text-xs font-medium truncate text-gray-900 dark:text-zinc-100">
                {userName}
              </span>
              <span className="text-[10px] truncate text-gray-500 dark:text-zinc-400">
                {displayRole}
              </span>
            </div>

            {!isExpanded && (
              <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md bg-gray-900 dark:bg-zinc-950 border border-gray-800 dark:border-zinc-800 text-white">
                {userName} ({displayRole})
              </div>
            )}
          </Link>
        </div>

      </aside>

      <LogoutAlert
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        onLogout={() => {}}
      />
    </>
  );
}
