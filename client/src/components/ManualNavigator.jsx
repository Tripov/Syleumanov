import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function ManualNavigator({ content }) {
  const lines = content ? content.split('\n') : [];
  const headings = [];

  // Функция очистки текста (убираем HTML и лишние символы для ID)
  const cleanText = (text) => text.replace(/<\/?[^>]+(>|$)/g, "").trim();

  const createId = (text) => {
    return cleanText(text)
      .toLowerCase()
      .replace(/\s+/g, '-')           // Пробелы в дефисы
      .replace(/[^\wа-яё-]/gi, '')    // Удаляем спецсимволы кроме букв и дефисов
      .replace(/-+/g, '-')            // Двойные дефисы в один
      .replace(/^-+|-+$/g, '');       
  };

  lines.forEach((line) => {
    const h2Match = line.match(/^##\s+(.*)/);
    const h3Match = line.match(/^###\s+(.*)/);

    if (h2Match) {
      headings.push({
        text: cleanText(h2Match[1]),
        level: 2,
        id: createId(h2Match[1])
      });
    } else if (h3Match) {
      headings.push({
        text: cleanText(h3Match[1]),
        level: 3,
        id: createId(h3Match[1])
      });
    }
  });

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // scrollIntoView - самый надежный способ, он найдет скролл внутри любого контейнера
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      console.warn(`Элемент с id "${id}" не найден`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="w-64 sticky top-10 shrink-0 hidden lg:block select-none font-sans z-10">
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
              ${h.level === 3 ? 'ml-6 border-l border-slate-200 pl-4 py-1 text-slate-400' : 'text-slate-600 font-bold'}
              hover:bg-blue-50 hover:text-blue-600 active:scale-95
            `}
          >
            {h.level === 2 && (
              <ChevronRight 
                size={14} 
                className="mt-0.5 shrink-0 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" 
              />
            )}
            <span className="text-[12px] leading-tight">{h.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}