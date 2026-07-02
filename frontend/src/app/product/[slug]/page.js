'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiCheckCircle, FiShield, FiTruck } from 'react-icons/fi';
import Head from 'next/head';

export async function generateMetadata({ params }) {
  const res = await fetch(`http://127.0.0.1:8000/api/v1/products.php?slug=${params.slug}`);
  const product = await res.json();
  
  if (product.error) return { title: 'Not Found' };
  
  return {
    title: `${product.name} - ${product.brand_name} | TechCMS`,
    description: product.summary || `Buy ${product.name} at the best price.`,
    openGraph: {
      title: product.name,
      description: product.summary,
      type: 'website',
    }
  }
}

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/v1/products.php?slug=${params.slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants.find(v => v.is_default) || data.variants[0]);
          }
        }
        setLoading(false);
      });
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800">
      <h1 className="text-4xl font-extrabold mb-4 text-slate-900">Product Not Found</h1>
      <Link href="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">Return Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Schema.org JSON-LD for Enterprise SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=2000&auto=format&fit=crop",
            "description": product.summary,
            "brand": {
              "@type": "Brand",
              "name": product.brand_name
            },
            "offers": {
              "@type": "Offer",
              "url": `http://localhost:3000/product/${product.slug}`,
              "priceCurrency": "INR",
              "price": selectedVariant ? selectedVariant.price : product.base_price,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <FiChevronRight size={14} />
          <span className="hover:text-white cursor-pointer transition">{product.category_name}</span>
          <FiChevronRight size={14} />
          <span className="hover:text-white cursor-pointer transition">{product.brand_name}</span>
          <FiChevronRight size={14} />
          <span className="text-white font-medium">{product.name}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Product Images (Placeholder Glassmorphism) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[4/3] w-full rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center relative overflow-hidden group shadow-2xl">
              {/* Placeholder for real product image */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
              <h2 className="text-5xl font-black text-white/10 z-10 tracking-tighter uppercase">{product.brand_name}</h2>
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-24 h-24 flex-shrink-0 rounded-2xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors"></div>
              ))}
            </div>
          </div>

          {/* Right: Product Details & Specs */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-500/20 mb-4">
                {product.brand_name}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
                {product.name}
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">{product.summary}</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
              <div className="text-4xl font-black text-white flex items-baseline gap-2">
                ₹{selectedVariant ? parseFloat(selectedVariant.price).toLocaleString('en-IN') : parseFloat(product.base_price).toLocaleString('en-IN')}
                <span className="text-sm font-medium text-slate-400">ex-showroom</span>
              </div>
              
              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Select Variant</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants.map(variant => (
                      <button 
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-4 rounded-xl text-left border transition-all duration-300 ${
                          selectedVariant?.id === variant.id 
                            ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className={`font-bold ${selectedVariant?.id === variant.id ? 'text-indigo-300' : 'text-slate-200'}`}>{variant.name}</div>
                        <div className="text-sm text-slate-400 mt-1">₹{parseFloat(variant.price).toLocaleString('en-IN')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 gap-4">
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                 <FiCheckCircle className="text-green-400 text-xl" />
                 <div>
                   <div className="text-sm font-bold text-white">In Stock</div>
                   <div className="text-xs text-slate-400">Ready for delivery</div>
                 </div>
               </div>
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                 <FiShield className="text-blue-400 text-xl" />
                 <div>
                   <div className="text-sm font-bold text-white">Warranty</div>
                   <div className="text-xs text-slate-400">Brand authorized</div>
                 </div>
               </div>
            </div>

          </div>
        </div>

        {/* Dynamic Specifications Engine */}
        {selectedVariant && selectedVariant.attributes && selectedVariant.attributes.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-4">
              Technical Specifications
              <div className="h-px bg-slate-700 flex-1"></div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Group attributes by their logical names if passed, but since they are flat in variant.attributes, we just display them elegantly */}
              {selectedVariant.attributes.map((attr, idx) => (
                <div key={idx} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                  <div className="text-sm font-medium text-slate-400 mb-1">{attr.name}</div>
                  <div className="text-xl font-bold text-white">
                    {attr.type === 'boolean' 
                      ? (attr.value_boolean === 1 ? 'Yes' : 'No') 
                      : (attr.type === 'numeric' ? attr.value_numeric : attr.value_string)}
                    {attr.unit && <span className="text-sm text-slate-500 ml-1">{attr.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
