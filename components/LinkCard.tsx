import React from 'react';
import { LinkEntry, Priority } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { EditIcon, TrashIcon, ExternalLinkIcon, PinIcon } from './Icons';

interface LinkCardProps {
  link: LinkEntry;
  onEdit: (link: LinkEntry) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  isAdmin?: boolean;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onEdit, onDelete, onPin, isAdmin }) => {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50/50 dark:border-slate-700 hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
      
      {/* Thumbnail Header */}
      {link.imageUrl && (
        <div className="w-full h-36 relative overflow-hidden">
          <img src={link.imageUrl} alt={link.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-800 to-transparent opacity-60"></div>
        </div>
      )}

      <div className="p-6 pt-4 flex flex-col flex-grow">
        {/* Pin Button Top-Right */}
        {isAdmin && (
          <div className="absolute top-4 left-4 z-10 flex gap-2">
             <button 
              onClick={() => onPin(link.id)} 
              className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${link.isPinned ? 'bg-blue-500 text-white' : 'bg-white/80 dark:bg-slate-700/80 text-slate-300 hover:text-blue-500'}`}
            >
              <PinIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-start mb-4">
          <span className={`px-4 py-1.5 rounded-2xl text-[12px] font-bold tracking-wide shadow-sm ${PRIORITY_COLORS[link.priority]}`}>
            {link.priority}
          </span>
          
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button onClick={() => onEdit(link)} className="p-2 text-slate-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-xl transition-all"><EditIcon className="w-4 h-4" /></button>
              <button onClick={() => onDelete(link.id)} className="p-2 text-slate-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-xl transition-all"><TrashIcon className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-3 leading-snug flex-grow">
          {link.title}
        </h3>
        
        {link.note && (
          <p className="text-[14px] text-slate-400 dark:text-slate-400 mb-6 line-clamp-2 italic leading-relaxed bg-slate-50/50 dark:bg-slate-700/30 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
            {link.note}
          </p>
        )}

        <div className="mt-auto pt-5 border-t border-blue-50/80 dark:border-slate-700 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 dark:text-slate-500 font-bold mb-0.5">التصنيف</span>
            <span className="text-xs text-blue-500 dark:text-blue-400 font-black">{link.category}</span>
          </div>
          
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-[1.2rem] font-bold text-sm transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
          >
            <span>فتح</span>
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;