import React, { useState, useEffect } from 'react';
import { Priority, LinkEntry } from '../types';
import { suggestMetaData } from '../services/geminiService';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Partial<LinkEntry>) => void;
  initialData?: LinkEntry | null;
  categories: string[];
  fixedCategory?: string | null;
}

const AddEditModal: React.FC<AddEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  categories,
  fixedCategory
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.NORMAL);
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setUrl(initialData.url);
      setTitle(initialData.title);
      setCategory(initialData.category);
      setPriority(initialData.priority);
      setNote(initialData.note || '');
      setImageUrl(initialData.imageUrl || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen, fixedCategory]);

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setCategory(fixedCategory || (categories.length > 0 ? categories[0] : 'بدون تصنيف'));
    setPriority(Priority.NORMAL);
    setNote('');
    setImageUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;
    const finalCategory = fixedCategory || category || "بدون تصنيف";
    onSave({ url, title, category: finalCategory, priority, note, imageUrl });
    onClose();
  };

  const handleUrlBlur = async () => {
    if (url && !title && !initialData) {
      setIsSuggesting(true);
      const suggestion = await suggestMetaData(url);
      if (suggestion) {
        setTitle(suggestion.title || '');
        if (categories.includes(suggestion.category)) {
          setCategory(suggestion.category);
        }
      }
      setIsSuggesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transition-all transform scale-100 max-h-[95vh] md:max-h-[90vh]">
        <div className="p-6 md:p-8 border-b border-blue-50 dark:border-slate-700 flex justify-between items-center bg-blue-50/20 dark:bg-blue-900/10 text-right">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-blue-100">
            {initialData ? 'تعديل الرابط' : 'إضافة رابط جديد'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-300 hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 md:space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">رابط الملف أو الموقع</label>
            <input
              type="url"
              required
              placeholder="https://example.com"
              className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-slate-300 text-sm md:text-base font-bold"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">العنوان التوضيحي</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="أدخل اسماً سهل التذكر..."
                className={`w-full px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm md:text-base font-bold ${isSuggesting ? 'opacity-50' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {isSuggesting && (
                <div className="absolute left-4 top-3 md:top-4">
                  <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">صورة مصغرة (اختياري)</label>
            <input
              type="url"
              placeholder="رابط الصورة..."
              className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-slate-300 text-sm md:text-base"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">التصنيف</label>
              <select
                className={`w-full px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm font-bold ${fixedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={category}
                onChange={(e) => !fixedCategory && setCategory(e.target.value)}
                disabled={!!fixedCategory}
              >
                {categories.length === 0 && <option value="بدون تصنيف">بدون تصنيف</option>}
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">الأهمية</label>
              <select
                className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm font-bold"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">ملاحظة إضافية</label>
            <textarea
              className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-400 outline-none transition-all h-24 md:h-32 resize-none text-sm font-bold"
              placeholder="اكتب تفاصيل إضافية..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-6 md:pt-8 bg-white dark:bg-slate-800 sticky bottom-0">
            <button
              type="submit"
              className="w-full md:flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl transition-all shadow-lg active:scale-95 text-lg"
            >
              {initialData ? 'تحديث' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full md:flex-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-200 font-bold py-4 md:py-5 rounded-xl md:rounded-2xl transition-all text-lg"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditModal;