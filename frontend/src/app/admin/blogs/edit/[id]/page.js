'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { FiTrash2, FiPlus, FiImage, FiSave, FiSettings, FiCheckCircle } from 'react-icons/fi';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import { use } from 'react';

export default function EditBlog({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const emptyBlog = {
    id: null,
    title: '',
    slug: '',
    category: '',
    status: 'Published',
    shortDesc: '',
    longDesc: '',
    featuredImage: null,
    featuredImageUrl: '',
    sections: [{ heading: '', content: '', image: null, image_url: '' }],
    gallery: [],
    tags: '',
    keywords: '',
    seo: {
      meta_title: '', meta_description: '', canonical_url: '',
      og_title: '', og_description: '', og_image: null, og_image_url: '',
      twitter_card: 'summary_large_image', schema_jsonld: '', focus_keyword: ''
    }
  };

  const [blog, setBlog] = useState({ ...emptyBlog });

  useEffect(() => {
    fetch(`/api/blogs?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Blog not found');
          router.push('/admin/blogs');
          return;
        }

        // Format data to match form state
        setBlog({
          id: data.id,
          title: data.title || '',
          slug: data.slug || '',
          category: data.category_name || data.category || '',
          status: data.status || 'Published',
          shortDesc: data.short_description || '',
          longDesc: (data.sections && data.sections.length > 0 && data.sections[0].sort_order === 0) ? data.sections[0].content : '',
          featuredImageUrl: data.featured_image || '',
          featuredImage: null,
          sections: (data.sections ? (data.sections.length > 0 && data.sections[0].sort_order === 0 ? data.sections.slice(1) : data.sections) : [{ heading: '', content: '', image: null, image_url: '' }]).map(s => ({ ...s, image: null })),
          gallery: (data.gallery || []).map(g => ({ ...g, image: null, altText: g.alt_text || '' })),
          tags: data.tags ? data.tags.map(t => typeof t === 'object' ? t.tag : t).join(', ') : '',
          keywords: data.keywords ? data.keywords.map(k => typeof k === 'object' ? k.keyword : k).join(', ') : '',
          seo: {
            meta_title: data.seo?.meta_title || '',
            meta_description: data.seo?.meta_description || '',
            canonical_url: data.seo?.canonical_url || '',
            og_title: data.seo?.og_title || '',
            og_description: data.seo?.og_description || '',
            og_image_url: data.seo?.og_image || '',
            og_image: null,
            twitter_card: data.seo?.twitter_card || 'summary_large_image',
            schema_jsonld: data.seo?.schema_jsonld || '',
            focus_keyword: data.seo?.focus_keyword || ''
          }
        });
        setFetching(false);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load blog');
        router.push('/admin/blogs');
      });
  }, [id]);

  const updateField = (field, value) => {
    setBlog(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !prev.slugModified) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      if (field === 'slug') updated.slugModified = true;
      return updated;
    });
  };

  const updateSEO = (field, value) => {
    setBlog(prev => ({ ...prev, seo: { ...prev.seo, [field]: value } }));
  };

  const addSection = () => {
    setBlog(prev => ({ ...prev, sections: [...prev.sections, { heading: '', content: '', image: null, image_url: '' }] }));
  };

  const removeSection = (secIndex) => {
    setBlog(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== secIndex) }));
  };

  const updateSection = (secIndex, field, value) => {
    setBlog(prev => {
      const newSections = [...prev.sections];
      newSections[secIndex][field] = value;
      return { ...prev, sections: newSections };
    });
  };

  const addGalleryImage = () => {
    setBlog(prev => ({ ...prev, gallery: [...prev.gallery, { image: null, image_url: '', altText: '', caption: '' }] }));
  };

  const updateGallery = (imgIndex, field, value) => {
    setBlog(prev => {
      const newGallery = [...prev.gallery];
      newGallery[imgIndex][field] = value;
      return { ...prev, gallery: newGallery };
    });
  };

  const removeGalleryImage = (imgIndex) => {
    setBlog(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== imgIndex) }));
  };

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
      let finalFeaturedImage = blog.featuredImageUrl;
      if (blog.featuredImage) {
        finalFeaturedImage = await handleImageUpload(blog.featuredImage, blog.title);
      }

      let finalOgImage = blog.seo.og_image_url;
      if (blog.seo.og_image) {
        finalOgImage = await handleImageUpload(blog.seo.og_image, blog.title + '-og');
      }

      const processedSections = await Promise.all(blog.sections.map(async (sec, index) => {
        let secImgUrl = sec.image_url;
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

      const processedGallery = await Promise.all(blog.gallery.map(async (gal, index) => {
        let galImgUrl = gal.image_url;
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

      const payload = {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        short_description: blog.shortDesc,
        sections: blog.longDesc ? [{ heading: '', content: blog.longDesc, image_url: '', sort_order: 0 }, ...processedSections] : processedSections,
        featured_image: finalFeaturedImage,
        category_name: blog.category || 'General',
        author_id: 1,
        status: blog.status,
        gallery: processedGallery,
        tags: blog.tags.split(',').map(t => t.trim()).filter(t => t).map((t, index) => ({ id: index + 1, tag: t })),
        keywords: blog.keywords.split(',').map(k => k.trim()).filter(k => k).map((k, index) => ({ id: index + 1, keyword: k })),
        seo: {
          ...blog.seo,
          og_image: finalOgImage
        }
      };

      const res = await fetch('/api/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Blog updated successfully!');
        router.push('/admin/blogs');
      } else {
        const errorData = await res.json();
        alert('Failed to update blog: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating the blog.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to completely delete this blog? This action cannot be undone.')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/blogs?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Blog deleted successfully!');
        router.push('/admin/blogs');
      } else {
        const errorData = await res.json();
        alert('Failed to delete blog: ' + (errorData.error || 'Unknown error'));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the blog.');
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
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  if (fetching) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Loading blog data...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Blog</h1>
            <p className="text-slate-500 mt-1 text-sm">Updating: {blog.title}</p>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={handleDelete} disabled={loading} className="px-5 py-2.5 bg-white text-red-600 rounded-xl font-semibold border border-red-200 hover:bg-red-50 transition-all shadow-sm flex items-center gap-2">
              <FiTrash2 size={18} /> Delete
            </button>
            <Link href="/admin/blogs" className="px-5 py-2.5 bg-white text-slate-700 rounded-xl font-semibold border border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
              Cancel
            </Link>
            <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-70">
              {loading ? 'Saving...' : <><FiSave size={18} /> Update Blog</>}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8 space-y-10">

            {/* Basic Info */}
            <section>
              <h3 style={sectionTitleStyle}><FiSettings className="text-blue-500" /> Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Blog Title *</label>
                  <input type="text" required style={inputStyle} value={blog.title} onChange={e => updateField('title', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Blog Slug</label>
                  <input type="text" style={inputStyle} value={blog.slug} onChange={e => updateField('slug', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Category (Type your own)</label>
                  <input type="text" required style={inputStyle} value={blog.category} onChange={e => updateField('category', e.target.value)} placeholder="e.g. Technology, Lifestyle..." />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={blog.status} onChange={e => updateField('status', e.target.value)}>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label style={labelStyle}>Short Description *</label>
                <textarea required rows="3" style={inputStyle} value={blog.shortDesc} onChange={e => updateField('shortDesc', e.target.value)} placeholder="A brief summary for cards and feeds..."></textarea>
              </div>

              <div className="mt-6">
                <label style={labelStyle}>Featured Image</label>
                {blog.featuredImageUrl && <img src={blog.featuredImageUrl} alt="Current" className="w-48 h-32 object-cover rounded-xl mb-4 border border-slate-200 shadow-sm" />}
                <input type="file" accept="image/*" style={inputStyle} onChange={e => updateField('featuredImage', e.target.files[0])} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              </div>

              <div className="mt-8">
                <label style={labelStyle}>Long Description (Rich Text)</label>
                <div className="bg-white overflow-hidden rounded-xl border border-slate-300 text-slate-800">
                  <ReactQuill theme="snow" value={blog.longDesc} onChange={(val) => updateField('longDesc', val)} modules={quillModules} className="h-64 mb-10" />
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Dynamic Sections */}
            <section>
              <h3 style={sectionTitleStyle}><FiCheckCircle className="text-purple-500" /> Dynamic Content Sections</h3>

              {blog.sections.map((sec, secIndex) => (
                <div key={secIndex} className="p-5 bg-slate-50 rounded-xl border border-slate-200 mb-5 relative group">
                  <button type="button" onClick={() => removeSection(secIndex)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 transition-all">
                    <FiTrash2 size={18} />
                  </button>
                  <h4 className="font-bold text-slate-700 mb-4 text-md">Section {secIndex + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    <div>
                      <label style={labelStyle}>Heading</label>
                      <input type="text" style={inputStyle} value={sec.heading} onChange={e => updateSection(secIndex, 'heading', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Section Image</label>
                      {sec.image_url && <img src={sec.image_url} alt="Section" className="h-16 object-cover rounded mb-2 border border-slate-200" />}
                      <input type="file" accept="image/*" style={inputStyle} onChange={e => updateSection(secIndex, 'image', e.target.files[0])} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Content</label>
                    <div className="bg-white overflow-hidden rounded-xl border border-slate-300 text-slate-800">
                      <ReactQuill theme="snow" value={sec.content} onChange={(val) => updateSection(secIndex, 'content', val)} modules={quillModules} className="h-48 mb-10" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSection} className="flex items-center gap-2 px-4 py-2 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 font-semibold transition-colors text-sm">
                <FiPlus size={18} /> Add Content Section
              </button>
            </section>

            <hr className="border-slate-200" />

            {/* Gallery */}
            <section>
              <h3 style={sectionTitleStyle}><FiImage className="text-emerald-500" /> Image Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                {blog.gallery.map((img, imgIndex) => (
                  <div key={imgIndex} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                    <button type="button" onClick={() => removeGalleryImage(imgIndex)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                    {img.image_url && <img src={img.image_url} alt="Gallery" className="h-20 w-full object-cover rounded mb-3 border border-slate-200" />}
                    <label style={labelStyle}>Upload Image</label>
                    <input type="file" accept="image/*" className="w-full text-sm mb-3 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" onChange={e => updateGallery(imgIndex, 'image', e.target.files[0])} />
                    <input type="text" placeholder="Alt Text" style={inputStyle} className="mb-3" value={img.altText} onChange={e => updateGallery(imgIndex, 'altText', e.target.value)} />
                    <input type="text" placeholder="Caption" style={inputStyle} value={img.caption} onChange={e => updateGallery(imgIndex, 'caption', e.target.value)} />
                  </div>
                ))}
              </div>
              <button type="button" onClick={addGalleryImage} className="flex items-center gap-2 px-4 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-semibold transition-colors text-sm">
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
                  <input type="text" style={inputStyle} value={blog.tags} onChange={e => updateField('tags', e.target.value)} placeholder="e.g. Next.js, React, Web" />
                </div>
                <div>
                  <label style={labelStyle}>Keywords (Comma separated)</label>
                  <input type="text" style={inputStyle} value={blog.keywords} onChange={e => updateField('keywords', e.target.value)} placeholder="e.g. build a blog, nextjs tutorial" />
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* SEO */}
            <section>
              <h3 style={sectionTitleStyle}><FiCheckCircle className="text-rose-500" /> Advanced SEO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Meta Title</label>
                  <input type="text" style={inputStyle} value={blog.seo.meta_title} onChange={e => updateSEO('meta_title', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Canonical URL</label>
                  <input type="text" style={inputStyle} value={blog.seo.canonical_url} onChange={e => updateSEO('canonical_url', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label style={labelStyle}>Meta Description</label>
                  <textarea rows="2" style={inputStyle} value={blog.seo.meta_description} onChange={e => updateSEO('meta_description', e.target.value)}></textarea>
                </div>
                <div>
                  <label style={labelStyle}>Focus Keyword</label>
                  <input type="text" style={inputStyle} value={blog.seo.focus_keyword} onChange={e => updateSEO('focus_keyword', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Schema JSON-LD</label>
                  <textarea rows="2" style={inputStyle} value={blog.seo.schema_jsonld} onChange={e => updateSEO('schema_jsonld', e.target.value)}></textarea>
                </div>
                <div>
                  <label style={labelStyle}>OG Title</label>
                  <input type="text" style={inputStyle} value={blog.seo.og_title} onChange={e => updateSEO('og_title', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>OG Description</label>
                  <input type="text" style={inputStyle} value={blog.seo.og_description} onChange={e => updateSEO('og_description', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>OG Image</label>
                  <input type="file" accept="image/*" style={inputStyle} onChange={e => updateSEO('og_image', e.target.files[0])} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer" />
                </div>
                <div>
                  <label style={labelStyle}>Twitter Card Type</label>
                  <select style={inputStyle} value={blog.seo.twitter_card} onChange={e => updateSEO('twitter_card', e.target.value)}>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
