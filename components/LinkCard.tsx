
import React from 'react';
import { LinkEntry, Priority } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { EditIcon, TrashIcon, ExternalLinkIcon, PinIcon } from './Icons';

interface LinkCardProps {
  link: LinkEntry;
  onEdit: (link: LinkEntry) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onEdit, onDelete, onPin }) => {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50/50 dark:border-slate-700 hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
      {/* Pin Ribbon */}
      {link.isPinned && (
        <div className="absolute top-0 right-0 w-12 h-12 bg-blue-400/10 flex items-center justify-center text-blue-500 rounded-bl-[1.5rem]">
           <PinIcon className="w-5 h-5" />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <span className={`px-4 py-1.5 rounded-2xl text-[12px] font-bold tracking-wide shadow-sm ${PRIORITY_COLORS[link.priority]}`}>
          {link.priority}
        </span>
        
        {/* Actions - visible on hover or always on touch devices */}
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button 
            onClick={() => onPin(link.id)} 
            title={link.isPinned ? "إلغاء التثبيت" : "تثبيت في الأعلى"}
            className={`p-2 rounded-xl transition-all ${link.isPinned ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-300 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
          >
            <PinIcon className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => onEdit(link)} 
            title="تعديل"
            className="p-2 text-slate-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-xl transition-all"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => onDelete(link.id)} 
            title="حذف"
            className="p-2 text-slate-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-xl transition-all"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-3 leading-snug flex-grow">
        {link.title}
      </h3>
      
      {link.note && (
        <p className="text-[14px] text-slate-400 dark:text-slate-400 mb-6 line-clamp-3 italic leading-relaxed bg-slate-50/50 dark:bg-slate-700/30 p-3 rounded-2xl">
          {link.note}
        </p>
      )}

      <div className="mt-auto pt-5 border-t border-blue-50/80 dark:border-slate-700 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-300 dark:text-slate-500 font-bold mb-0.5">
            التصنيف
          </span>
          <span className="text-xs text-blue-400 dark:text-blue-300 font-semibold">
            {link.category}
          </span>
        </div>
        
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-500 text-blue-500 hover:text-white dark:bg-blue-900/20 dark:hover:bg-blue-600 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95"
        >
          <span>زيارة</span>
          <ExternalLinkIcon className="w-4 h-4 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </a>
      </div>
      
      {/* Decorative gradient corner */}
      <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-xl pointer-events-none"></div>
    </div>
  );
};

export default LinkCard;
