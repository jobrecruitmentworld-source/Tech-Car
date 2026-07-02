'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, FiFileText, FiExternalLink, 
  FiBox, FiList, FiGrid, FiSettings, FiImage,
  FiTag, FiLayers
} from 'react-icons/fi';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navGroups = [
    {
      label: 'Main',
      items: [
        { name: 'Dashboard', href: '/admin', icon: FiHome, exact: true },
      ]
    },
    {
      label: 'Catalog',
      items: [
        { name: 'Products', href: '/admin/products', icon: FiBox },
        { name: 'Categories', href: '/admin/categories', icon: FiGrid },
        { name: 'Brands & Series', href: '/admin/brands', icon: FiTag },
        { name: 'Spec Builder', href: '/admin/attributes', icon: FiList },
      ]
    },
    {
      label: 'Content',
      items: [
        { name: 'Posts & Blogs', href: '/admin/blogs', icon: FiFileText },
        { name: 'Media Library', href: '/admin/media', icon: FiImage },
      ]
    },
    {
      label: 'System',
      items: [
        { name: 'Settings', href: '/admin/settings', icon: FiSettings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shadow-xl text-slate-300">
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-lg">E</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">TechCMS</span>
        </Link>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
        <nav className="flex flex-col gap-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4">
                {group.label}
              </h3>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const isActive = item.exact 
                    ? pathname === item.href 
                    : pathname.startsWith(item.href);
                    
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-indigo-500/10 text-indigo-400 shadow-sm' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={isActive ? 'text-indigo-400' : 'text-slate-500'} size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <FiExternalLink size={16} className="text-slate-400" />
          View Live Site
        </Link>
      </div>
    </aside>
  );
}
