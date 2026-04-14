import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { Link } from 'react-router-dom';
import { Terminal, Clock, ChevronRight, ShieldCheck, Cpu, Layout, Coffee } from 'lucide-react';

export default function HomePage() {
  const [modules, setModules] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/folders/tree').then(res => setModules(res.data));
    api.get('/articles').then(res => {
      const now = new Date();
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(now.getDate() - 5);
      const filtered = res.data.filter(art => new Date(art.updatedAt) >= fiveDaysAgo);
      setRecent(filtered.slice(0, 5));
    });
  }, []);

  const countArticlesRecursive = (node) => {
    let count = 0;
    if (!node.children) return 0;
    node.children.forEach(child => {
      if (child.type === 'markdown' || child.type === 'pdf' || child.type === 'article') {
        count += 1;
      } else if (child.type === 'folder') {
        count += countArticlesRecursive(child);
      }
    });
    return count;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-16 pb-10 md:pb-20 px-4 animate-fade-in">
      
      {/* HERO SECTION - Уменьшены шрифты и отступы */}
      <div className="text-center space-y-4 pt-6 md:pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 mx-auto">
          <ShieldCheck size={12} /> БАЗА ЗНАНИЙ
        </div>
        <h1 className="text-3xl md:text-7xl font-black text-slate-800 tracking-tighter leading-none uppercase">
          WIKI <span className="text-blue-600">СИСАДМИНА</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-lg max-w-2xl mx-auto font-medium leading-relaxed italic px-4">
          Инструкции по настройке серверных систем и автоматизации.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        
        {/* КАРТОЧКИ МОДУЛЕЙ */}
        <div className="col-span-12 lg:col-span-8 space-y-4 md:space-y-8">
          <h2 className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
            <Cpu size={16} className="text-blue-500" /> Основные разделы
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
            {modules.map((m) => {
              const totalArticles = countArticlesRecursive(m);
              return (
                <Link 
                  key={m.id} 
                  to={`/folder/${m.id}`}
                  className="group flex flex-row lg:flex-col items-center lg:items-start p-4 md:p-8 bg-white border border-slate-200 rounded-2xl md:rounded-[2.5rem] hover:border-blue-500 transition-all hover:shadow-lg relative overflow-hidden"
                >
                  {/* Иконка - теперь меньше на мобилках и сбоку */}
                  <div className="p-3 md:p-4 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl md:rounded-2xl transition-all shadow-sm shrink-0">
                     <Layout size={20} className="md:w-6 md:h-6" />
                  </div>
                  
                  <div className="ml-4 lg:ml-0 lg:mt-6 relative z-10 flex-1 min-w-0">
                     <h3 className="text-base md:text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase leading-tight truncate">
                        {m.name}
                     </h3>
                     <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
                       Заданий: {totalArticles}
                     </span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 lg:hidden" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ПАНЕЛЬ ИЗМЕНЕНИЙ - Стала компактнее */}
        <div className="col-span-12 lg:col-span-4 space-y-4 md:space-y-8">
          <h2 className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
            <Clock size={16} className="text-orange-400" /> Изменения
          </h2>
          <div className="bg-[#0f172a] rounded-2xl md:rounded-[3rem] p-5 md:p-8 shadow-2xl border border-slate-800 space-y-4">
            {recent.length > 0 ? (
              recent.map(art => (
                <Link 
                  key={art.id} 
                  to={art.type === 'pdf' ? `/pdf/${art.id}` : `/article/${art.id}`}
                  className="flex items-center justify-between group py-0.5"
                >
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="text-xs md:text-[13px] font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">{art.title}</span>
                    <span className="text-[7px] md:text-[9px] text-slate-500 font-mono uppercase mt-0.5 tracking-tighter">
                      Update: {new Date(art.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-1.5 bg-white/5 rounded-lg text-slate-600 group-hover:text-white group-hover:bg-blue-600 transition-all ml-2">
                    <ChevronRight size={12} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center opacity-30">
                 <Coffee size={24} className="text-slate-500 mb-2" />
                 <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-tight">За последние 5 дней<br/>обновлений нет</p>
              </div>
            )}
            
            <div className="pt-4 border-t border-white/5 text-center hidden md:block">
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">System Ready</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}