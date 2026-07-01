'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFileText, FiExternalLink } from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Manage Blogs', href: '/admin/blogs', icon: FiFileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full sticky top-0 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">B</span>
          BlogCMS
        </Link>
      </div>
      
      <div className="flex-grow p-4">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            // Check if active: Exact match for dashboard, or starts with for nested routes like /admin/blogs/create
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(item.href);
              
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={isActive ? 'text-blue-600' : 'text-slate-400'} size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-100">
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <FiExternalLink size={18} className="text-slate-500" />
          View Public Site
        </Link>
      </div>
    </aside>
  );
}
