import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import MarkdownView from '../components/MarkdownView';
import { Save, ChevronLeft, Info, CheckCircle, Terminal, Image, HelpCircle, X, Quote, Table, AlertOctagon } from 'lucide-react';

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mdeRef = useRef(null);
  
  const [folders, setFolders] = useState([]);
  const [article, setArticle] = useState({ title: '', content: '', folderId: '' });
  const [loading, setLoading] = useState(true); 
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const fRes = await api.get('/folders/tree');
        const flatten = (items, prefix = '') => items.reduce((acc, item) => {
          if (item.type === 'folder') {
            acc.push({ id: item.id, name: prefix + item.name });
            if (item.children) acc.push(...flatten(item.children, prefix + '── '));
          } return acc;
        }, []);
        setFolders(flatten(fRes.data));

        // 2. Если есть ID, грузим статью
        if (id) {
          const artRes = await api.get(`/articles/${id}`);
          // Гарантируем, что content не будет null, иначе редактор упадет
          setArticle({
            ...artRes.data,
            content: artRes.data.content || ''
          });
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const save = async () => {
    if (!article.title || !article.folderId) return alert("Заполни и название, и папку!");
    try {
      if (id) await api.put(`/articles/${id}`, article);
      else await api.post('/articles', article);
      navigate('/admin');
    } catch (e) {
      alert("Ошибка при сохранении. Проверьте консоль.");
    }
  };

  const insert = (before, after = "") => {
    if (mdeRef.current) {
      const cm = mdeRef.current.codemirror;
      const selection = cm.getSelection();
      cm.replaceSelection(`${before}\n\n${selection || 'Текст'}\n\n${after}`);
      cm.focus();
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData);
      insert(`![img](${res.data.url})`);
    } catch (e) { alert("Ошибка загрузки фото");}
  };

  const mdeOptions = useMemo(() => ({
    spellChecker: false,
    status: false,
    minHeight: "calc(100vh - 350px)",
    autofocus: true,
    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "table", "preview"]
  }), []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen -m-10 bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Синхронизация...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen -m-10 overflow-hidden bg-white relative">
      {showHelp && (
        <div className="absolute right-0 top-0 w-96 h-full bg-[#0f172a] text-white z-50 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
            <h3 className="font-black uppercase tracking-widest text-blue-400 text-xs">Cheat Sheet</h3>
            <button onClick={() => setShowHelp(false)} className="text-white/20 hover:text-white transition-colors"><X size={20}/></button>
          </div>
          <div className="space-y-8 text-[11px] font-mono opacity-80 pb-20">
            <section className="bg-white/5 p-4 rounded-xl">
                <p className="text-blue-400 mb-2 uppercase font-black">Линии</p>
                <p>## Заголовок H2 (синяя)</p>
                <p>### Заголовок H3 (серая)</p>
            </section>
            <section className="bg-white/5 p-4 rounded-xl">
                <p className="text-blue-400 mb-2 uppercase font-black">Стили</p>
                <p>**Жирный**, *Курсив*, `Код`</p>
            </section>
            <section className="bg-white/5 p-4 rounded-xl">
                <p className="text-blue-400 mb-2 uppercase font-black">Блоки</p>
                <p className="mb-2 italic opacity-50">// Используй кнопки панели для вставки:</p>
                <p>{"<div class='info-block'>...</div>"}</p>
                <p>{"<div class='error-block'>...</div>"}</p>
            </section>
          </div>
        </div>
      )}
      <div className="h-16 px-6 border-b flex items-center justify-between shrink-0 bg-white z-20 shadow-sm font-sans">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft size={20}/></button>
          <input 
            className="text-xl font-bold outline-none flex-1 placeholder:opacity-20" 
            value={article.title} 
            onChange={e => setArticle({...article, title: e.target.value})} 
            placeholder="ЗАГОЛОВОК ЗАДАНИЯ..." 
          />
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setShowHelp(true)} className={`p-2.5 rounded-xl border border-slate-200 transition-all ${showHelp ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'}`}>
            <HelpCircle size={22}/>
          </button>
          <select 
            className="bg-slate-50 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest outline-none border border-slate-100" 
            value={article.folderId || ''} 
            onChange={e => setArticle({...article, folderId: e.target.value})}
          >
            <option value="">Folder (Not set)</option>
            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button onClick={save} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
            {id ? 'ОБНОВИТЬ' : 'СОХРАНИТЬ'}
          </button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-12 overflow-hidden bg-slate-50">
        <div className="col-span-6 flex flex-col border-r border-slate-200 bg-white overflow-hidden ">
           <div className="p-3 bg-slate-50 border-b flex gap-2 overflow-x-auto no-scrollbar shadow-inner">
              <label className="p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 shadow-sm"><Image size={16}/><input type="file" className="hidden" onChange={handleImage}/></label>
              <button onClick={() => insert("<div class='blue-text>", "</div>")} className="px-3 py-1.5 bg-blue-300 text-blue-700 text-[10px] font-black rounded border border-blue-250">BLUE</button>
              <button onClick={() => insert("<div class='info-block'>", "</div>")} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded border border-blue-200">INFO</button>
              <button onClick={() => insert("<div class='success-block'>", "</div>")} className="px-3 py-1.5 bg-green-100 text-green-700 text-[10px] font-black rounded border border-green-200">SUCCESS</button>
              <button onClick={() => insert("<div class='error-block'>", "</div>")} className="px-3 py-1.5 bg-red-100 text-red-700 text-[10px] font-black rounded border border-red-200">DANGER</button>
              <button onClick={() => insert("<div class='quote-block'>", "</div>")} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-[10px] font-black rounded border border-slate-300 transition-all hover:bg-slate-300">QUOTE</button>
              <button onClick={() => insert("```bash\n# Команда\n```")} className="px-3 py-1.5 bg-slate-800 text-white text-[10px] font-black rounded border border-black uppercase tracking-widest">BASH</button>
           </div>
           <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
              <SimpleMDE 
                getMdeInstance={(instance) => { mdeRef.current = instance; }}
                value={article.content} 
                onChange={v => setArticle({...article, content: v})} 
                options={mdeOptions} 
              />
           </div>
        </div>
        <div className="col-span-6 overflow-y-auto bg-fixed-grid p-4 lg:p-10 scrollbar-thin shadow-inner animate-fade-in">
          <div className="max-w-4xl mx-auto bg-white p-12 lg:p-16 rounded-[4rem] shadow-2xl border border-slate-100 min-h-screen">
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 opacity-20 mb-10 border-b border-slate-100 pb-2">Draft Sandbox</div>
             <h1 className="text-5xl font-black text-slate-800 mb-12 leading-tight uppercase border-b-8 border-blue-500 pb-6">
                {article.title || 'Blank title'}
             </h1>
             <MarkdownView content={article.content} />
          </div>
        </div>
      </div>
    </div>
  );
}