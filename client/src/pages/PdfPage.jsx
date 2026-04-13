import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api.js';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PdfPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [], // Скрываем навигацию внутри PDF
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const { Zoom, ZoomIn, ZoomOut, EnterFullScreen, NumberOfPages, CurrentPageInput } = slots;
          return (
            <div className="flex items-center w-full justify-between px-6 py-2 bg-[#0f172a] text-white border-b border-white/10 select-none">
              <div className="flex items-center gap-4">
                <ZoomOut /> <Zoom /> <ZoomIn />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                PAGES: <CurrentPageInput /> / <NumberOfPages />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest hidden md:block">SECURE PDF VIEW</span>
                <EnterFullScreen />
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  useEffect(() => {
    api.get(`/articles/${id}`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <div className="p-20 text-center opacity-20 uppercase font-black tracking-widest">LOADING SECURE DOCUMENT...</div>;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in lg:px-4">
      <div className="mb-6 flex justify-between items-end">
         <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter shrink-0">{data.title}</h1>
         <div className="flex gap-2">
            <span className="bg-red-50 text-red-500 text-[10px] font-black px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest">PROTECTED PDF</span>
         </div>
      </div>

      <div 
        className="flex-1 bg-slate-900 rounded-[3rem] overflow-hidden border-8 border-[#0f172a] shadow-2xl relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer fileUrl={data.fileUrl} plugins={[defaultLayoutPluginInstance]} theme="dark" />
        </Worker>
        
        <div className="absolute inset-x-0 bottom-0 h-4 bg-[#0f172a] z-10 pointer-events-none"></div>
      </div>
    </div>
  );
}