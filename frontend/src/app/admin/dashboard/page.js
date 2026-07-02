'use client';

import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiFileText, FiDollarSign } from 'react-icons/fi';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: FiDollarSign, color: 'bg-emerald-500' },
    { title: 'Active Users', value: '2,314', change: '+15.2%', icon: FiUsers, color: 'bg-blue-500' },
    { title: 'Published Blogs', value: '142', change: '+5.4%', icon: FiFileText, color: 'bg-purple-500' },
    { title: 'Conversion Rate', value: '3.24%', change: '+1.2%', icon: FiTrendingUp, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back to your Enterprise CMS dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl text-white ${stat.color} shadow-sm`}>
                <stat.icon className="text-xl" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100/50 h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Traffic Overview</h3>
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
             <p className="text-sm text-slate-400 font-medium">Chart visualization placeholder</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/50 h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-6">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="flex gap-4">
                 <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                 <div>
                   <p className="text-sm font-medium text-slate-800">New user registered</p>
                   <p className="text-xs text-slate-500">2 minutes ago</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
