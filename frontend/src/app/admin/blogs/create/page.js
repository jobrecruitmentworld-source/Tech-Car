'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { FiTrash2, FiPlus, FiImage, FiSave, FiSettings, FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function CreateBlog() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expandedBlog, setExpandedBlog] = useState(0);

  // Initial Empty Blog State
  const emptyBlog = {
    title: '',
    slug: '',
    category: '',
    status: 'Published',
    shortDesc: '',
    longDesc: '',
    featuredImage: null,
    sections: [{ heading: '', content: '', image: null }],
    gallery: [], // { image: null, altText: '', caption: '' }
    tags: '',
    keywords: '',
    seo: {
      meta_title: '', meta_description: '', canonical_url: '',
      og_title: '', og_description: '', og_image: null,
      twitter_card: 'summary_large_image', schema_jsonld: '', focus_keyword: ''
    }
  };

  const [blogs, setBlogs] = useState([{ ...emptyBlog }]);

  // Handlers for Blog Array
  const addBlog = () => {
    setBlogs([...blogs, { ...emptyBlog }]);
    setExpandedBlog(blogs.length);
  };

  const removeBlog = (index) => {
    if (blogs.length === 1) return;
    const updated = blogs.filter((_, i) => i !== index);
    setBlogs(updated);
    if (expandedBlog >= updated.length) setExpandedBlog(updated.length - 1);
  };

  const updateBlog = (index, field, value) => {
    const updated = [...blogs];
    updated[index][field] = value;
    
    // Auto generate slug if title changes and slug is empty or user typing title
    if (field === 'title' && !updated[index].slugModified) {
       updated[index].slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (field === 'slug') {
       updated[index].slugModified = true;
    }
    
    setBlogs(updated);
  };

  const updateBlogSEO = (blogIndex, field, value) => {
    const updated = [...blogs];
    updated[blogIndex].seo[field] = value;
    setBlogs(updated);
  };

  const addSection = (blogIndex) => {
    const updated = [...blogs];
    updated[blogIndex].sections.push({ heading: '', content: '', image: null });
    setBlogs(updated);
  };

  const removeSection = (blogIndex, secIndex) => {
    const updated = [...blogs];
    updated[blogIndex].sections = updated[blogIndex].sections.filter((_, i) => i !== secIndex);
    setBlogs(updated);
  };

  const updateSection = (blogIndex, secIndex, field, value) => {
    const updated = [...blogs];
    updated[blogIndex].sections[secIndex][field] = value;
    setBlogs(updated);
  };

  const addGalleryImage = (blogIndex) => {
    const updated = [...blogs];
    updated[blogIndex].gallery.push({ image: null, altText: '', caption: '' });
    setBlogs(updated);
  };

  const updateGallery = (blogIndex, imgIndex, field, value) => {
    const updated = [...blogs];
    updated[blogIndex].gallery[imgIndex][field] = value;
    setBlogs(updated);
  };

  const removeGalleryImage = (blogIndex, imgIndex) => {
    const updated = [...blogs];
    updated[blogIndex].gallery = updated[blogIndex].gallery.filter((_, i) => i !== imgIndex);
    setBlogs(updated);
  };

  // Upload Logic
  const handleImageUpload = async (file, seoName) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('seo_name', seoName || 'blog-image');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.url; 
    } catch (err) {
      console.error("Upload failed", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = [];

      for (let i = 0; i < blogs.length; i++) {
        const blog = blogs[i];
        
        // Upload Featured
        let featuredImageUrl = '';
        if (blog.featuredImage) {
          featuredImageUrl = await handleImageUpload(blog.featuredImage, blog.title);
        }

        // Upload OG Image
        let ogImageUrl = '';
        if (blog.seo.og_image) {
          ogImageUrl = await handleImageUpload(blog.seo.og_image, blog.title + '-og');
        }

        // Upload Section Images
        const processedSections = await Promise.all(blog.sections.map(async (sec, index) => {
          let secImgUrl = '';
          if (sec.image) {
            secImgUrl = await handleImageUpload(sec.image, sec.heading || blog.title);
          }
          return {
            heading: sec.heading,
            content: sec.content,
            image_url: secImgUrl,
            sort_order: index + 1
          };
        }));

        // Upload Gallery Images
        const processedGallery = await Promise.all(blog.gallery.map(async (gal, index) => {
           let galImgUrl = '';
           if (gal.image) {
              galImgUrl = await handleImageUpload(gal.image, blog.title + '-gallery');
           }
           return {
              image_url: galImgUrl,
              alt_text: gal.altText,
              caption: gal.caption,
              sort_order: index + 1
           }
        }));

        payload.push({
          title: blog.title,
          slug: blog.slug,
          short_description: blog.shortDesc,
          // Prepend longDesc as the first section
          sections: blog.longDesc ? [{ heading: '', content: blog.longDesc, image_url: '', sort_order: 0 }, ...processedSections] : processedSections,
          featured_image: featuredImageUrl,
          category_name: blog.category || 'General',
          author_id: 1, 
          status: blog.status,
          gallery: processedGallery,
          tags: blog.tags.split(',').map(t => t.trim()).filter(t => t).map((t, index) => ({ id: index+1, tag: t })),
          keywords: blog.keywords.split(',').map(k => k.trim()).filter(k => k).map((k, index) => ({ id: index+1, keyword: k })),
          seo: {
             ...blog.seo,
             og_image: ogImageUrl
          }
        });
      }

      // Save to Next.js Local Mock API
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`${payload.length} Blog(s) created successfully!`);
        router.push('/admin/blogs');
      } else {
        const errorData = await res.json();
        alert('Failed to save blogs: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the blogs.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#1e293b', outline: 'none', transition: 'all 0.2s ease', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' };
  const labelStyle = { display: 'block', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', fontSize: '0.9rem' };
  const sectionTitleStyle = { fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Blogs</h1>
            <p className="text-slate-500 mt-1 text-sm">Add multiple blog posts in a single click seamlessly.</p>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/admin/blogs" className="px-5 py-2.5 bg-white text-slate-700 rounded-xl font-semibold border border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
              Cancel
            </Link>
            <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-70">
              {loading ? 'Processing...' : <><FiSave size={18} /> Submit All Blogs</>}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {blogs.map((blog, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Blog Header (Accordion) */}
                <div 
                  className="bg-slate-50 hover:bg-slate-100 p-5 flex justify-between items-center cursor-pointer border-b border-slate-200 transition-colors"
                  onClick={() => setExpandedBlog(expandedBlog === index ? null : index)}
                >
                  <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800">{blog.title || 'Untitled Blog'}</h2>
                    <p className="text-sm text-slate-500 mt-1">Status: {blog.status} <span className="mx-2 text-slate-300">|</span> Category: {blog.category || 'Uncategorized'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {blogs.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeBlog(index); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Blog"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors">
                      {expandedBlog === index ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                    </button>
                  </div>
                </div>

                {/* Blog Body */}
                <AnimatePresence>
                  {expandedBlog === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-6 md:p-8 space-y-10 overflow-hidden"
                    >
                      
                      {/* Basic Info */}
                      <section>
                        <h3 style={sectionTitleStyle}><FiSettings className="text-blue-500" /> Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label style={labelStyle}>Blog Title *</label>
                            <input type="text" required style={inputStyle} value={blog.title} onChange={e => updateBlog(index, 'title', e.target.value)} placeholder="Enter an engaging title" />
                          </div>
                          <div>
                            <label style={labelStyle}>Blog Slug</label>
                            <input type="text" style={inputStyle} value={blog.slug} onChange={e => updateBlog(index, 'slug', e.target.value)} placeholder="auto-generated-slug" />
                          </div>
                          <div>
                            <label style={labelStyle}>Category (Type your own)</label>
                            <input type="text" required style={inputStyle} value={blog.category} onChange={e => updateBlog(index, 'category', e.target.value)} placeholder="e.g. Technology, Lifestyle..." />
                          </div>
                          <div>
                            <label style={labelStyle}>Status</label>
                            <select style={inputStyle} value={blog.status} onChange={e => updateBlog(index, 'status', e.target.value)}>
                              <option value="Draft">Draft</option>
                              <option value="Published">Published</option>
                              <option value="Scheduled">Scheduled</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <label style={labelStyle}>Short Description *</label>
                          <textarea required rows="3" style={inputStyle} value={blog.shortDesc} onChange={e => updateBlog(index, 'shortDesc', e.target.value)} placeholder="A brief summary for cards and feeds..."></textarea>
                        </div>
                        
                        <div className="mt-6">
                          <label style={labelStyle}>Featured Image *</label>
                          <input type="file" accept="image/*" style={inputStyle} onChange={e => updateBlog(index, 'featuredImage', e.target.files[0])} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                        </div>

                        <div className="mt-8">
                          <label style={labelStyle}>Long Description (Rich Text)</label>
                          <div className="bg-white overflow-hidden rounded-xl border border-slate-300 text-slate-800">
                             <ReactQuill theme="snow" value={blog.longDesc} onChange={(val) => updateBlog(index, 'longDesc', val)} modules={quillModules} className="h-64 mb-10" />
                          </div>
                        </div>
                      </section>

                      <hr className="border-slate-200" />

                      {/* Dynamic Sections */}
                      <section>
                        <h3 style={sectionTitleStyle}><FiCheckCircle className="text-purple-500" /> Dynamic Content Sections</h3>
                        <p className="text-sm text-slate-500 mb-5">Add unlimited custom sections to format the body of your blog.</p>
                        
                        {blog.sections.map((sec, secIndex) => (
                          <div key={secIndex} className="p-5 bg-slate-50 rounded-xl border border-slate-200 mb-5 relative group">
                            <button 
                              type="button" 
                              onClick={() => removeSection(index, secIndex)} 
                              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 transition-all"
                            >
                              <FiTrash2 size={18} />
                            </button>
                            <h4 className="font-bold text-slate-700 mb-4 text-md">Section {secIndex + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                               <div>
                                 <label style={labelStyle}>Heading</label>
                                 <input type="text" style={inputStyle} value={sec.heading} onChange={e => updateSection(index, secIndex, 'heading', e.target.value)} placeholder="Section Title" />
                               </div>
                               <div>
                                 <label style={labelStyle}>Section Image</label>
                                 <input type="file" accept="image/*" style={inputStyle} onChange={e => updateSection(index, secIndex, 'image', e.target.files[0])} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" />
                               </div>
                            </div>
                            <div>
                               <label style={labelStyle}>Content</label>
                               <div className="bg-white overflow-hidden rounded-xl border border-slate-300 text-slate-800">
                                 <ReactQuill theme="snow" value={sec.content} onChange={(val) => updateSection(index, secIndex, 'content', val)} modules={quillModules} className="h-48 mb-10" />
                               </div>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => addSection(index)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 font-semibold transition-colors text-sm">
                          <FiPlus size={18}/> Add Content Section
                        </button>
                      </section>

                      <hr className="border-slate-200" />

                      {/* Gallery */}
                      <section>
                         <h3 style={sectionTitleStyle}><FiImage className="text-emerald-500" /> Image Gallery</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                            {blog.gallery.map((img, imgIndex) => (
                               <div key={imgIndex} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                                  <button type="button" onClick={() => removeGalleryImage(index, imgIndex)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 transition-colors">
                                     <FiTrash2 size={16}/>
                                  </button>
                                  <label style={labelStyle}>Upload Image</label>
                                  <input type="file" accept="image/*" className="w-full text-sm mb-3 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" onChange={e => updateGallery(index, imgIndex, 'image', e.target.files[0])} />
                                  <input type="text" placeholder="Alt Text" style={inputStyle} className="mb-3" value={img.altText} onChange={e => updateGallery(index, imgIndex, 'altText', e.target.value)} />
                                  <input type="text" placeholder="Caption" style={inputStyle} value={img.caption} onChange={e => updateGallery(index, imgIndex, 'caption', e.target.value)} />
                               </div>
                            ))}
                         </div>
                         <button type="button" onClick={() => addGalleryImage(index)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-semibold transition-colors text-sm">
                          <FiPlus size={18} /> Add Gallery Image
                        </button>
                      </section>

                      <hr className="border-slate-200" />

                      {/* Tags & Keywords */}
                      <section>
                        <h3 style={sectionTitleStyle}><FiSettings className="text-amber-500" /> Taxonomy</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label style={labelStyle}>Tags (Comma separated)</label>
                            <input type="text" style={inputStyle} value={blog.tags} onChange={e => updateBlog(index, 'tags', e.target.value)} placeholder="e.g. Next.js, React, Web" />
                          </div>
                          <div>
                            <label style={labelStyle}>Keywords (Comma separated)</label>
                            <input type="text" style={inputStyle} value={blog.keywords} onChange={e => updateBlog(index, 'keywords', e.target.value)} placeholder="e.g. build a blog, nextjs tutorial" />
                          </div>
                        </div>
                      </section>

                      <hr className="border-slate-200" />

                      {/* Comprehensive SEO */}
                      <section>
                        <h3 style={sectionTitleStyle}><FiCheckCircle className="text-rose-500" /> Advanced SEO</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label style={labelStyle}>Meta Title</label>
                              <input type="text" style={inputStyle} value={blog.seo.meta_title} onChange={e => updateBlogSEO(index, 'meta_title', e.target.value)} placeholder="SEO Title" />
                           </div>
                           <div>
                              <label style={labelStyle}>Canonical URL</label>
                              <input type="text" style={inputStyle} value={blog.seo.canonical_url} onChange={e => updateBlogSEO(index, 'canonical_url', e.target.value)} placeholder="https://..." />
                           </div>
                           <div className="md:col-span-2">
                              <label style={labelStyle}>Meta Description</label>
                              <textarea rows="2" style={inputStyle} value={blog.seo.meta_description} onChange={e => updateBlogSEO(index, 'meta_description', e.target.value)} placeholder="SEO Description..."></textarea>
                           </div>
                           <div>
                              <label style={labelStyle}>Focus Keyword</label>
                              <input type="text" style={inputStyle} value={blog.seo.focus_keyword} onChange={e => updateBlogSEO(index, 'focus_keyword', e.target.value)} />
                           </div>
                           <div>
                              <label style={labelStyle}>Schema JSON-LD</label>
                              <textarea rows="2" style={inputStyle} value={blog.seo.schema_jsonld} onChange={e => updateBlogSEO(index, 'schema_jsonld', e.target.value)} placeholder='{"@context": "https://schema.org"...'></textarea>
                           </div>
                           <div>
                              <label style={labelStyle}>OG Title</label>
                              <input type="text" style={inputStyle} value={blog.seo.og_title} onChange={e => updateBlogSEO(index, 'og_title', e.target.value)} />
                           </div>
                           <div>
                              <label style={labelStyle}>OG Description</label>
                              <input type="text" style={inputStyle} value={blog.seo.og_description} onChange={e => updateBlogSEO(index, 'og_description', e.target.value)} />
                           </div>
                           <div>
                              <label style={labelStyle}>OG Image</label>
                              <input type="file" accept="image/*" style={inputStyle} onChange={e => updateBlogSEO(index, 'og_image', e.target.files[0])} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer" />
                           </div>
                           <div>
                              <label style={labelStyle}>Twitter Card Type</label>
                              <select style={inputStyle} value={blog.seo.twitter_card} onChange={e => updateBlogSEO(index, 'twitter_card', e.target.value)}>
                                 <option value="summary_large_image">Summary Large Image</option>
                                 <option value="summary">Summary</option>
                              </select>
                           </div>
                        </div>
                      </section>

                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            type="button" 
            onClick={addBlog} 
            className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-bold hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <FiPlus size={24} /> Add Another Blog Post
          </button>
        </div>
      </div>
    </div>
  );
}
