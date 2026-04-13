import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ path = [] }) {
  return (
    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 overflow-hidden shrink-0">
      <Link to="/" className="hover:text-blue-500 transition-colors shrink-0 flex items-center pr-1 border-r border-slate-200">
        <Home size={12} className="mb-0.5" />
      </Link>
      
      {path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          {index > 0 && <span className="opacity-20 font-light text-sm">/</span>}
          <Link 
            to={`/folder/${folder.id}`} 
            className={`truncate transition-colors px-1 py-0.5 rounded hover:bg-slate-100 ${index === path.length - 1 ? 'text-blue-500 bg-blue-50/50' : 'hover:text-slate-800'}`}
          >
            {folder.name}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}