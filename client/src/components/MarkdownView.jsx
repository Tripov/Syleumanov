import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Info, CheckCircle, Quote, AlertOctagon, Copy, Check } from 'lucide-react';

const CodeBlock = ({ language, value, ...props }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden my-8 border border-slate-800 shadow-2xl group bg-[#0d1117]">
      {/* HEADER TERMINAL */}
      <div className="bg-[#161b22] px-5 py-3 border-b border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
            <span className="text-blue-500">BASH TERMINAL</span>
            <span className="opacity-20 text-slate-400">|</span>
            <span className="text-slate-500">root@system</span>
        </div>
        
        <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-all bg-white/5 px-3 py-1 rounded border border-white/10 active:scale-95"
        >
          {copied ? <><Check size={12} className="text-green-500" /> COPIED</> : <><Copy size={12} /> COPY</>}
        </button>
      </div>

      <SyntaxHighlighter
        style={atomDark}
        language={language || 'bash'}
        PreTag="div"
        showLineNumbers={true}
        customStyle={{ 
            margin: 0, 
            padding: '1.5rem', 
            fontSize: '14px', 
            background: 'transparent', 
            lineHeight: '1.7',
            color: '#e2e8f0' 
        }}
        {...props} // Теперь props определены и ошибки не будет
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default function MarkdownView({ content }) {
  return (
    <div className="prose prose-slate max-w-none 
      prose-h1:text-4xl prose-h1:font-black prose-h1:border-b-8 prose-h1:border-blue-600 prose-h1:pb-4 prose-h1:mb-10 prose-h1:uppercase
      prose-p:text-slate-700 prose-p:leading-relaxed
      prose-pre:p-0 prose-pre:bg-transparent">
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw, rehypeSlug]} 
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeVal = String(children).replace(/\n$/, '');
            
            return !inline && match ? (
              <CodeBlock language={match[1]} value={codeVal} {...props} />
            ) : (
              <code className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black border border-blue-100" {...props}>
                {children}
              </code>
            );
          },

          div: ({ node, className, children, ...props }) => {
            if (className?.includes('quote-block')) {
              return (
                <div className="quote-block animate-fade-in" {...props}>
                   <div className="quote-icon-area"><Quote className="text-white/40" size={24} /></div>
                   <div className="quote-content-area uppercase font-bold text-slate-700"><div>{children}</div></div>
                </div>
              );
            }
            if (className?.includes('info-block')) {
              return (
                <div className="info-block" {...props}>
                  <div className="flex gap-4 items-start">
                    <div className="bg-blue-500 text-white p-1.5 rounded-lg shrink-0 shadow-lg"><Info size={18} /></div>
                    <div className="w-full prose-p:my-0 uppercase text-[10px] font-black tracking-widest leading-none">Информация <div className="normal-case text-[15px] font-medium tracking-normal mt-1 leading-relaxed text-[#1e40af]">{children}</div></div>
                  </div>
                </div>
              );
            }
            if (className?.includes('success-block')) {
              return (
                <div className="success-block" {...props}>
                  <div className="flex gap-4 items-start">
                    <div className="bg-green-500 text-white p-1.5 rounded-lg shrink-0 shadow-lg"><CheckCircle size={18} /></div>
                    <div className="w-full prose-p:my-0 uppercase text-[10px] font-black tracking-widest leading-none">Реализация <div className="normal-case text-[15px] font-medium tracking-normal mt-1 leading-relaxed text-[#064e3b]">{children}</div></div>
                  </div>
                </div>
              );
            }
            if (className?.includes('error-block')) {
                return (
                  <div className="error-block animate-fade-in" {...props}>
                    <div className="flex gap-4 items-start">
                      <div className="bg-red-500 text-white p-1.5 rounded-lg shrink-0 shadow-lg shadow-red-500/20"><AlertOctagon size={18} /></div>
                      <div className="w-full prose-p:my-0 uppercase text-[10px] font-black tracking-widest opacity-60">Важное примечание <div className="normal-case text-[15px] font-medium tracking-normal mt-1 leading-relaxed text-[#991b1b]">{children}</div></div>
                    </div>
                  </div>
                );
            }
            return <div className={className} {...props}>{children}</div>;
          },
          
          span: ({ node, className, children, ...props }) => {
            return <span className={className} {...props}>{children}</span>
          }
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}