import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import MarkdownView from '../components/MarkdownView';
import ManualNavigator from '../components/ManualNavigator';
import { 
  ChevronLeft, 
  ChevronRight, 
  PanelLeft, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export default function ArticlePage({ setBreadcrumbs }) {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  
  // 1. Изначально закрыто
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    api.get(`/articles/${id}`).then(res => {
      setArticle(res.data);
      if (setBreadcrumbs) setBreadcrumbs(res.data.breadcrumbPath);
    }).catch(err => console.error("Ошибка загрузки:", err));

    return () => { if (setBreadcrumbs) setBreadcrumbs([]); };
  }, [id, setBreadcrumbs]);

  if (!article) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto relative px-4 lg:px-8">
      
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ ВИДОМ */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setShowNav(!showNav)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all group outline-none"
        >
          <PanelLeft size={18} className={showNav ? 'text-blue-500' : 'text-slate-300'} />
          <span>{showNav ? "Скрыть оглавление" : "Показать оглавление"}</span>
        </button>
      </div>

      {/* Основной контейнер flex-row-reverse, чтобы оглавление не мешало тексту слева на больших экранах */}
      <div className="flex flex-col lg:flex-row gap-12 items-start transition-all duration-500">
        
        {/* 1. СОДЕРЖАНИЕ */}
        <div className={`
          sticky top-10 transition-all duration-500 shrink-0
          ${showNav 
            ? 'w-full lg:w-64 opacity-100 translate-x-0 block' 
            : 'w-0 opacity-0 -translate-x-10 pointer-events-none hidden lg:invisible'
          }
        `}>
          <div className="bg-slate-50 lg:bg-transparent p-6 lg:p-0 rounded-3xl border lg:border-none border-slate-100">
            <ManualNavigator content={article.content} />
          </div>
        </div>

        {/* 2. ОСНОВНОЙ КОНТЕНТ */}
        <div className={`flex-1 min-w-0 w-full transition-all duration-500`}>
          {/* Контейнер статьи с ограничением ширины для удобства чтения */}
          <div className={`mx-auto ${showNav ? 'max-w-4xl' : 'max-w-5xl'}`}>
            <div className="bg-white rounded-[2rem] lg:rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden mb-12">
              
              {/* ШАПКА МАНУАЛА */}
              <div className="px-6 py-12 lg:px-16 lg:py-24 bg-[#0f172a] text-white">
                 <div className="mb-6 inline-flex items-center gap-3">
                    <span className="h-px w-8 bg-blue-500"></span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">System Documentation</span>
                 </div>
                 <h1 className="text-3xl lg:text-7xl font-black tracking-tighter leading-tight break-words">
                    {article.title}
                 </h1>
              </div>

              {/* ТЕКСТ СТАТЬИ */}
              <div className="px-6 py-10 lg:px-16 lg:py-20 overflow-x-hidden">
                 <div className="max-w-4xl mx-auto overflow-hidden">
                    <MarkdownView content={article.content} />
                 </div>
              </div>

              <div className="px-8 lg:px-16 py-8 bg-slate-50/50 border-t border-slate-100 italic text-[10px] text-slate-400 text-right uppercase tracking-widest font-medium">
                 Last Update: {new Date(article.updatedAt).toLocaleDateString()}
              </div>
            </div>

            {/* 3. НАВИГАЦИЯ ВНИЗУ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
              {article.navigation?.prev ? (
                <Link to={`/article/${article.navigation.prev.id}`} className="flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-lg transition-all group overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                     <ArrowLeft size={18} />
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Назад</span>
                     <span className="font-bold text-slate-700 truncate text-sm">{article.navigation.prev.title}</span>
                  </div>
                </Link>
              ) : <div className="hidden md:block" />}

              {article.navigation?.next ? (
                <Link to={`/article/${article.navigation.next.id}`} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-lg transition-all group overflow-hidden">
                  <div className="flex flex-col overflow-hidden text-right">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Далее</span>
                     <span className="font-bold text-slate-700 truncate text-sm">{article.navigation.next.title}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                     <ArrowRight size={18} />
                  </div>
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}