import React, { useState } from 'react';
import { Search, FileText, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function SearchHeader() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length > 2) {
      const res = await api.get(`/articles/search/${val}`);
      setResults(res.data);
    } else {
      setResults([]);
    }
  };

  const goToItem = (item) => {
    setResults([]);
    setQuery('');
    navigate(item.type === 'pdf' ? `/pdf/${item.id}` : `/article/${item.id}`);
  };

  return (
    <div className="relative group w-full max-w-[300px]">
      <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
      <input 
        type="text" 
        placeholder="Поиск по базе..." 
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="bg-slate-100 border-none rounded-full pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 w-full transition-all"
      />
      
      {results.length > 0 && (
        /* На мобилках (fixed), на десктопе (absolute) */
        <div className="fixed inset-x-4 top-16 md:absolute md:inset-x-auto md:right-0 md:top-10 md:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden">
          <div className="p-2 bg-slate-50 border-b text-[8px] font-black uppercase text-slate-400 tracking-widest">найдено совпадений: {results.length}</div>
          <div className="max-h-[60vh] overflow-y-auto">
            {results.map(res => (
              <div 
                key={res.id}
                onClick={() => goToItem(res)}
                className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-none transition-colors"
              >
                {res.type === 'pdf' ? <FileDown size={14} className="text-red-500" /> : <FileText size={14} className="text-blue-500" />}
                <span className="text-xs font-bold text-slate-700 truncate">{res.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}