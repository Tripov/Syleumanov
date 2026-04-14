import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import { FileText, FileDown, ChevronRight, FolderOpen } from 'lucide-react';

export default function FolderPage({ setBreadcrumbs }) {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/folders/tree`).then(res => {
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
      if (setBreadcrumbs && folder) {
        setBreadcrumbs([{id: folder.id, name: folder.name, isFolder: true}]);
      }
    });
  }, [id, setBreadcrumbs]);

  if (!data) return <div className="p-10 opacity-30 text-xs uppercase font-black animate-pulse">Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto px-2 md:px-4 animate-fade-in">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight uppercase leading-tight">{data.name}</h1>
        <p className="text-slate-400 text-[10px] md:text-xs mt-2 font-bold uppercase tracking-widest">Выберите необходимый материал:</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {data.children && data.children.length > 0 ? data.children.map(item => {
          const isPdf = item.type === 'pdf';
          const isFolder = item.type === 'folder';
          const targetUrl = isFolder ? `/folder/${item.id}` : (isPdf ? `/pdf/${item.id}` : `/article/${item.id}`);

          return (
            <Link 
              key={item.id} 
              to={targetUrl}
              className="group flex items-center p-3 md:p-4 bg-white border border-slate-200 rounded-2xl md:rounded-3xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
            >
              <div className={`p-3 rounded-xl md:rounded-2xl shrink-0 transition-colors ${isPdf ? 'bg-red-50 text-red-500' : isFolder ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                 {isPdf ? <FileDown size={20} /> : <FileText size={20} />}
              </div>
              <div className="ml-4 flex-1 min-w-0 pr-2">
                 <h3 className="font-bold text-slate-700 group-hover:text-slate-900 truncate text-sm md:text-base leading-tight">{item.name}</h3>
                 <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-wider">
                   {isFolder ? 'Папка' : isPdf ? 'Документ PDF' : 'Инструкция'}
                 </span>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
            </Link>
          );
        }) : (
          <div className="col-span-full py-20 flex flex-col items-center opacity-20">
             <FolderOpen size={48} />
             <span className="mt-4 font-black uppercase text-xs tracking-widest">Раздел пуст</span>
          </div>
        )}
      </div>
    </div>
  );
}