
import React, { useState, useEffect } from 'react';
import { TrashIcon, PlusIcon, CheckIcon, EditIcon } from './Icons';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
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
  const [isSaving, setIsSaving] = useState(false);
  const [editingPassFor, setEditingPassFor] = useState<string | null>(null);
  const [tempPass, setTempPass] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Global/Admin pass states
  const [globalPass, setGlobalPass] = useState('');
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

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
      setSuccessMsg('تم إضافة القسم بنجاح');
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
        setSuccessMsg('تم حذف القسم');
      } catch (err) {
        console.error("Error deleting section:", err);
        alert('فشل في حذف القسم من السحابة');
      }
    }
  };

  const handleUpdateSectionPass = async (cat: string) => {
    if (!tempPass.trim()) {
      alert('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    
    setIsSaving(true);
    setSuccessMsg(''); // Clear previous message
    
    try {
      const q = query(collection(db, 'sections'), where('name', '==', cat.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing document
        const docId = querySnapshot.docs[0].id;
        await setDoc(doc(db, 'sections', docId), {
          passwordHash: hashPassword(tempPass.trim()),
          updatedAt: Date.now()
        }, { merge: true });
        console.log(`Updated section ${cat} in doc ${docId}`);
      } else {
        // Create new document if it doesn't exist
        const sectionId = crypto.randomUUID();
        await setDoc(doc(db, 'sections', sectionId), {
          id: sectionId,
          name: cat.trim(),
          passwordHash: hashPassword(tempPass.trim()),
          updatedAt: Date.now()
        });
        console.log(`Created new section doc for ${cat}`);
      }
      
      setSuccessMsg(`تم تحديث كلمة مرور قسم "${cat}" بنجاح ✅`);
      setEditingPassFor(null);
      setTempPass('');
      
      // Optional: force a slight delay to ensure UI shows the message
    } catch (err) {
      console.error("Error updating section password:", err);
      alert('حدث خطأ أثناء الاتصال بالسحابة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateGlobalPass = async () => {
    if (!globalPass.trim()) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global_config'), {
        globalPasswordHash: hashPassword(globalPass.trim())
      }, { merge: true });
      setSuccessMsg('تم تحديث كلمة المرور العامة');
      setGlobalPass('');
    } catch (err) {
      alert('فشل التحديث');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAdminPass = async () => {
    if (!adminPass.trim()) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'admin_config'), {
        adminPasswordHash: hashPassword(adminPass.trim())
      }, { merge: true });
      setSuccessMsg('تم تحديث كلمة مرور المسؤول');
      setAdminPass('');
    } catch (err) {
      alert('فشل التحديث');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col transition-all transform scale-100 max-h-[90vh]">
        <div className="p-8 border-b border-blue-50 dark:border-slate-700 flex justify-between items-center bg-blue-50/20 dark:bg-blue-900/10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-blue-100">إدارة الأمان والأقسام</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">تحكم في كلمات المرور وصلاحيات الوصول</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl hover:bg-pink-50 dark:hover:bg-pink-900/20 text-slate-300 hover:text-pink-500 transition-all">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-center font-black animate-in slide-in-from-top duration-300 border border-emerald-100 dark:border-emerald-800">
              {successMsg}
            </div>
          )}

          {/* Global Security Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">الأمان العام للمنصة</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">كلمة المرور العامة (للمستخدمين)</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="كلمة مرور جديدة..."
                    className="flex-grow px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    value={globalPass}
                    onChange={(e) => setGlobalPass(e.target.value)}
                  />
                  <button onClick={handleUpdateGlobalPass} className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-all active:scale-90">
                    <CheckIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">كلمة مرور المسؤول (Admin)</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="كلمة مرور جديدة..."
                    className="flex-grow px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                  />
                  <button onClick={handleUpdateAdminPass} className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-all active:scale-90">
                    <CheckIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Add New Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">إضافة قسم جديد</h3>
            </div>
            <form onSubmit={handleAdd} className="bg-blue-50/30 dark:bg-blue-900/10 p-6 rounded-[2.5rem] border border-blue-100/50 dark:border-blue-900/20 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="اسم القسم (مثلاً: المعلمين)"
                  className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="كلمة مرور القسم"
                  className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-6 h-6" />
                <span>إنشاء القسم المحمي</span>
              </button>
            </form>
          </section>

          {/* Existing Sections List */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">الأقسام الحالية</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {categories.map((cat) => (
                <div key={cat} className="flex flex-col p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center font-black text-blue-500">
                        {cat.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 dark:text-slate-200">{cat}</span>
                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">نشط ومحمي</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingPassFor(editingPassFor === cat ? null : cat)}
                        className={`p-3 rounded-xl transition-all ${editingPassFor === cat ? 'bg-blue-500 text-white' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat)}
                        className="p-3 text-slate-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl transition-all"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {editingPassFor === cat && (
                    <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex gap-3">
                        <input 
                          type="password"
                          placeholder={`كلمة مرور جديدة لقسم ${cat}...`}
                          className="flex-grow px-5 py-3 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-400 text-sm font-bold"
                          value={tempPass}
                          onChange={(e) => setTempPass(e.target.value)}
                          autoFocus
                        />
                        <button 
                          onClick={() => handleUpdateSectionPass(cat)}
                          className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-emerald-600 transition-all active:scale-95"
                        >
                          تحديث
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900/30 text-center border-t border-slate-100 dark:border-slate-800">
           <p className="text-[10px] text-slate-400 font-bold">تذكر: تغيير كلمة المرور سيطبق فوراً على جميع المستخدمين الجدد.</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
