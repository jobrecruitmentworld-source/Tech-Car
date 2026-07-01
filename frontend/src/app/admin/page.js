import { FiFileText, FiEye, FiTrendingUp } from 'react-icons/fi';

export const metadata = {
  title: 'Admin Dashboard | BlogCMS',
};

async function getDashboardData() {
  try {
    const res = await fetch('http://localhost:3000/api/blogs', { cache: 'no-store' });
    if (!res.ok) return { totalBlogs: 0, totalViews: 0 };
    const blogs = await res.json();
    
    // Count all blogs uploaded
    const totalBlogs = blogs.length;
    
    // Sum up all views across all blogs (assuming views are numbers or parsable strings)
    const totalViews = blogs.reduce((sum, blog) => sum + (parseInt(blog.views) || 0), 0);
    
    return { totalBlogs, totalViews };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return { totalBlogs: 0, totalViews: 0 };
  }
}

export default async function AdminDashboard() {
  const { totalBlogs, totalViews } = await getDashboardData();

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Total Blogs Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 font-medium mb-1">Total Uploaded Blogs</p>
            <h3 className="text-4xl font-extrabold text-slate-900">{totalBlogs}</h3>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FiFileText className="text-blue-600" size={32} />
          </div>
        </div>

        {/* Total Views Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 font-medium mb-1">Total Blog Views</p>
            <h3 className="text-4xl font-extrabold text-slate-900">{totalViews}</h3>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FiEye className="text-purple-600" size={32} />
          </div>
        </div>
        
      </div>
      
      {/* Analytics Placeholder */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center min-h-[300px]">
        <div className="text-center text-slate-400">
           <FiTrendingUp size={48} className="mx-auto mb-4 opacity-50" />
           <p className="font-medium">Analytics charts will appear here as your audience grows.</p>
        </div>
      </div>
      
    </div>
  );
}
