import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import BlogGrid from './BlogGrid';

// Fetch on the server to guarantee perfect LCP
async function getBlogs() {
  try {
    const res = await fetch('http://localhost:3000/api/blogs', {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const blogs = await res.json();
    return blogs.filter(b => b.status === "Published");
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

export default async function Home() {
  const blogs = await getBlogs();

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 hover:text-blue-600 transition-colors">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">B</span>
            BlogCMS
          </Link>
          <Link href="/admin" className="px-5 py-2.5 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-md text-sm">
            Author Login
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold tracking-widest uppercase mb-6 border border-blue-100">
              Welcome
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
              Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Extraordinary</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-light">
              Dive into our latest thoughts, insights, and stories. Expertly curated for your curiosity.
            </p>
          </div>
          
          {/* Decorative background blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 opacity-70"></div>
        </section>

        {/* Blog Grid with Category Filtering */}
        <BlogGrid initialBlogs={blogs} />
      </main>
    </div>
  );
}
