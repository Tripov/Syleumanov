import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import { FileText, ChevronRight } from 'lucide-react';

export default function FolderPage({ setBreadcrumbs }) {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/folders/tree`).then(res => {
      // Ищем нужную папку в дереве (упрощенно)
      const findFolder = (nodes) => {
        for (let n of nodes) {
          if (n.type === 'folder' && n.id == id) return n;
          if (n.children) {
            const result = findFolder(n.children);
            if (result) return result;
          }
        }
      };
      const folder = findFolder(res.data);
      setData(folder);
      if (setBreadcrumbs) setBreadcrumbs([{id: folder.id, name: folder.name}]);
    });
  }, [id]);

  if (!data) return <div className="p-10 opacity-30 text-xs uppercase tracking-widest font-black">Загрузка раздела...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tight">{data.name}</h1>
      <p className="text-slate-400 text-xs mb-10 font-bold uppercase tracking-widest">Выберите задание из списка ниже:</p>

      <div className="grid gap-3">
        {data.children.map(item => (
          <Link 
            key={item.id} 
            to={item.type === 'folder' ? `/folder/${item.id}` : `/article/${item.id}`}
            className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
          >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-slate-50 group-hover:bg-blue-50 rounded-lg transition-colors">
                  <FileText size={20} className="text-slate-400 group-hover:text-blue-500" />
               </div>
               <span className="font-bold text-slate-700 group-hover:text-slate-900">{item.name}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 translate-x-0 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}