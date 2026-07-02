'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiArrowLeft, FiCheck, FiBox } from 'react-icons/fi';

export default function ProductWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [specGroups, setSpecGroups] = useState([]);

  // Product Data State
  const [product, setProduct] = useState({
    name: '', category_id: '', brand_id: '', series_id: '', base_price: '', summary: ''
  });
  
  // Variants State
  const [variants, setVariants] = useState([
    { id: 1, name: 'Default Variant', sku: '', price: '', attributes: {} }
  ]);

  useEffect(() => {
    // Fetch Categories
    fetch('http://127.0.0.1:8000/api/v1/categories.php')
      .then(r => r.json())
      .then(data => {
        const flatten = (nodes, prefix = '') => {
            let res = [];
            nodes.forEach(n => {
                res.push({ id: n.id, name: prefix + n.name });
                if (n.children) res = res.concat(flatten(n.children, prefix + '-- '));
            });
            return res;
        };
        setCategories(flatten(data));
      });
      
    // Fetch Brands
    fetch('http://127.0.0.1:8000/api/v1/brands.php')
      .then(r => r.json())
      .then(data => setBrands(data));
  }, []);

  // Fetch attributes when category changes
  useEffect(() => {
    if (product.category_id) {
      fetch(`http://127.0.0.1:8000/api/v1/attributes.php?category_id=${product.category_id}`)
        .then(r => r.json())
        .then(data => setSpecGroups(data));
    }
  }, [product.category_id]);

  const handleSave = async () => {
    const payload = {
      ...product,
      variants: variants
    };

    const res = await fetch('http://127.0.0.1:8000/api/v1/products.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      router.push('/admin/products');
    } else {
      alert("Error: " + data.error);
    }
  };

  const getSeries = () => {
    if (!product.brand_id) return [];
    const brand = brands.find(b => b.id == product.brand_id);
    return brand ? brand.series : [];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FiBox className="text-indigo-600" /> Universal Product Wizard
        </h1>
        <div className="flex gap-4 mt-6 border-b border-slate-100 pb-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex items-center gap-2 text-sm font-semibold ${step === s ? 'text-indigo-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${step >= s ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                {step > s ? <FiCheck size={12} /> : s}
              </div>
              {s === 1 ? 'Basic Info' : s === 2 ? 'Variants' : 'Dynamic Specs'}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
              <input type="text" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500" placeholder="e.g. iPhone 15 Pro, Mahindra Scorpio N" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Base Price</label>
              <input type="number" value={product.base_price} onChange={e => setProduct({...product, base_price: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category (Architecture)</label>
              <select value={product.category_id} onChange={e => setProduct({...product, category_id: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500">
                <option value="">-- Select --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
              <select value={product.brand_id} onChange={e => setProduct({...product, brand_id: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500">
                <option value="">-- Select --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            {getSeries().length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Series (Optional)</label>
                <select value={product.series_id} onChange={e => setProduct({...product, series_id: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500">
                  <option value="">-- Select --</option>
                  {getSeries().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Summary</label>
            <textarea value={product.summary} onChange={e => setProduct({...product, summary: e.target.value})} rows="3" className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500" placeholder="Short description..."></textarea>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button onClick={() => setStep(2)} disabled={!product.name || !product.category_id || !product.brand_id} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-700 disabled:bg-slate-300">
              Next Step <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Variants */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 animate-fade-in">
          <p className="text-slate-500">Define color/storage/trim variants for this product. (e.g. Z8L Diesel AT, 256GB Black)</p>
          
          {variants.map((v, i) => (
            <div key={v.id} className="grid grid-cols-3 gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50 relative">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Variant Name</label>
                <input type="text" value={v.name} onChange={e => {
                  const newV = [...variants];
                  newV[i].name = e.target.value;
                  setVariants(newV);
                }} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Z4 Diesel MT" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SKU</label>
                <input type="text" value={v.sku} onChange={e => {
                  const newV = [...variants];
                  newV[i].sku = e.target.value;
                  setVariants(newV);
                }} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
                <input type="number" value={v.price} onChange={e => {
                  const newV = [...variants];
                  newV[i].price = e.target.value;
                  setVariants(newV);
                }} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="Variant Price" />
              </div>
            </div>
          ))}

          <button onClick={() => setVariants([...variants, { id: Date.now(), name: '', sku: '', price: '', attributes: {} }])} className="text-indigo-600 font-medium text-sm flex items-center gap-1 hover:underline">
            + Add Another Variant
          </button>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setStep(1)} className="text-slate-600 px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-100 border border-slate-200">
              <FiArrowLeft /> Back
            </button>
            <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-700">
              Next Step <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Dynamic Specs */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 animate-fade-in">
          <p className="text-slate-500">Fill in the dynamically generated attributes based on the <b>{categories.find(c=>c.id==product.category_id)?.name}</b> category.</p>
          
          <div className="space-y-8">
            {variants.map((variant, vIndex) => (
              <div key={variant.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 font-bold text-indigo-900">
                  Variant: {variant.name || 'Unnamed Variant'}
                </div>
                <div className="p-6 space-y-6">
                  {specGroups.map(group => (
                    <div key={group.id}>
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">{group.name}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {group.attributes.map(attr => (
                          <div key={attr.id}>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              {attr.name} {attr.unit ? `(${attr.unit})` : ''}
                            </label>
                            {attr.type === 'boolean' ? (
                              <select 
                                onChange={e => {
                                  const newV = [...variants];
                                  newV[vIndex].attributes[attr.id] = e.target.value === '1';
                                  setVariants(newV);
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                              >
                                <option value="">Select</option>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                              </select>
                            ) : (
                              <input 
                                type={attr.type === 'numeric' ? 'number' : 'text'} 
                                onChange={e => {
                                  const newV = [...variants];
                                  newV[vIndex].attributes[attr.id] = e.target.value;
                                  setVariants(newV);
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {specGroups.length === 0 && <p className="text-slate-400 text-sm italic">No dynamic attributes configured for this category.</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setStep(2)} className="text-slate-600 px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-100 border border-slate-200">
              <FiArrowLeft /> Back
            </button>
            <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-green-700">
              <FiCheck /> Save Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
