import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { Link } from 'react-router-dom';
import { Terminal, Clock, ChevronRight, ShieldCheck, Cpu, Layout } from 'lucide-react';

export default function HomePage() {
  const [modules, setModules] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    // Получаем папки (модули) и последние статьи
    api.get('/folders/tree').then(res => setModules(res.data));
    api.get('/articles').then(res => setRecent(res.data.slice(0, 5)));
  }, []);

  // ФУНКЦИЯ ДЛЯ РЕКУРСИВНОГО ПОДСЧЕТА ВСЕХ СТАТЕЙ ВНУТРИ ПАПКИ И ЕЁ ПОДПАПОК
  const countArticlesRecursive = (node) => {
    let count = 0;
    if (!node.children) return 0;

    node.children.forEach(child => {
      if (child.type === 'article') {
        count += 1;
      } else if (child.type === 'folder') {
        // Если это папка (модуль), заходим внутрь неё и прибавляем её статьи
        count += countArticlesRecursive(child);
      }
    });
    return count;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20 animate-in fade-in duration-1000">
      
      {/* HERO SECTION */}
      <div className="text-center space-y-6 pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100 shadow-sm">
          <ShieldCheck size={14} /> System Administrator Knowledge Base
        </div>
        <h1 className="text-7xl font-black text-slate-800 tracking-tighter leading-none text-balance">
          WIKI <span className="text-blue-600 underline decoration-blue-500/20">СИСАДМИНА</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Профессиональная база знаний по настройке серверных систем, автоматизации и решению инцидентов.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* КАРТОЧКИ МОДУЛЕЙ (ОС) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
            <Cpu size={18} className="text-blue-500" /> Основные разделы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((m) => {
              // ВЫЗЫВАЕМ НАШУ НОВУЮ ФУНКЦИЮ ПОДСЧЕТА
              const totalArticles = countArticlesRecursive(m);

              return (
                <Link 
                  key={m.id} 
                  to={`/folder/${m.id}`}
                  className="group p-8 bg-white border border-slate-200 rounded-[2.5rem] hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between min-h-[220px] relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-110">
                     <Terminal size={160} />
                  </div>
                  <div className="p-4 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-2xl w-fit transition-all shadow-sm">
                     <Layout size={24} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase leading-none mb-3">{m.name}</h3>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                       Доступно {totalArticles} заданий
                     </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ПАНЕЛЬ ПОСЛЕДНИХ ОБНОВЛЕНИЙ */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
            <Clock size={18} className="text-orange-400" /> История изменений
          </h2>
          <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-slate-800 space-y-6">
            {recent.map(art => (
              <Link 
                key={art.id} 
                to={`/article/${art.id}`}
                className="flex items-center justify-between group py-1"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[13px] font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">{art.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase mt-1 tracking-tighter">Updated: {new Date(art.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="p-2 bg-white/5 rounded-xl text-slate-600 group-hover:text-white group-hover:bg-blue-600 transition-all ml-2">
                  <ChevronRight size={14} />
                </div>
              </Link>
            ))}
            <div className="pt-6 mt-6 border-t border-white/5 text-center">
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Status: Ready for work</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}