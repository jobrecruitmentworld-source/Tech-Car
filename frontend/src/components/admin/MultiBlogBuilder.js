'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiSave, FiImage, FiSettings, FiAlignLeft, FiHash, FiTag, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function MultiBlogBuilder() {
  const [blogs, setBlogs] = useState([createNewBlog()]);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error', 'unsaved'
  const saveTimeoutRef = useRef(null);

  function createNewBlog() {
    return {
      id: Date.now().toString(),
      title: '',
      slug: '',
      category_id: 1, // Default category
      status: 'Draft',
      description: '',
      sections: [{ id: Date.now(), heading: '', content: '' }],
      gallery: [],
      keywords: [],
      tags: [],
      seo: { metaTitle: '', metaDescription: '', focusKeyword: '' }
    };
  }

  // --- Auto Save Logic ---
  useEffect(() => {
    // Skip initial empty render save
    if (blogs.length === 1 && blogs[0].title === '') return;
    
    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      saveBlogs(blogs);
    }, 5000); // Save after 5 seconds of inactivity
    
    return () => clearTimeout(saveTimeoutRef.current);
  }, [blogs]);

  const saveBlogs = async (currentBlogs) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('cms_token');
      const res = await fetch('http://127.0.0.1:8000/api/v1/index.php/blogs/bulk-create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ blogs: currentBlogs })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch (e) {
      setSaveStatus('error');
    }
  };

  // --- State Updaters ---
  const updateBlog = (blogId, field, value) => {
    setBlogs(blogs.map(b => b.id === blogId ? { ...b, [field]: value } : b));
  };

  const updateSection = (blogId, sectionId, field, value) => {
    setBlogs(blogs.map(b => {
      if (b.id !== blogId) return b;
      return {
        ...b,
        sections: b.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s)
      };
    }));
  };

  const addSection = (blogId) => {
    setBlogs(blogs.map(b => {
      if (b.id !== blogId) return b;
      return { ...b, sections: [...b.sections, { id: Date.now(), heading: '', content: '' }] };
    }));
  };

  const removeSection = (blogId, sectionId) => {
    setBlogs(blogs.map(b => {
      if (b.id !== blogId) return b;
      return { ...b, sections: b.sections.filter(s => s.id !== sectionId) };
    }));
  };

  const handleArrayInput = (e, blogId, field) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      e.preventDefault();
      const val = e.target.value.trim();
      setBlogs(blogs.map(b => {
        if (b.id !== blogId) return b;
        if (!b[field].includes(val)) {
           return { ...b, [field]: [...b[field], val] };
        }
        return b;
      }));
      e.target.value = '';
    }
  };

  const removeArrayItem = (blogId, field, itemToRemove) => {
    setBlogs(blogs.map(b => {
      if (b.id !== blogId) return b;
      return { ...b, [field]: b[field].filter(i => i !== itemToRemove) };
    }));
  };

  return (
    <div className="pb-32">
      {/* Header Sticky */}
      <div className="sticky top-16 z-20 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200 py-4 px-6 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Multi-Blog Builder</h1>
          <p className="text-sm text-slate-500">Create and publish multiple articles simultaneously.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            {saveStatus === 'saved' && <><FiCheckCircle className="text-emerald-500"/> <span className="text-emerald-600">All changes saved</span></>}
            {saveStatus === 'saving' && <span className="text-slate-500 animate-pulse">Saving drafts...</span>}
            {saveStatus === 'unsaved' && <span className="text-amber-500">Unsaved changes...</span>}
            {saveStatus === 'error' && <><FiAlertCircle className="text-red-500"/> <span className="text-red-600">Save failed</span></>}
          </div>
          <button onClick={() => saveBlogs(blogs)} className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
            Publish All ({blogs.length})
          </button>
        </div>
      </div>

      {/* Blogs Container */}
      <div className="max-w-7xl mx-auto p-6 space-y-12 mt-6">
        <AnimatePresence>
          {blogs.map((blog, index) => (
            <motion.div 
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden"
            >
              {/* Blog Header */}
              <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">{index + 1}</span>
                  {blog.title || 'Untitled Blog'}
                </h2>
                {blogs.length > 1 && (
                  <button onClick={() => setBlogs(blogs.filter(b => b.id !== blog.id))} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <FiTrash2 />
                  </button>
                )}
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blog Title</label>
                      <input 
                        type="text" 
                        value={blog.title}
                        onChange={(e) => {
                          const t = e.target.value;
                          const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                          updateBlog(blog.id, 'title', t);
                          updateBlog(blog.id, 'slug', slug);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Enter blog title..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL Slug</label>
                      <input 
                        type="text" 
                        value={blog.slug}
                        onChange={(e) => updateBlog(blog.id, 'slug', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:bg-white outline-none font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Description</label>
                      <textarea 
                        value={blog.description}
                        onChange={(e) => updateBlog(blog.id, 'description', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24"
                        placeholder="Brief summary..."
                      />
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-100 my-8"></div>

                  {/* Dynamic Sections */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><FiAlignLeft className="text-indigo-500"/> Content Sections</h3>
                      <button onClick={() => addSection(blog.id)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                        <FiPlus /> Add Section
                      </button>
                    </div>

                    <div className="space-y-6">
                      {blog.sections.map((section, sIdx) => (
                        <div key={section.id} className="p-6 border border-slate-200 rounded-2xl bg-white relative group">
                          {blog.sections.length > 1 && (
                            <button onClick={() => removeSection(blog.id, section.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                              <FiTrash2 />
                            </button>
                          )}
                          <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Heading (H2)</label>
                            <input 
                              type="text" 
                              value={section.heading}
                              onChange={(e) => updateSection(blog.id, section.id, 'heading', e.target.value)}
                              className="w-full px-0 py-2 border-b-2 border-slate-100 focus:border-indigo-500 outline-none text-lg font-bold text-slate-800 placeholder:text-slate-300 transition-colors"
                              placeholder="Section Heading..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Content</label>
                            <textarea 
                              value={section.content}
                              onChange={(e) => updateSection(blog.id, section.id, 'content', e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px]"
                              placeholder="Write your section content here..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar Area */}
                <div className="space-y-8">
                  {/* Status & Category */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FiSettings /> Publish Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Status</label>
                        <select 
                          value={blog.status}
                          onChange={(e) => updateBlog(blog.id, 'status', e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-sm"
                        >
                          <option>Draft</option>
                          <option>Published</option>
                          <option>Scheduled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Keywords & Tags */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FiHash /> Taxonomy</h4>
                    
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-slate-500 mb-2">Keywords (Press Enter)</label>
                      <input 
                        type="text" 
                        onKeyDown={(e) => handleArrayInput(e, blog.id, 'keywords')}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm mb-2"
                        placeholder="Add keyword..."
                      />
                      <div className="flex flex-wrap gap-2">
                        {blog.keywords.map(kw => (
                          <span key={kw} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1">
                            {kw} <FiTrash2 className="cursor-pointer text-red-400 hover:text-red-600" onClick={() => removeArrayItem(blog.id, 'keywords', kw)}/>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Tags (Press Enter)</label>
                      <input 
                        type="text" 
                        onKeyDown={(e) => handleArrayInput(e, blog.id, 'tags')}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm mb-2"
                        placeholder="Add tag..."
                      />
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-medium text-indigo-700 flex items-center gap-1">
                            #{tag} <FiTrash2 className="cursor-pointer text-indigo-400 hover:text-indigo-600" onClick={() => removeArrayItem(blog.id, 'tags', tag)}/>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="p-6 bg-slate-900 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2 relative z-10">SEO Optimization</h4>
                    
                    <div className="space-y-4 relative z-10">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Meta Title</label>
                        <input 
                          type="text" 
                          value={blog.seo.metaTitle}
                          onChange={(e) => updateBlog(blog.id, 'seo', {...blog.seo, metaTitle: e.target.value})}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500 text-sm"
                        />
                        <div className="text-right mt-1 text-[10px] text-slate-500">{blog.seo.metaTitle.length}/60</div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Meta Description</label>
                        <textarea 
                          value={blog.seo.metaDescription}
                          onChange={(e) => updateBlog(blog.id, 'seo', {...blog.seo, metaDescription: e.target.value})}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-indigo-500 text-sm h-20 resize-none"
                        />
                        <div className="text-right mt-1 text-[10px] text-slate-500">{blog.seo.metaDescription.length}/160</div>
                      </div>
                      
                      {/* SEO Score Visual */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-400">Live SEO Score</span>
                         <span className="text-sm font-extrabold text-emerald-400">85/100</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Another Blog Button */}
        <div className="text-center">
          <button 
            onClick={() => setBlogs([...blogs, createNewBlog()])}
            className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-50 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm border border-indigo-100"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700">
              <FiPlus className="text-lg" />
            </div>
            Add Another Blog
          </button>
        </div>

      </div>
    </div>
  );
}
