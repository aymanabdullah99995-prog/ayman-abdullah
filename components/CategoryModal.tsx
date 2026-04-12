
import React, { useState, useEffect } from 'react';
import { TrashIcon, PlusIcon } from './Icons';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { hashPassword } from '../lib/hash';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onUpdateCategories: (newCategories: string[]) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, categories, onUpdateCategories }) => {
  const [newCategory, setNewCategory] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sectionPasswords, setSectionPasswords] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSectionPasswords();
    }
  }, [isOpen]);

  const fetchSectionPasswords = async () => {
    const querySnapshot = await getDocs(collection(db, 'sections'));
    const passwords: Record<string, string> = {};
    querySnapshot.forEach((doc) => {
      passwords[doc.data().name] = '********'; // Don't show actual hash
    });
    setSectionPasswords(passwords);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || !newPassword.trim()) {
      alert('يرجى إدخال اسم القسم وكلمة المرور');
      return;
    }
    if (categories.includes(newCategory.trim())) {
      alert('هذا التصنيف موجود بالفعل');
      return;
    }

    setIsSaving(true);
    try {
      const sectionId = crypto.randomUUID();
      await setDoc(doc(db, 'sections', sectionId), {
        id: sectionId,
        name: newCategory.trim(),
        passwordHash: hashPassword(newPassword.trim())
      });
      
      onUpdateCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      setNewPassword('');
      fetchSectionPasswords();
    } catch (err) {
      console.error("Error adding section:", err);
      alert('فشل في إضافة القسم');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (catToDelete: string) => {
    if (window.confirm(`هل أنت متأكد من حذف تصنيف "${catToDelete}"؟ (لن يتم حذف الروابط التابعة له)`)) {
      try {
        const q = query(collection(db, 'sections'), where('name', '==', catToDelete));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnap) => {
          await deleteDoc(doc(db, 'sections', docSnap.id));
        });
        
        onUpdateCategories(categories.filter(c => c !== catToDelete));
        fetchSectionPasswords();
      } catch (err) {
        console.error("Error deleting section:", err);
        alert('فشل في حذف القسم من السحابة');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all transform scale-100">
        <div className="p-6 border-b border-blue-50 dark:border-slate-700 flex justify-between items-center bg-blue-50/20 dark:bg-blue-900/10">
          <h2 className="text-xl font-bold text-slate-700 dark:text-blue-100 italic">إدارة الأقسام والصلاحيات</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-pink-400 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleAdd} className="space-y-3 mb-6">
            <input
              type="text"
              placeholder="اسم القسم الجديد..."
              className="w-full px-4 py-3 rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-300"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="كلمة مرور القسم..."
                className="flex-grow px-4 py-3 rounded-2xl border border-blue-50 dark:border-slate-700 bg-blue-50/10 dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-300"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isSaving}
                className="bg-blue-500 text-white p-3 rounded-2xl hover:bg-blue-600 transition-all shadow-md active:scale-90 disabled:opacity-50"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {categories.map((cat) => (
              <div key={cat} className="flex flex-col p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700 group space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-600 dark:text-slate-200">{cat}</span>
                    <span className="text-[10px] text-blue-400 font-bold">محمي بكلمة مرور</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(cat)}
                    className="text-slate-300 hover:text-pink-500 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <input 
                    type="password"
                    placeholder="تغيير كلمة المرور..."
                    className="flex-grow text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-blue-400"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const newPass = (e.target as HTMLInputElement).value;
                        if (!newPass.trim()) return;
                        try {
                          const q = query(collection(db, 'sections'), where('name', '==', cat));
                          const querySnapshot = await getDocs(q);
                          if (!querySnapshot.empty) {
                            await setDoc(doc(db, 'sections', querySnapshot.docs[0].id), {
                              passwordHash: hashPassword(newPass.trim())
                            }, { merge: true });
                            alert(`تم تحديث كلمة مرور قسم ${cat}`);
                            (e.target as HTMLInputElement).value = '';
                          }
                        } catch (err) {
                          alert('فشل في تحديث كلمة المرور');
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-900/30 text-center">
           <p className="text-[10px] text-slate-400">يجب تعيين كلمة مرور لكل قسم جديد لضمان الخصوصية.</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
