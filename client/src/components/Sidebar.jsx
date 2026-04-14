import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Folder, FileText, ChevronDown, ChevronRight, HardDrive, FileDigit } from 'lucide-react';
import api from '../api.js';

const SidebarItem = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const isFolder = item.type === 'folder';
  const paddingLeft = `${level * 16 + 16}px`;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      // ПРОВЕРКА ТИПА ДЛЯ ПЕРЕХОДА
      const path = item.type === 'pdf' ? `/pdf/${item.id}` : `/article/${item.id}`;
      navigate(path);
    }
  };

  return (
    <div>
      <div 
        onClick={handleClick}
        className={`flex items-center py-2 px-3 hover:bg-slate-800 transition-all cursor-pointer text-slate-300 text-[14px] ${!isFolder ? 'hover:text-white' : ''}`}
        style={{ paddingLeft }}
      >
        {isFolder ? (
           <>
            {isOpen ? <ChevronDown size={14} className="mr-2 opacity-50" /> : <ChevronRight size={14} className="mr-2 opacity-50" />}
            <Folder size={16} className={`mr-2 ${isOpen ? 'text-blue-400' : 'text-slate-500'}`} />
           </>
        ) : (
          item.type === 'pdf' ? (
            <FileDigit size={16} className="ml-5 mr-2 text-red-500" />
          ) : (
            <FileText size={16} className="ml-5 mr-2 text-blue-400 opacity-80" />
          )
        )}
        <span className={isFolder ? "font-medium" : "font-light"}>{item.name}</span>
      </div>

      {isFolder && isOpen && item.children && (
        <div className="border-l border-slate-800 ml-4">
          {item.children.map(child => (
            <SidebarItem key={`${child.type}-${child.id}`} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/folders/tree')
      .then(res => {
        setTree(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка структуры:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-72 bg-[#0f172a] h-screen text-white flex flex-col overflow-hidden border-r border-slate-800 shadow-2xl shrink-0">
      <Link to="/" className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#1e293b]/50 hover:bg-slate-800 transition-all group">
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform">
          <HardDrive size={18} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-sm uppercase leading-tight text-white">Wiki Сисадмина</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Control Panel</span>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        {loading ? (
          <div className="px-6 py-4 text-xs text-slate-500 uppercase tracking-widest animate-pulse">Синхронизация...</div>
        ) : tree.length > 0 ? (
           tree.map(item => <SidebarItem key={`${item.type}-${item.id}`} item={item} />)
        ) : (
          <div className="px-6 py-4 text-xs text-slate-500 italic font-light text-center mt-10">База пуста.</div>
        )}
      </div>

      <div className="p-4 bg-[#020617] text-[10px] text-slate-600 border-t border-slate-800 flex justify-between uppercase font-black">
         <span>Build: 2026.04.13</span>
         <span className="text-blue-950">READY</span>
      </div>
    </div>
  );
}