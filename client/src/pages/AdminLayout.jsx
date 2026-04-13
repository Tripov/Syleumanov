import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, FileType, FolderTree, PlusCircle, LogOut, ChevronLeft } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: 'Все статьи', path: '/admin', icon: <FileText size={18}/> },
    { name: 'Написать мануал', path: '/admin/editor', icon: <PlusCircle size={18}/> },
    { name: 'Загрузить PDF', path: '/admin/upload-pdf', icon: <FileType size={18}/> }, 
    { name: 'Папки и модули', path: '/admin/folders', icon: <FolderTree size={18}/> },
  ];
  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <div className="w-64 bg-slate-900 text-white flex flex-col p-4 shadow-xl">
        <Link to="/" className="flex items-center gap-2 mb-10 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={16}/> <span className="text-xs font-bold uppercase tracking-widest">На сайт</span>
        </Link>
        
        <div className="space-y-2 flex-1">
          {menu.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-white/5'}`}
            >
              {item.icon} <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        <button 
          onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={18}/> <span className="text-sm font-medium">Выход</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        <Outlet />
      </div>
    </div>
  );
}