import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Info, CheckCircle, Quote, AlertOctagon, Copy, Check, Terminal } from 'lucide-react';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden my-6 md:my-8 border border-slate-800 shadow-2xl group bg-[#1e1e1e] not-prose">
      {/* HEADER TERMINAL */}
      <div className="bg-[#252526] px-4 md:px-5 py-2.5 border-b border-white/5 flex justify-between items-center select-none">
        <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex gap-1.5 shrink-0 mr-1 md:mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
            </div>
            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate font-mono flex items-center gap-2">
                <Terminal size={12} /> {language || 'bash'}
            </span>
        </div>
        
        <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-all text-[9px] md:text-[10px] font-bold uppercase shrink-0"
        >
          {copied ? <><Check size={12} className="text-green-500" /> ГОТОВО</> : <><Copy size={12} /> КОПИРОВАТЬ</>}
        </button>
      </div>

      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'bash'}
        PreTag="div"
        showLineNumbers={true}
        customStyle={{ 
            margin: 0, 
            padding: '1.25rem', 
            fontSize: '13px', 
            background: 'transparent', 
            lineHeight: '1.6',
            overflowX: 'auto' 
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default function MarkdownView({ content }) {
  return (
    <div className="prose prose-slate max-w-none 
      prose-headings:tracking-tighter prose-headings:font-black
      prose-h1:text-3xl md:prose-h1:text-5xl prose-h1:border-b-4 md:prose-h1:border-b-8 prose-h1:border-blue-600 prose-h1:pb-4 prose-h1:mb-10 prose-h1:uppercase
      prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12
      prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg
      prose-pre:p-0 prose-pre:bg-transparent
      prose-img:rounded-3xl prose-img:shadow-xl
      prose-code:before:content-none prose-code:after:content-none">
      
      {/* Встроенный фикс для кода, чтобы не было "бузырей" в терминале */}
      <style>{`
        .prose pre code {
            background-color: transparent !important;
            padding: 0 !important;
            border: none !important;
            color: inherit !important;
            font-weight: inherit !important;
        }
        .react-syntax-highlighter-line-number {
            opacity: 0.2 !important;
            padding-right: 1.25rem !important;
            text-align: right !important;
            min-width: 3em !important;
        }
      `}</style>
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw, rehypeSlug]} 
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeVal = String(children).replace(/\n$/, '');
            
            return !inline && match ? (
              <CodeBlock language={match[1]} value={codeVal} />
            ) : (
              <code className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black border border-blue-100 text-sm" {...props}>
                {children}
              </code>
            );
          },

          div: ({ node, className, children, ...props }) => {
            if (className?.includes('quote-block')) {
              return (
                <div className="quote-block flex bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden my-8" {...props}>
                   <div className="bg-slate-200 w-12 shrink-0 flex items-center justify-center"><Quote className="text-slate-400" size={20} /></div>
                   <div className="p-6 italic font-medium text-slate-700 leading-relaxed text-sm md:text-base">{children}</div>
                </div>
              );
            }
            if (className?.includes('info-block')) {
              return (
                <div className="my-8 p-5 md:p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl flex gap-4 items-start" {...props}>
                  <div className="bg-blue-500 text-white p-1.5 rounded-lg shrink-0 shadow-lg shadow-blue-500/20"><Info size={18} /></div>
                  <div className="flex-1">
                    <span className="block uppercase text-[10px] font-black tracking-widest text-blue-600 mb-1">Информация</span>
                    <div className="text-blue-900 text-sm md:text-base font-medium leading-relaxed prose-p:m-0">{children}</div>
                  </div>
                </div>
              );
            }
            if (className?.includes('success-block')) {
              return (
                <div className="my-8 p-5 md:p-6 bg-green-50 border-l-4 border-green-500 rounded-r-2xl flex gap-4 items-start" {...props}>
                  <div className="bg-green-500 text-white p-1.5 rounded-lg shrink-0 shadow-lg shadow-green-500/20"><CheckCircle size={18} /></div>
                  <div className="flex-1">
                    <span className="block uppercase text-[10px] font-black tracking-widest text-green-600 mb-1">Реализация</span>
                    <div className="text-green-900 text-sm md:text-base font-medium leading-relaxed prose-p:m-0">{children}</div>
                  </div>
                </div>
              );
            }
            if (className?.includes('error-block')) {
                return (
                  <div className="my-8 p-5 md:p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl flex gap-4 items-start animate-fade-in" {...props}>
                    <div className="bg-red-500 text-white p-1.5 rounded-lg shrink-0 shadow-lg shadow-red-500/20"><AlertOctagon size={18} /></div>
                    <div className="flex-1">
                      <span className="block uppercase text-[10px] font-black tracking-widest text-red-600 mb-1">Важное примечание</span>
                      <div className="text-red-900 text-sm md:text-base font-medium leading-relaxed prose-p:m-0">{children}</div>
                    </div>
                  </div>
                );
            }
            return <div className={className} {...props}>{children}</div>;
          },

          // Дополнительно: Адаптация таблиц
          table: ({ children }) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 m-0">
                    {children}
                </table>
            </div>
          )
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}