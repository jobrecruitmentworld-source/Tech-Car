import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { AnimatedHeader, AnimatedSection } from './AnimatedWrapper';
import { FiArrowLeft, FiClock, FiEye, FiTag } from 'react-icons/fi';

// Fetch blog data
async function getBlog(slug) {
  const res = await fetch(`http://localhost:3000/api/blogs?slug=${slug}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch blog');
  }

  return res.json();
}

// Generate SEO Metadata dynamically
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
    };
  }

  const seo = blog.seo || {};
  return {
    title: seo.meta_title || blog.title,
    description: seo.meta_description || blog.short_description || blog.title,
    keywords: blog.keywords?.map(k => k.keyword).join(', ') || '',
    openGraph: {
      title: seo.og_title || seo.meta_title || blog.title,
      description: seo.og_description || seo.meta_description || blog.short_description || blog.title,
      images: [
        {
          url: blog.seo?.og_image ? getImageUrl(blog.seo.og_image) : getImageUrl(blog.featured_image),
        },
      ],
    },
  };
}

// Helper to safely format image URLs
function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

export default async function BlogPage({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      {blog.seo?.schema_jsonld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: blog.seo.schema_jsonld }}
        />
      )}
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 hover:text-blue-600 transition-colors">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg">B</span>
            BlogCMS
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-100">
            <FiArrowLeft /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-20">
        {/* Header Section */}
        <AnimatedHeader className="mb-12">
          {blog.category && (
            <span className="inline-block text-blue-600 font-bold text-sm tracking-widest uppercase mb-4">
              {blog.category}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium text-sm md:text-base border-y border-slate-100 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                 <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="" className="object-cover w-full h-full" />
              </div>
              <div>
                <p className="text-slate-900 font-bold">Admin</p>
                <p className="text-xs">Author</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><FiClock className="text-slate-400" /> {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-2"><FiEye className="text-slate-400" /> {blog.views} Views</span>
            </div>
          </div>
        </AnimatedHeader>

        {/* Featured Image */}
        {blog.featured_image && (
          <AnimatedSection delay={0.1}>
            <div className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-16">
              <Image 
                src={getImageUrl(blog.featured_image)} 
                alt={blog.title} 
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </AnimatedSection>
        )}

        {/* Article Content Wrapper */}
        <article className="mt-10">
          
          {/* Short Description (Intro) */}
          {blog.short_description && (
            <AnimatedSection delay={0.2}>
              <p className="text-xl md:text-2xl font-light text-slate-600 leading-relaxed mb-10">
                {blog.short_description}
              </p>
            </AnimatedSection>
          )}

          {/* Long Description (Main Body) */}
          {blog.long_description && (
            <AnimatedSection delay={0.3}>
              <div dangerouslySetInnerHTML={{ __html: blog.long_description.replace(/&nbsp;/g, ' ') }} className="rich-text mb-16" />
            </AnimatedSection>
          )}

          {/* Dynamic Sections */}
          {blog.sections && blog.sections.sort((a, b) => a.sort_order - b.sort_order).map((section, index) => (
            <AnimatedSection key={section.id || index} delay={0.1}>
              <div className="mb-16">
                {section.heading && <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6">{section.heading}</h2>}
                {section.image_url && (
                  <div className="relative w-full aspect-[16/9] my-8 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <Image 
                      src={getImageUrl(section.image_url)} 
                      alt={section.heading || 'Section image'} 
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-cover" 
                    />
                  </div>
                )}
                {section.content && <div dangerouslySetInnerHTML={{ __html: section.content.replace(/&nbsp;/g, ' ') }} className="rich-text mt-6" />}
              </div>
            </AnimatedSection>
          ))}
        </article>

        {/* Gallery */}
        {blog.gallery && blog.gallery.length > 0 && (
          <AnimatedSection delay={0.2} className="mt-20 pt-16 border-t border-slate-100">
            <h3 className="text-3xl font-bold text-slate-900 mb-8">Image Gallery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blog.gallery.map((img, index) => (
                <div key={index} className="group flex flex-col">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                    <Image 
                      src={getImageUrl(img.image_url)} 
                      alt={img.alt_text || 'Gallery Image'} 
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {img.caption && (
                     <p className="mt-3 text-sm font-medium text-slate-500">
                       {img.caption}
                     </p>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Tags & Keywords */}
        {(blog.tags?.length > 0 || blog.keywords?.length > 0) && (
          <AnimatedSection delay={0.3} className="mt-16 pt-10 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <FiTag className="text-slate-400 text-xl" />
              <h4 className="text-lg font-bold text-slate-700">Tags & Topics</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {blog.tags?.map((tag, index) => (
                <span key={tag.id || `tag-${index}`} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
                  #{tag.tag}
                </span>
              ))}
              {blog.keywords?.map((kw, index) => (
                <span key={kw.id || `kw-${index}`} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:border-slate-300 transition-colors">
                  {kw.keyword}
                </span>
              ))}
            </div>
          </AnimatedSection>
        )}
      </main>
    </div>
  );
}
