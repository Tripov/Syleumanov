import React, { useState } from 'react';
import { Search } from 'lucide-react';
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

  const goToArticle = (id) => {
    setResults([]);
    setQuery('');
    navigate(`/article/${id}`);
  };

  return (
    <div className="relative group">
      <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
      <input 
        type="text" 
        placeholder="Поиск по документации..." 
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="bg-slate-100 border-none rounded-full pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
      />
      
      {results.length > 0 && (
        <div className="absolute top-10 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.map(res => (
            <div 
              key={res.id}
              onClick={() => goToArticle(res.id)}
              className="p-3 hover:bg-slate-50 cursor-pointer text-sm border-b border-slate-50 last:border-none"
            >
              {res.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}