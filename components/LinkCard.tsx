import React from 'react';
import { LinkEntry, Priority } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { EditIcon, TrashIcon, ExternalLinkIcon, PinIcon, LockClosedIcon, SendIcon, InboxIcon } from './Icons';

interface LinkCardProps {
  link: LinkEntry;
  onEdit: (link: LinkEntry) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  isAdmin?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  currentSection?: string;
}

const LinkCard: React.FC<LinkCardProps> = ({ 
  link, 
  onEdit, 
  onDelete, 
  onPin, 
  isAdmin = false,
  canEdit = false,
  canDelete = false,
  currentSection
}) => {
  const allowEdit = isAdmin || canEdit;
  const allowDelete = isAdmin || canDelete;

  return (
    <div className={`group bg-white dark:bg-slate-800 rounded-[2.5rem] p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${link.isPrivate ? 'border-indigo-200 dark:border-indigo-900/60 shadow-indigo-100/30 dark:shadow-none' : 'border-blue-50/50 dark:border-slate-700'} hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative overflow-hidden`}>
      
      {/* Thumbnail Header */}
      {link.imageUrl && (
        <div className="w-full h-36 relative overflow-hidden">
          <img src={link.imageUrl} alt={link.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-800 to-transparent opacity-60"></div>
        </div>
      )}

      <div className="p-4 md:p-6 pt-3 md:pt-4 flex flex-col flex-grow">
        {/* Pin Button Top-Right */}
        {isAdmin && (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex gap-2">
             <button 
              onClick={() => onPin(link.id)} 
              className={`p-1.5 md:p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${link.isPinned ? 'bg-blue-500 text-white' : 'bg-white/80 dark:bg-slate-700/80 text-slate-300 hover:text-blue-500'}`}
              title={link.isPinned ? 'إلغاء التثبيت' : 'تثبيت الرابط'}
            >
              <PinIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-bold tracking-wide shadow-sm ${PRIORITY_COLORS[link.priority]}`}>
              {link.priority}
            </span>
            {link.isPrivate && (
              <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] md:text-[11px] font-black flex items-center gap-1">
                <LockClosedIcon className="w-3 h-3" />
                سري
              </span>
            )}
          </div>
          
          {(allowEdit || allowDelete) && (
            <div className="flex gap-1 md:opacity-75 md:group-hover:opacity-100 transition-all duration-300">
              {allowEdit && (
                <button 
                  onClick={() => onEdit(link)} 
                  className="p-1.5 md:p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg md:rounded-xl transition-all"
                  title="تعديل الرابط"
                >
                  <EditIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              )}
              {allowDelete && (
                <button 
                  onClick={() => onDelete(link.id)} 
                  className="p-1.5 md:p-2 text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg md:rounded-xl transition-all"
                  title="حذف هذا الرابط"
                >
                  <TrashIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Private Dispatch Routing Banner */}
        {link.isPrivate && (
          <div className="mb-2.5">
            {currentSection === link.senderCategory ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 text-xs font-black">
                <SendIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="truncate">مُرسل خاص إلى قسم: <strong>{link.targetCategory || link.category}</strong></span>
              </div>
            ) : currentSection === link.targetCategory ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-xs font-black">
                <InboxIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">وارد خاص من قسم: <strong>{link.senderCategory}</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 text-xs font-black">
                <LockClosedIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="truncate">خاص: {link.senderCategory} ➔ {link.targetCategory || link.category}</span>
              </div>
            )}
          </div>
        )}

        <h3 className="text-xl md:text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 md:mb-3 leading-snug flex-grow">
          {link.title}
        </h3>
        
        {link.note && (
          <p className="text-[13px] md:text-[14px] text-slate-400 dark:text-slate-400 mb-4 md:mb-6 line-clamp-2 italic leading-relaxed bg-slate-50/50 dark:bg-slate-700/30 p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
            {link.note}
          </p>
        )}

        <div className="mt-auto pt-4 md:pt-5 border-t border-blue-50/80 dark:border-slate-700 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 dark:text-slate-500 font-bold mb-0.5">
              {link.isPrivate ? 'الجهة المستلمة' : 'القسم'}
            </span>
            <span className="text-xs text-blue-500 dark:text-blue-400 font-black">
              {link.isPrivate ? (link.targetCategory || link.category) : link.category}
            </span>
          </div>
          
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link flex items-center gap-1.5 md:gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl md:rounded-[1.2rem] font-bold text-sm transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
          >
            <span className="hidden xs:inline">فتح</span>
            <ExternalLinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;