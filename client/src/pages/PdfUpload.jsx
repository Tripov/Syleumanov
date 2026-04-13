import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { ChevronLeft, UploadCloud, CheckCircle2, FileType } from 'lucide-react';

export default function PdfUpload() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [data, setData] = useState({ title: '', folderId: '', fileUrl: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/folders/tree').then(res => {
      const flatten = (items, prefix = '') => items.reduce((acc, item) => {
        if (item.type === 'folder') {
          acc.push({ id: item.id, name: prefix + item.name });
          if (item.children) acc.push(...flatten(item.children, prefix + '── '));
        } return acc;
      }, []);
      setFolders(flatten(res.data));
    });
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setLoading(true);
    try {
      const res = await api.post('/upload', formData);
      setData({ ...data, fileUrl: res.data.url, title: file.name.replace('.pdf', '') });
    } catch (e) { alert("Ошибка загрузки"); }
    setLoading(false);
  };

  const save = async () => {
    if (!data.title || !data.folderId || !data.fileUrl) return alert("Заполните все поля и загрузите файл!");
    await api.post('/articles', { ...data, type: 'pdf' });
    alert("PDF успешно добавлен!");
    navigate('/admin');
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/admin')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-widest">
        <ChevronLeft size={16} /> Назад к списку
      </button>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-10 lg:p-16 space-y-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Загрузка PDF документа</h1>
            <p className="text-slate-400 mt-2 font-medium">Файл будет доступен для чтения без возможности скачивания</p>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Название документа</label>
               <input 
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  placeholder="Например: Отчет по практике..."
                  value={data.title}
                  onChange={e => setData({...data, title: e.target.value})}
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Местоположение в меню</label>
               <select 
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl outline-none cursor-pointer"
                  value={data.folderId}
                  onChange={e => setData({...data, folderId: e.target.value})}
               >
                 <option value="">Выберите папку...</option>
                 {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
               </select>
            </div>

            <div className="pt-4">
              <label className="group relative flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-slate-100 rounded-[3rem] hover:border-red-400 hover:bg-red-50/30 transition-all cursor-pointer overflow-hidden">
                <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
                {data.fileUrl ? (
                  <div className="text-center animate-in zoom-in-95 duration-500">
                    <div className="bg-green-100 text-green-600 p-6 rounded-full inline-block mb-4 shadow-lg shadow-green-200"><CheckCircle2 size={40}/></div>
                    <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Документ прикреплен</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-mono">{data.fileUrl}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-slate-100 text-slate-400 p-6 rounded-full inline-block mb-4 group-hover:bg-red-100 group-hover:text-red-500 transition-all"><UploadCloud size={40}/></div>
                    <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Нажмите для выбора PDF</p>
                  </div>
                )}
                {loading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>}
              </label>
            </div>
          </div>

          <button 
            onClick={save}
            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all active:scale-[0.98]"
          >
            Опубликовать документ
          </button>
        </div>
      </div>
    </div>
  );
}