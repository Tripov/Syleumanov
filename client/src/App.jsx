import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
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



function HeaderActions({ crumbs }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <div className="flex items-center justify-between w-full">
      <Breadcrumbs path={crumbs} />
      <div className="flex items-center gap-6">
        <SearchHeader />
        {token ? (
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <Link to="/admin" className="text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full hover:bg-blue-100 transition-all border border-blue-100">Панель управления</Link>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="text-red-400 hover:text-red-600">Выход</button>
          </div>
        ) : (
          <Link to="/login" className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest">Админ</Link>
        )}
      </div>
    </div>
  );
}

function App() {
  const [crumbs, setCrumbs] = useState([]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ArticleList />} />
          <Route path="editor" element={<ArticleEditor />} />
          <Route path="editor/:id" element={<ArticleEditor />} />
          <Route path="folders" element={<FolderManager />} />
        </Route>

        <Route path="/*" element={
          <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="h-14 bg-white border-b border-slate-200 flex items-center px-8 z-10 shrink-0 shadow-sm">
                <HeaderActions crumbs={crumbs} />
              </header>

              <main className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                <div className="p-8 lg:p-14">
                  <div className="max-w-5xl mx-auto h-full">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      
                      <Route path="/article/:id" element={<ArticlePage setBreadcrumbs={setCrumbs} />} />
                      <Route path="/folder/:id" element={<FolderPage setBreadcrumbs={setCrumbs} />} />
                      <Route path="/pdf/:id" element={<PdfPage />} />
                      <Route path="upload-pdf" element={<PdfUpload />} />
                    </Routes>
                  </div>
                </div>
              </main>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;