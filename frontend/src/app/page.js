import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiBox } from 'react-icons/fi';
import BlogGrid from './BlogGrid';

async function getBlogs() {
  try {
    // Next.js Route Handler mapping to backend/api/blogs.php
    const res = await fetch('http://localhost:3000/api/blogs', { cache: 'no-store' });
    if (!res.ok) return [];
    const blogs = await res.json();
    return blogs.filter(b => b.status === "Published");
  } catch (error) {
    return [];
  }
}

async function getProducts() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/products.php', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const blogs = await getBlogs();
  const products = await getProducts();

  return (
    <div className="bg-[#0f1115] min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 text-slate-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0f1115]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-lg">E</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">TechCMS</span>
          </Link>
          <Link href="/admin" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] text-sm">
            Admin Panel
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-bold tracking-widest uppercase mb-6 border border-indigo-500/20">
              Enterprise Ready
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
              Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Future</span> of Tech
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
              Cars, Mobiles, Laptops, and more. A universal product platform crafted with perfection.
            </p>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>
        </section>

        {/* Dynamic Products Section */}
        {products.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <FiBox className="text-indigo-500" /> Latest Products
              </h2>
              <Link href="/products" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                View All <FiArrowRight />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map(product => (
                <Link href={`/product/${product.slug}`} key={product.id} className="group flex flex-col bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden">
                     {/* Glassmorphism Placeholder for product image */}
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
                     <span className="text-3xl font-black text-white/20 uppercase z-10">{product.brand_name}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">{product.category_name}</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{product.name}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">{product.summary}</p>
                    <div className="text-lg font-bold text-white">
                      ₹{parseFloat(product.base_price).toLocaleString('en-IN')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Blog Grid with Category Filtering */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 border-b border-slate-800 pb-4">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              Tech Insights & News
            </h2>
        </section>
        
        {/* Wrap old component in a dark theme container if needed, though BlogGrid has its own styles which we might need to update later for dark mode */}
        <div className="dark-theme-wrapper">
           <BlogGrid initialBlogs={blogs} />
        </div>
      </main>
    </div>
  );
}
