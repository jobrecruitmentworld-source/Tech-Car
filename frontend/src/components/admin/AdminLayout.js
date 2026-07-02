'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiHome, FiUsers, FiBox, FiFileText, FiSettings, 
  FiSearch, FiBell, FiMenu, FiX, FiCommand 
} from 'react-icons/fi';

const menuItems = [
  { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: FiFileText, label: 'Blogs & CMS', path: '/admin/editor' },
  { icon: FiBox, label: 'Products Catalog', path: '/admin/products' },
  { icon: FiUsers, label: 'Users & Roles', path: '/admin/users' },
  { icon: FiSettings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-blue-100 selection:text-blue-900 text-slate-800">
      
      {/* Mobile Sidebar Overlay */}
      {!sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Glassmorphism Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden shrink-0"
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">B</div>
            <span className="font-bold text-slate-900 tracking-tight whitespace-nowrap">Enterprise CMS</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Menu</div>
          <nav className="space-y-1">
            {menuItems.map((item, idx) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link key={idx} href={item.path}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                    <item.icon className={`text-lg ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100/50">
           <div className="flex items-center gap-3 px-3 py-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs">
               AD
             </div>
             <div>
               <p className="text-sm font-bold text-slate-900">Admin User</p>
               <p className="text-xs text-slate-500">Super Admin</p>
             </div>
           </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 sticky top-0 z-30 bg-white/70 backdrop-blur-lg border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
            
            {/* Command Palette Trigger */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 border border-slate-200/60 rounded-lg text-sm text-slate-500 hover:bg-slate-200/80 transition-colors cursor-pointer w-64">
              <FiSearch />
              <span>Search anything...</span>
              <div className="ml-auto flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-sm text-[10px] font-sans">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-sm text-[10px] font-sans">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
              <FiBell className="text-xl" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            <button className="px-4 py-1.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-colors shadow-sm">
              Live Site
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
