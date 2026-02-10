
import React, { useState } from 'react';
import { TrashIcon, PlusIcon } from './Icons';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onUpdateCategories: (newCategories: string[]) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, categories, onUpdateCategories }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert('هذا التصنيف موجود بالفعل');
      return;
    }
    onUpdateCategories([...categories, newCategory.trim()]);
    setNewCategory('');
  };

  const handleDelete = (catToDelete: string) => {
    if (window.confirm(`هل أنت متأكد من حذف تصنيف "${catToDelete}"؟ (لن يتم حذف الروابط التابعة له)`)) {
      onUpdateCategories(categories.filter(c => c !== catToDelete));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all transform scale-100">
        <div className="p-6 border-b border-blue-50 dark:border-slate-700 flex justify-between items-center bg-blue-50/20 dark:bg-blue-900/10">
          <h2 className="text-xl font-bold text-slate-700 dark:text-blue-100 italic">إدارة الأقسام</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-pink-400 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="اسم القسم الجديد..."
              className="flex-grow px-4 py-3 rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-300"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-blue-500 text-white p-3 rounded-2xl hover:bg-blue-600 transition-all shadow-md active:scale-90"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </form>

          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {categories.map((cat) => (
              <div key={cat} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700 group">
                <span className="font-bold text-slate-600 dark:text-slate-200">{cat}</span>
                <button 
                  onClick={() => handleDelete(cat)}
                  className="text-slate-300 hover:text-pink-500 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-900/30 text-center">
           <p className="text-[10px] text-slate-400">حذف القسم لن يحذف الروابط، بل سيجعلها بدون تصنيف محدد.</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
