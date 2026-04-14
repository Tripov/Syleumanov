import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';

// Ядро и плагины
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Стили
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Иконки
import { ChevronLeft } from 'lucide-react';

import * as pdfjs from 'pdfjs-dist';
const pdfjsVersion = pdfjs.version;

export default function PdfPage({ setBreadcrumbs }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  
  // Состояние для адаптации
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Настройка плагина
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [defaultTabs[0]], // Только миниатюры
  });

  // Авто-открытие миниатюр только для ПК
  const handleDocumentLoad = () => {
    if (!isMobile) {
      defaultLayoutPluginInstance.activateTab(0);
    }
  };

  useEffect(() => {
    setData(null);
    api.get(`/articles/${id}`).then(res => {
      setData(res.data);
      // На ПК показываем хлебные крошки, на мобилке скрываем для места
      if (setBreadcrumbs) setBreadcrumbs(isMobile ? [] : res.data.breadcrumbPath || []);
    });
    return () => { if (setBreadcrumbs) setBreadcrumbs([]); };
  }, [id, isMobile, setBreadcrumbs]);

  if (!data) return (
    <div className="fixed inset-0 top-14 left-0 z-50 bg-[#323639] flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    /* 
       ЛОГИКА КОНТЕЙНЕРА:
       - На мобилке: фиксированный на весь экран (fixed inset-0 z-[100])
       - На ПК: фиксированный под шапкой (fixed top-14 left-0 right-0 bottom-0 z-40)
    */
    <div className={`
      fixed left-0 right-0 bottom-0 flex flex-col bg-[#323639] overflow-hidden animate-fade-in
      ${isMobile ? 'top-0 z-[100]' : 'top-14 z-40'}
    `}>
      
      {/* КНОПКА НАЗАД (Только для мобилок, так как там скрыт хедер сайта) */}
      {isMobile && (
        <button 
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 z-[110] p-3 bg-black/50 backdrop-blur-md text-white rounded-full shadow-2xl active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* ОСНОВНОЙ ВЬЮВЕР */}
      <div className="flex-1 overflow-hidden relative" onContextMenu={e => e.preventDefault()}>
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`}>
          <Viewer 
            fileUrl={data.fileUrl} 
            plugins={[defaultLayoutPluginInstance]} 
            theme="dark"
            defaultScale={isMobile ? SpecialZoomLevel.PageWidth : 1.7}
            onDocumentLoad={handleDocumentLoad}
          />
        </Worker>
      </div>

      {/* НИЖНИЙ БАР (Скрываем на мобилках для экономии места) */}
      {!isMobile && (
        <div className="h-7 bg-[#202124] border-t border-black/40 flex items-center px-6 shrink-0 z-[70]">
           <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] truncate">
              {data.title}
           </span>
           <span className="ml-auto text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Архив v2.2</span>
        </div>
      )}

      <style>{`
        /* Скрываем мусорные кнопки */
        [aria-label="Search"], [aria-label="Download"], [aria-label="Print"],
        [data-testid="toolbar__search-button"], 
        [data-testid="toolbar__download-button"], 
        [data-testid="toolbar__print-button"] {
            display: none !important;
        }

        /* Темы интерфейса */
        .rpv-default-layout__toolbar {
            background-color: #323639 !important;
            border-bottom: 1px solid rgba(0,0,0,0.3) !important;
        }

        .rpv-core__viewer {
            background-color: #525659 !important;
        }

        /* Настройка сайдбара на ПК */
        @media (min-width: 1024px) {
            .rpv-default-layout__sidebar {
                width: 300px !important;
                border-right: 1px solid rgba(0,0,0,0.5) !important;
                background-color: #323639 !important;
            }
        }

        /* На телефоне выключаем сайдбар совсем */
        @media (max-width: 1023px) {
            .rpv-default-layout__sidebar {
                display: none !important;
            }
        }
      `}</style>
    </div>
  );
}