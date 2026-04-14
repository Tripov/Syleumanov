import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function ManualNavigator({ content }) {
  const lines = content ? content.split('\n') : [];
  const headings = [];

  // 1. Функция полной очистки текста от HTML и спецсимволов Markdown
  const cleanMarkdownAndHtml = (text) => {
    return text
      .replace(/<\/?[^>]+(>|$)/g, "") // Удаляет все HTML теги (типа <span>)
      .replace(/[*_`#]/g, "")          // Удаляет жирность, курсив и т.д.
      .trim();
  };

  // 2. Генерация чистого ID для скролла (должен совпадать с rehype-slug)
  const createId = (text) => {
    const clean = cleanMarkdownAndHtml(text);
    return clean
      .toLowerCase()
      .replace(/[^\w\sа-яё-]/gi, '') // Оставляем только буквы, цифры и тире
      .replace(/\s+/g, '-')           // Пробелы в дефисы
      .replace(/-+/g, '-');           // Двойные дефисы в один
  };

  lines.forEach((line) => {
    const h2Match = line.match(/^##\s+(.*)/);
    const h3Match = line.match(/^###\s+(.*)/);

    if (h2Match) {
      const rawText = h2Match[1];
      headings.push({
        displayText: cleanMarkdownAndHtml(rawText), // Текст без тегов для меню
        level: 2,
        id: createId(rawText)
      });
    } else if (h3Match) {
      const rawText = h3Match[1];
      headings.push({
        displayText: cleanMarkdownAndHtml(rawText),
        level: 3,
        id: createId(rawText)
      });
    }
  });

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="w-full select-none font-sans sticky top-0">
      <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-6 pl-3">
        Содержание
      </h3>
      <div className="flex flex-col gap-1">
        {headings.map((h, i) => (
          <button
            key={i}
            onClick={() => handleScroll(h.id)}
            className={`
              group flex items-start gap-2 py-2 px-3 rounded-xl transition-all text-left w-full
              ${h.level === 3 ? 'ml-4 border-l border-slate-200 pl-4 py-1 text-slate-400' : 'text-slate-600 font-bold'}
              hover:bg-blue-50 hover:text-blue-600 active:scale-95
            `}
          >
            {h.level === 2 && (
              <ChevronRight 
                size={14} 
                className="mt-0.5 shrink-0 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" 
              />
            )}
            <span className="text-[12px] leading-tight">{h.displayText}</span>
          </button>
        ))}
      </div>
    </div>
  );
}