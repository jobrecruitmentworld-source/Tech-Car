'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiClock } from 'react-icons/fi';

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
          filteredBlogs.map((blog, index) => (
            <Link href={`/blog/${blog.slug}`} key={blog.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1">
              
              {/* Image Container */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                {blog.featured_image ? (
                  <Image 
                    src={getImageUrl(blog.featured_image)} 
                    alt={blog.title} 
                    fill
                    priority={index < 4 && activeCategory === 'All'}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                )}
                
                {/* Category Badge over image */}
                {blog.category_name && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-sm">
                      {blog.category_name}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content Container */}
              <div className="flex flex-col flex-grow p-6 md:p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-slate-500 text-base leading-relaxed mb-6 flex-grow line-clamp-3">
                  {blog.short_description || (blog.seo && blog.seo.meta_description ? blog.seo.meta_description : 'Read more about this topic inside...')}
                </p>
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden relative border border-slate-300">
                      <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Author" className="object-cover w-full h-full" />
                    </div>
                    <span className="flex items-center gap-1.5"><FiClock className="text-slate-400" /> {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  
                  <span className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Read <FiArrowRight className="ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
