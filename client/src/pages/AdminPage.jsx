import React, { useState, useEffect, useMemo } from 'react';
import api from '../api.js';
import MarkdownView from '../components/MarkdownView';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { 
  Save, FolderPlus, Image as ImageIcon, 
  Info, CheckCircle, Terminal, 
  Edit3, Trash2, Folder, FileText, Plus, X
} from 'lucide-react';

export default function AdminPage() {
  const [folders, setFolders] = useState([]);
  const [articles, setArticles] = useState([]);
  const [mode, setMode] = useState('create'); 
  const [loading, setLoading] = useState(false);

  const [currentArticle, setCurrentArticle] = useState({ id: null, title: '', content: '', folderId: '' });
  const [newFolder, setNewFolder] = useState({ name: '', parentId: '' });

  useEffect(() => { 
    loadData(); 
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [fRes, aRes] = await Promise.all([
      api.get('/folders/tree'),
      api.get('/articles')
    ]);
    
    const flatten = (items, prefix = '') => {
      return items.reduce((acc, item) => {
        if (item.type === 'folder') {
          acc.push({ id: item.id, name: prefix + item.name });
          if (item.children) acc.push(...flatten(item.children, prefix + '── '));
        }
        return acc;
      }, []);
    };
    
    setFolders(flatten(fRes.data));
    setArticles(aRes.data);
    setLoading(false);
  };

  const handleSaveArticle = async () => {
    if (!currentArticle.title || !currentArticle.folderId) return alert("Заполни всё!");
    
    try {
      if (currentArticle.id) {
        await api.put(`/articles/${currentArticle.id}`, currentArticle);
        alert("✅ Изменения сохранены");
      } else {
        await api.post('/articles', currentArticle);
        alert("✅ Статья создана");
        resetForm();
      }
      loadData();
    } catch (e) { alert("Ошибка при сохранении"); }
  };

  const deleteArticle = async (id) => {
    if (!window.confirm("Удалить статью?")) return;
    await api.delete(`/articles/${id}`);
    loadData();
    if(currentArticle.id === id) resetForm();
  };

  const editArticle = (art) => {
    setCurrentArticle({ id: art.id, title: art.title, content: art.content, folderId: art.folderId });
    setMode('create');
  };

  const resetForm = () => {
    setCurrentArticle({ id: null, title: '', content: '', folderId: '' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData);
      const mdImg = `\n![img](${res.data.url})\n`;
      setCurrentArticle(prev => ({ ...prev, content: prev.content + mdImg }));
    } catch (e) { alert("Ошибка фото"); }
  };

  const createFolder = async () => {
    await api.post('/folders', newFolder);
    setNewFolder({ name: '', parentId: '' });
    loadData();
  };

  const deleteFolder = async (id) => {
    if (!window.confirm("Удалить папку? Это может скрыть статьи внутри.")) return;
    await api.delete(`/folders/${id}`);
    loadData();
  };

  const mdeOptions = useMemo(() => ({ spellChecker: false, status: false }), []);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      
      <div className="w-80 flex flex-col gap-4 shrink-0">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
            <button onClick={() => setMode('create')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'create' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>РЕДАКТОР</button>
            <button onClick={() => setMode('list')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>СПИСОК</button>
        </div>

        {mode === 'list' ? (
          <div className="bg-white rounded-2xl border border-slate-200 flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Все статьи ({articles.length})</h3>
            {articles.map(art => (
              <div key={art.id} className="group flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => editArticle(art)}>
                    <FileText size={16} className="text-blue-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 truncate">{art.title}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => editArticle(art)} className="p-1.5 hover:bg-blue-200 rounded-lg text-blue-600"><Edit3 size={14}/></button>
                  <button onClick={() => deleteArticle(art.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-y-auto flex-1">
             <h3 className="text-xs font-black opacity-40 uppercase tracking-widest mb-6">Структура папок</h3>
             <div className="space-y-4">
               <div>
                  <input className="w-full bg-white/10 p-2 text-xs rounded-lg outline-none border border-white/10 mb-2" placeholder="Имя новой папки..." value={newFolder.name} onChange={e => setNewFolder({...newFolder, name: e.target.value})} />
                  <select className="w-full bg-white/10 p-2 text-[10px] rounded-lg outline-none border border-white/10 mb-2" value={newFolder.parentId} onChange={e => setNewFolder({...newFolder, parentId: e.target.value})}>
                     <option value="">Без родителя</option>
                     {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <button onClick={createFolder} className="w-full bg-blue-500 py-2 rounded-lg text-xs font-bold hover:bg-blue-600">СОЗДАТЬ ПАПКУ</button>
               </div>
               <div className="border-t border-white/10 pt-4 space-y-1">
                  {folders.map(f => (
                    <div key={f.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg group">
                        <span className="text-[11px] text-white/70">{f.name}</span>
                        <button onClick={() => deleteFolder(f.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"><Trash2 size={12}/></button>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
         <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
            <input 
              className="flex-1 text-xl font-black outline-none border-b-2 border-transparent focus:border-blue-500 transition-all placeholder:opacity-20"
              placeholder="Введите заголовок задания..."
              value={currentArticle.title}
              onChange={e => setCurrentArticle({...currentArticle, title: e.target.value})}
            />
            <div className="flex gap-2">
                {currentArticle.id && <button onClick={resetForm} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition-all uppercase tracking-tighter"><Plus size={16}/>Новая</button>}
                <button onClick={handleSaveArticle} className="bg-blue-600 text-white px-8 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all uppercase tracking-wider"><Save size={16}/> {currentArticle.id ? 'Обновить' : 'Сохранить'}</button>
            </div>
         </div>

         <div className="grid grid-cols-2 flex-1 gap-4 overflow-hidden">
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-3 border-b flex justify-between items-center px-4">
                  <select 
                      className="bg-white border rounded-lg px-3 py-1 text-xs outline-none focus:ring-1 ring-blue-500"
                      value={currentArticle.folderId}
                      onChange={e => setCurrentArticle({...currentArticle, folderId: e.target.value})}
                  >
                      <option value="">Выбрать местоположение...</option>
                      {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 cursor-pointer hover:text-blue-500 transition-colors uppercase tracking-widest">
                     <ImageIcon size={14} /> Загрузить скриншот
                     <input type="file" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                
ё                <div className="bg-slate-100 p-2 flex gap-2 overflow-x-auto border-b">
                   <button onClick={() => setCurrentArticle(p => ({...p, content: p.content + "\n<div class='info-block'>\nИнфо текст тут\n</div>\n"}))} className="shrink-0 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"><Info size={12}/> Инфо</button>
                   <button onClick={() => setCurrentArticle(p => ({...p, content: p.content + "\n<div class='success-block'>\nУспех текст тут\n</div>\n"}))} className="shrink-0 bg-green-100 text-green-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle size={12}/> Выполнено</button>
                   <button onClick={() => setCurrentArticle(p => ({...p, content: p.content + "\n```bash\n# Команда\n```\n"}))} className="shrink-0 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"><Terminal size={12}/> Bash</button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <SimpleMDE value={currentArticle.content} onChange={val => setCurrentArticle({...currentArticle, content: val})} options={mdeOptions} />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-y-auto p-10 bg-grid shadow-inner shadow-slate-100">
               <div className="max-w-xl mx-auto">
                  <div className="text-[10px] text-blue-600 font-black mb-4 uppercase tracking-[0.3em] opacity-40">Live Presentation</div>
                  <h1 className="text-4xl font-extrabold text-slate-800 mb-8 leading-tight">{currentArticle.title || 'Безымянный мануал'}</h1>
                  <MarkdownView content={currentArticle.content} />
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}