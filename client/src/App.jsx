/* src/App.jsx */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; 
import Sidebar from './components/Sidebar.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SearchHeader from './components/SearchHeader.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx'; 
import FolderPage from './pages/FolderPage.jsx';
import HomePage from './pages/HomePage.jsx';
import AdminLayout from './pages/AdminLayout.jsx';
import ArticleList from './pages/ArticleList.jsx';
import ArticleEditor from './pages/ArticleEditor.jsx';
import FolderManager from './pages/FolderManager.jsx';
import PdfPage from './pages/PdfPage.jsx';
import PdfUpload from './pages/PdfUpload.jsx';

// Вспомогательный компонент для хедера
function MainHeader({ crumbs, onOpenMenu, isPdfPage }) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 z-10 shrink-0 shadow-sm gap-4">
      {/* Кнопка бургера — видна только на мобильных и если это не PDF */}
      {!isPdfPage && (
        <button 
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={onOpenMenu}
        >
          <Menu size={20} />
        </button>
      )}

      <div className="flex items-center justify-between w-full min-w-0">
        <div className="flex-1 min-w-0 overflow-hidden mr-4">
          <Breadcrumbs path={crumbs} />
        </div>
        
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <div className="hidden sm:block">
            <SearchHeader />
          </div>
          {token ? (
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <Link to="/admin" className="hidden md:block text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full hover:bg-blue-100 transition-all border border-blue-100">
                Админ
              </Link>
              <button 
                onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} 
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                Выход
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MainLayout({ setCrumbs, crumbs }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isPdfPage = location.pathname.startsWith('/pdf/');

  // Закрываем меню при смене страницы
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased relative">
      
      {/* 1. БОКОВОЕ МЕНЮ (SIDEBAR) */}
      {!isPdfPage && (
        <>
          {/* Затемнение фона при открытом меню на мобилке */}
          <div 
            className={`fixed inset-0 bg-slate-900/60 z-[100] transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Сам сайдбар */}
          <div className={`fixed inset-y-0 left-0 w-72 z-[101] bg-[#0f172a] transition-transform duration-300 transform lg:relative lg:translate-x-0 lg:z-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <Sidebar />
             {/* Кнопка закрытия внутри сайдбара для мобилок */}
             <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-white/40 lg:hidden">
                <X size={20} />
             </button>
          </div>
        </>
      )}

      {/* 2. ОСНОВНАЯ КОНТЕНТНАЯ ОБЛАСТЬ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <MainHeader 
          crumbs={crumbs} 
          onOpenMenu={() => setIsMobileMenuOpen(true)} 
          isPdfPage={isPdfPage} 
        />

        <main className="flex-1 overflow-hidden relative">
          {/* Доп. поиск сверху только для мобилок */}
          <div className="sm:hidden p-3 bg-white border-b border-slate-100 shrink-0">
             <SearchHeader />
          </div>

          <div className="h-full overflow-y-auto w-full scroll-smooth custom-scrollbar">
            <Routes>
              <Route path="/" element={<div className="p-4 md:p-14 max-w-5xl mx-auto"><HomePage /></div>} />
              <Route path="/article/:id" element={<div className="p-4 md:p-14 max-w-5xl mx-auto"><ArticlePage setBreadcrumbs={setCrumbs} /></div>} />
              <Route path="/folder/:id" element={<div className="p-4 md:p-14 max-w-5xl mx-auto"><FolderPage setBreadcrumbs={setCrumbs} /></div>} />
              <Route path="/pdf/:id" element={<PdfPage setBreadcrumbs={setCrumbs} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [crumbs, setCrumbs] = useState([]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные и защищенные маршруты админки */}
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ArticleList />} />
          <Route path="editor" element={<ArticleEditor />} />
          <Route path="editor/:id" element={<ArticleEditor />} />
          <Route path="folders" element={<FolderManager />} />
          <Route path="upload-pdf" element={<PdfUpload />} />
        </Route>

        {/* Все остальные маршруты идут в пользовательский лейаут */}
        <Route path="/*" element={<MainLayout setCrumbs={setCrumbs} crumbs={crumbs} />} />
      </Routes>
    </BrowserRouter>
  );
}