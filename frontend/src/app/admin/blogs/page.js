'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiEye } from 'react-icons/fi';

export default function AdminBlogsList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs?admin=true')
      .then(res => res.json())
      .then(data => {
        setBlogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Blogs</h1>
          <p className="text-slate-500 mt-1">View, edit, and publish your content.</p>
        </div>
        <Link href="/admin/blogs/create" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md shadow-blue-200">
          <FiPlus size={18} /> Create New Blog
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Views</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-medium">Loading your blogs...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center">
                    <p className="text-slate-500 text-lg mb-4">You haven't created any blogs yet.</p>
                    <Link href="/admin/blogs/create" className="text-blue-600 font-semibold hover:underline">
                      Create your first blog &rarr;
                    </Link>
                  </td>
                </tr>
              ) : (
                blogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-slate-900 font-bold mb-1 line-clamp-1">{blog.title}</p>
                      <p className="text-sm text-slate-400">{new Date(blog.published_at || blog.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {blog.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        blog.status === 'Published' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">
                      {blog.views}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-3">
                        <a 
                          href={`/blog/${blog.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <FiEye size={16} /> View
                        </a>
                        <Link 
                          href={`/admin/blogs/edit/${blog.id}`} 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                        >
                          <FiEdit2 size={14} /> Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
