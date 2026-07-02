'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/ui/DataTable';
import { FiPlus } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/index.php/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const columns = [
    { header: 'Product Name', accessor: 'name', render: (val, row) => (
      <div>
        <p className="font-bold text-slate-900">{val}</p>
        <p className="text-xs text-slate-500">{row.slug}</p>
      </div>
    )},
    { header: 'Brand', accessor: 'brand_name' },
    { header: 'Category', accessor: 'category_name' },
    { header: 'Base Price', accessor: 'base_price', render: (val) => val ? `$${val}` : 'N/A' },
    { header: 'Status', accessor: 'status', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
        val === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {val}
      </span>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your universal product inventory and variants.</p>
        </div>
        <Link 
          href="/admin/products/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
        >
          <FiPlus className="text-lg" />
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-slate-200 rounded-2xl w-full"></div>
          <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
        </div>
      ) : (
        <DataTable 
          title="All Products" 
          columns={columns} 
          data={products} 
          onSearch={(term) => console.log('Searching:', term)}
        />
      )}
    </div>
  );
}
