'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiClock, FiEye } from 'react-icons/fi';

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

export default function BlogGrid({ initialBlogs }) {
  const [activeCategory, setActiveCategory] = useState('All');

  // Extract unique categories from blogs
  const categories = ['All', ...new Set(initialBlogs.map(b => b.category_name).filter(Boolean))];

  // Filter blogs based on selection
  const filteredBlogs = activeCategory === 'All' 
    ? initialBlogs 
    : initialBlogs.filter(b => b.category_name === activeCategory);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-xl text-slate-500 font-medium">
              No blogs found in this category.
            </p>
          </div>
        ) : (
          filteredBlogs.map((blog) => (
            <Link href={`/blog/${blog.slug}`} key={blog.id}>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 border border-slate-700 hover:border-indigo-500/50 flex flex-col h-full group">
                {/* Image Container with aspect ratio */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-700">
                  <img 
                    src={getImageUrl(blog.featured_image)} 
                    alt={blog.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Overlay gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Content Container */}
                <div className="p-6 flex flex-col flex-grow relative">
                  {/* Category Badge - Adjusted position */}
                  <div className="absolute -top-4 left-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500 text-white shadow-md">
                      {blog.category_name || 'Uncategorized'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mt-4 mb-3 line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                    {blog.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                    {blog.short_description || blog.long_description?.substring(0, 120) + '...'}
                  </p>
                  
                  {/* Footer section */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700 mt-auto">
                    <div className="flex items-center text-slate-500 text-xs font-medium gap-3">
                      <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md">
                        <FiEye size={14} className="text-indigo-400" /> {blog.views || 0}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md">
                        <FiClock size={14} className="text-indigo-400" /> 
                        {new Date(blog.created_at || blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
