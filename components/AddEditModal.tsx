import React, { useState, useEffect } from 'react';
import { Priority, LinkEntry } from '../types';
import { suggestMetaData } from '../services/geminiService';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Partial<LinkEntry>) => void;
  initialData?: LinkEntry | null;
  categories: string[];
}

const AddEditModal: React.FC<AddEditModalProps> = ({ isOpen, onClose, onSave, initialData, categories }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.NORMAL);
  const [note, setNote] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setUrl(initialData.url);
      setTitle(initialData.title);
      setCategory(initialData.category);
      setPriority(initialData.priority);
      setNote(initialData.note || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setCategory(categories.length > 0 ? categories[0] : 'بدون تصنيف');
    setPriority(Priority.NORMAL);
    setNote('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;
    onSave({ url, title, category: category || "بدون تصنيف", priority, note });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transition-all transform scale-100">
        <div className="p-6 border-b border-blue-50 dark:border-slate-700 flex justify-between items-center bg-blue-50/20 dark:bg-blue-900/10">
          <h2 className="text-xl font-bold text-slate-700 dark:text-blue-100">
            {initialData ? 'تعديل البيانات' : 'إضافة رابط ذكي'}
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-pink-400 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
          <div>
            <label className="block text-sm font-bold text-slate-500 dark:text-slate-300 mb-2">رابط الملف أو الموقع</label>
            <input
              type="url"
              required
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-300"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 dark:text-slate-300 mb-2">العنوان التوضيحي</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="أدخل اسماً سهل التذكر..."
                className={`w-full px-4 py-3 rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none transition-all ${isSuggesting ? 'opacity-50' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {isSuggesting && (
                <div className="absolute left-4 top-3.5">
                  <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 dark:text-slate-300 mb-2">التصنيف</label>
              <select
                className="w-full px-4 py-3 rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.length === 0 && <option value="بدون تصنيف">بدون تصنيف</option>}
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 dark:text-slate-300 mb-2">الأهمية</label>
              <select
                className="w-full px-4 py-3 rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 dark:text-slate-300 mb-2">ملاحظة إضافية</label>
            <textarea
              className="w-full px-4 py-3 rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-24 resize-none placeholder:text-slate-300"
              placeholder="اكتب تفاصيل إضافية هنا (اختياري)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-100 active:scale-95"
            >
              حفظ الآن
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-200 font-bold py-4 rounded-2xl transition-all"
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