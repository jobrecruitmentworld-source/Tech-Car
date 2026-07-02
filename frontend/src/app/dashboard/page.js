'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEdit, FiBookmark, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Basic client-side auth check
    const storedUser = localStorage.getItem('cms_user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    router.push('/login');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* User Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">B</div>
          <span className="font-bold text-slate-900 tracking-tight">BlogCMS</span>
        </Link>
        <div className="flex items-center gap-4">
           <span className="text-sm font-medium text-slate-600 hidden sm:block">Hello, {user.first_name}</span>
           <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
             <FiLogOut /> Logout
           </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
             <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
               {user.first_name ? user.first_name[0].toUpperCase() : <FiUser />}
             </div>
             <div>
               <h1 className="text-3xl font-extrabold text-slate-900">Welcome to your Portal</h1>
               <p className="text-slate-500 mt-1">Manage your drafts, submissions, and bookmarks.</p>
             </div>
           </div>
           
           {/* If user is an Admin, they should see a link to the Admin Panel */}
           {(user.roles.includes('Admin') || user.roles.includes('Super Admin')) && (
             <Link href="/admin/dashboard" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap">
               Go to Admin Panel
             </Link>
           )}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           
           <Link href="/admin/editor" className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all">
             <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
               <FiEdit />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-1">Create Blog</h3>
             <p className="text-sm text-slate-500">Use our AI-powered block editor to write a new masterpiece.</p>
           </Link>

           <Link href="#" className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all">
             <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
               <FiBookmark />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-1">Saved Bookmarks</h3>
             <p className="text-sm text-slate-500">Access the articles and blogs you've saved for later.</p>
           </Link>

           <Link href="#" className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition-all">
             <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
               <FiSettings />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-1">Profile Settings</h3>
             <p className="text-sm text-slate-500">Update your personal information and preferences.</p>
           </Link>

        </div>

      </main>
    </div>
  );
}
