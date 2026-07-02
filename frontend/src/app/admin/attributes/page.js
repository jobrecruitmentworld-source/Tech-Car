'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiSave, FiTrash2, FiLayers } from 'react-icons/fi';

export default function SpecBuilder() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [groups, setGroups] = useState([]);
  
  const [newGroup, setNewGroup] = useState('');
  const [newAttr, setNewAttr] = useState({ groupId: '', name: '', type: 'string', unit: '', is_filterable: false });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/categories.php')
      .then(r => r.json())
      .then(data => {
        // Flatten tree for select dropdown
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
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`http://127.0.0.1:8000/api/v1/attributes.php?category_id=${selectedCategory}`)
        .then(r => r.json())
        .then(data => setGroups(data));
    } else {
      setGroups([]);
    }
  }, [selectedCategory]);

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroup || !selectedCategory) return;
    
    const res = await fetch('http://127.0.0.1:8000/api/v1/attributes.php?action=create_group', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ category_id: selectedCategory, name: newGroup })
    });
    const data = await res.json();
    if (data.success) {
      setGroups([...groups, { id: data.id, name: newGroup, attributes: [] }]);
      setNewGroup('');
    }
  };

  const handleAddAttribute = async (groupId) => {
    if (!newAttr.name) return;
    
    const res = await fetch('http://127.0.0.1:8000/api/v1/attributes.php?action=create_attribute', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ ...newAttr, group_id: groupId })
    });
    const data = await res.json();
    
    if (data.success) {
      setGroups(groups.map(g => {
        if (g.id === groupId) {
          return { ...g, attributes: [...g.attributes, { id: data.id, ...newAttr }] };
        }
        return g;
      }));
      setNewAttr({ groupId: '', name: '', type: 'string', unit: '', is_filterable: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FiLayers className="text-indigo-600" /> Dynamic Specification Builder
          </h1>
          <p className="text-slate-500 mt-1">Design the EAV attribute structure for your categories.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Category to Configure</label>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full max-w-md p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">-- Choose Category --</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="space-y-6">
          <form onSubmit={handleAddGroup} className="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-indigo-100 items-center">
            <input 
              type="text" 
              placeholder="New Group Name (e.g., Engine, Display)" 
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
              required
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700">
              <FiPlus /> Add Group
            </button>
          </form>

          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">{group.name}</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {group.attributes && group.attributes.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-500 text-sm border-b border-slate-100">
                        <th className="pb-2 font-medium">Attribute Name</th>
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 font-medium">Unit</th>
                        <th className="pb-2 font-medium">Filterable</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {group.attributes.map(attr => (
                        <tr key={attr.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-3 font-medium text-slate-700">{attr.name}</td>
                          <td className="py-3 text-slate-500 capitalize">{attr.type}</td>
                          <td className="py-3 text-slate-500">{attr.unit || '-'}</td>
                          <td className="py-3 text-slate-500">{attr.is_filterable ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-400 text-sm">No attributes in this group yet.</p>
                )}

                {/* Add Attribute inline form */}
                <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4">
                  <input 
                    type="text" placeholder="Attr Name (e.g., RAM)" 
                    value={newAttr.groupId === group.id ? newAttr.name : ''}
                    onChange={(e) => setNewAttr({...newAttr, groupId: group.id, name: e.target.value})}
                    className="flex-1 p-2 text-sm border border-slate-300 rounded-md outline-none"
                  />
                  <select 
                    value={newAttr.groupId === group.id ? newAttr.type : 'string'}
                    onChange={(e) => setNewAttr({...newAttr, groupId: group.id, type: e.target.value})}
                    className="p-2 text-sm border border-slate-300 rounded-md outline-none"
                  >
                    <option value="string">Text</option>
                    <option value="numeric">Numeric</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <input 
                    type="text" placeholder="Unit (GB, mAh)" 
                    value={newAttr.groupId === group.id ? newAttr.unit : ''}
                    onChange={(e) => setNewAttr({...newAttr, groupId: group.id, unit: e.target.value})}
                    className="w-24 p-2 text-sm border border-slate-300 rounded-md outline-none"
                  />
                  <button 
                    onClick={() => handleAddAttribute(group.id)}
                    className="bg-slate-800 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
