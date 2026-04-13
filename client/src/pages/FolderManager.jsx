import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { Trash2, FolderPlus, Folder } from 'lucide-react';

export default function FolderManager() {
  const [folders, setFolders] = useState([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => api.get('/folders/tree').then(res => {
    const flatten = (items, prefix = '') => items.reduce((acc, item) => {
      if (item.type === 'folder') {
        acc.push({ id: item.id, name: prefix + item.name });
        if (item.children) acc.push(...flatten(item.children, prefix + '── '));
      }
      return acc;
    }, []);
    setFolders(flatten(res.data));
  });

  const create = async () => {
    if (!name) return;
    try {
      await api.post('/folders', { name, parentId: parentId || null });
      setName(''); setParentId('');
      load();
    } catch(e) { alert(e.response.data.error); }
  };

  const remove = async (id) => {
    if (!window.confirm("Удалить папку?")) return;
    await api.delete(`/folders/${id}`);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-10 text-slate-800 tracking-tight">Структура разделов</h1>
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-5 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl h-fit">
          <h2 className="font-bold flex items-center gap-2 mb-6 text-slate-600 uppercase text-xs tracking-widest"><FolderPlus size={18}/> Добавить уровень</h2>
          <div className="space-y-4">
            <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" placeholder="Название папки" value={name} onChange={e => setName(e.target.value)} />
            <select className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none" value={parentId} onChange={e => setParentId(e.target.value)}>
              <option value="">📍 Корень (Первый уровень)</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <button onClick={create} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-transform active:scale-95">Создать папку</button>
          </div>
        </div>
        <div className="col-span-7 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b text-[10px] uppercase font-black tracking-widest text-slate-400">Список всех разделов</div>
          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {folders.map(f => (
              <div key={f.id} className="p-4 flex justify-between items-center group hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3"><Folder className="text-blue-300" size={20}/><span className="font-bold text-slate-700 text-sm">{f.name}</span></div>
                <button onClick={() => remove(f.id)} className="p-2 text-red-300 hover:text-red-500 bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}