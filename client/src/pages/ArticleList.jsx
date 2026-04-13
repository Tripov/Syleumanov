import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { useNavigate } from 'react-router-dom';
import { Edit3, Trash2, ExternalLink, Search } from 'lucide-react';

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);
  const load = () => api.get('/articles').then(res => setArticles(res.data));

  const remove = async (id) => {
    if (!window.confirm("Удалить?")) return;
    await api.delete(`/articles/${id}`);
    load();
  };

  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-800">Контент ({articles.length})</h1>
        <div className="relative group">
          <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500" size={18}/>
          <input className="bg-white border rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm" placeholder="Поиск по статьям..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map(art => (
          <div key={art.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center group hover:border-blue-300 transition-all shadow-sm">
            <div>
              <h3 className="font-bold text-slate-700 text-lg">{art.title}</h3>
              <p className="text-xs text-slate-400">Изменено: {new Date(art.updatedAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/article/${art.id}`)} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"><ExternalLink size={20} className="text-slate-400"/></button>
              <button onClick={() => navigate(`/admin/editor/${art.id}`)} className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"><Edit3 size={20} className="text-blue-600"/></button>
              <button onClick={() => remove(art.id)} className="p-2.5 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20} className="text-red-400"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}