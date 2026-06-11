import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './services/firebase';
import { LinkEntry, Priority } from './types';
import { DARK_MODE_KEY } from './constants';
import AddEditModal from './components/AddEditModal';
import CategoryModal from './components/CategoryModal';
import LinkCard from './components/LinkCard';
import { PlusIcon, MoonIcon, SunIcon, SettingsIcon, LogoutIcon, ChevronLeftIcon, ChevronRightIcon } from './components/Icons';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import SectionGate from './components/SectionGate';

const App: React.FC = () => {
  const { isAuthenticated, isAdmin, isGlobalUser, logout, isSectionAuthorized, isSectionVisible, lastUsedSection } = useAuth();
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [categories, setCategories] = useState<string[]>(['العمل', 'شخصي', 'دراسة']);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(DARK_MODE_KEY) === 'true';
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const [activeCategory, setActiveCategory] = useState<string | 'الكل'>('الكل');
  
  // Drag to scroll logic for categories
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!categoryScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - categoryScrollRef.current.offsetLeft);
    setScrollLeft(categoryScrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !categoryScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoryScrollRef.current.offsetLeft;
    // In RTL, scrollLeft is usually negative or behavior varies. 
    // We adjust the walk calculation to feel natural.
    const walk = (x - startX) * 2; 
    categoryScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    const scrollAmount = 300;
    categoryScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // If authenticated but not admin, ensure we are not on 'الكل'
    if (isAuthenticated && !isAdmin && activeCategory === 'الكل') {
      if (lastUsedSection) {
        setActiveCategory(lastUsedSection);
      } else {
        const firstVisible = categories.find(cat => isSectionVisible(cat));
        if (firstVisible) {
          setActiveCategory(firstVisible);
        }
      }
    }
  }, [isAuthenticated, isAdmin, activeCategory, lastUsedSection, categories, isSectionVisible]);

  useEffect(() => {
    if (!db) {
      setFirebaseError("لا يمكن الاتصال بقاعدة البيانات. تأكد من إعدادات Firebase.");
      setIsLoading(false);
      return;
    }

    if (!isAuthenticated) return;

    try {
      const q = query(collection(db, 'links'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const linksData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LinkEntry));
        setLinks(linksData);
        setIsLoading(false);
      }, (error) => {
        console.error("Firestore Snapshot Error:", error);
        setFirebaseError("خطأ في مزامنة البيانات السحابية. يرجى التحقق من الاتصال.");
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      setFirebaseError("حدث خطأ غير متوقع أثناء الاتصال بـ Firestore.");
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!db || !isAuthenticated) return;
    const unsubscribe = onSnapshot(doc(db, 'settings', 'app_data'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().categories) {
        setCategories(docSnap.data().categories);
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
  }, [isDarkMode]);

  const handleSaveLink = async (linkData: Partial<LinkEntry>) => {
    if (!db) return;
    try {
      if (editingLink) {
        await updateDoc(doc(db, 'links', editingLink.id), linkData);
      } else {
        const id = crypto.randomUUID();
        const newLink = {
          ...linkData,
          id,
          createdAt: Date.now(),
          isPinned: false,
        };
        await setDoc(doc(db, 'links', id), newLink);
      }
    } catch (error) {
      console.error("Error saving link:", error);
      alert("فشل في حفظ البيانات سحابياً. تأكد من صلاحيات الوصول.");
    }
    setIsModalOpen(false);
    setEditingLink(null);
  };

  const handleDeleteLink = async (id: string) => {
    if (!db) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الرابط؟')) return;
    try {
      await deleteDoc(doc(db, 'links', id));
    } catch (error) {
      alert("فشل في الحذف من السحابة");
    }
  };

  const handleTogglePin = async (id: string) => {
    if (!db) return;
    const link = links.find(l => l.id === id);
    if (link) {
      await updateDoc(doc(db, 'links', id), { isPinned: !link.isPinned });
    }
  };

  const handleUpdateCategories = async (newCats: string[]) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'settings', 'app_data'), { categories: newCats }, { merge: true });
    } catch (error) {
      alert("فشل في تحديث الأقسام");
    }
  };

  const filteredLinks = useMemo(() => {
    return links
      .filter(link => {
        const search = debouncedSearchQuery.toLowerCase();
        const matchesSearch = (link.title?.toLowerCase() || "").includes(search) || 
                             (link.note?.toLowerCase() || "").includes(search);
        
        // Safety check: only show visible sections
        if (!isSectionVisible(link.category)) return false;

        const matchesCategory = activeCategory === 'الكل' || link.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const priorityScore = { [Priority.URGENT]: 3, [Priority.IMPORTANT]: 2, [Priority.NORMAL]: 1 };
        if (priorityScore[a.priority] !== priorityScore[b.priority]) {
          return priorityScore[b.priority] - priorityScore[a.priority];
        }
        return b.createdAt - a.createdAt;
      });
  }, [links, debouncedSearchQuery, activeCategory]);

  const groupedByCategories = useMemo(() => {
    if (activeCategory !== 'الكل') return null;
    const groups: Record<string, LinkEntry[]> = {};
    filteredLinks.forEach(link => {
      const cat = link.category || "بدون تصنيف";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(link);
    });
    return groups;
  }, [filteredLinks, activeCategory]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen pb-24 bg-white dark:bg-slate-900 transition-colors duration-500">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-blue-50/50 dark:border-slate-800 transition-colors">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-4 md:gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-black text-blue-500 dark:text-blue-400 flex items-center gap-2 md:gap-3 tracking-tight">
              <div className="w-32 md:w-48 h-12 md:h-16 bg-white rounded-xl shadow-lg shadow-blue-200/50 flex items-center justify-center overflow-hidden border border-blue-100 dark:border-slate-700">
                <img 
                  src="https://alandalus.edu.sa/wp-content/uploads/2023/05/logo-1.png" 
                  alt="Alandalus Logo" 
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('span');
                      fallback.innerText = 'A';
                      fallback.className = 'text-2xl font-black text-blue-500';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              مدارس الاندلس - فرع المنار
              {isAdmin && (
                <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-orange-200 dark:border-orange-800">
                  مسؤول
                </span>
              )}
            </h1>
            <div className="flex gap-2 items-center">
              {isAdmin && (
                <button
                  onClick={() => setIsCatModalOpen(true)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-100 dark:border-slate-700"
                  title="إدارة التصنيفات"
                >
                  <SettingsIcon />
                </button>
              )}
              <button
                onClick={logout}
                className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400 transition-all hover:scale-105 active:scale-95 shadow-sm border border-pink-100 dark:border-pink-900/30"
                title="تسجيل الخروج"
              >
                <LogoutIcon />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-100 dark:border-slate-700"
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="ابحث في ذاكرتك..."
              className="w-full px-5 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none focus:ring-[3px] focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-500 text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex items-center justify-between text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold px-2">
              <div className="flex items-center gap-2">
                {searchQuery !== debouncedSearchQuery ? (
                  <span className="flex items-center gap-2 text-blue-500 dark:text-blue-400 animate-pulse">
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    جاري البحث...
                  </span>
                ) : (
                  <span>
                    {searchQuery ? (
                      <>تم العثور على <span className="text-blue-500 dark:text-blue-400 font-extrabold">{filteredLinks.length}</span> {filteredLinks.length === 1 ? "نتيجة مطابقة" : "نتائج مطابقة"}</>
                    ) : (
                      <>الروابط المتاحة حالياً: <span className="text-blue-500 dark:text-blue-400 font-extrabold">{filteredLinks.length}</span></>
                    )}
                  </span>
                )}
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-pink-500 dark:text-pink-400 hover:text-pink-600 transition-colors pointer-events-auto cursor-pointer"
                >
                  إعادة تعيين
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {firebaseError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-3xl mb-8 flex items-center gap-4 text-red-600 dark:text-red-400 font-bold">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {firebaseError}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 animate-pulse font-bold text-center px-6">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            <div className="relative group/nav-scroll mb-6 md:mb-8">
              {/* Left Arrow Button */}
              <button 
                onClick={() => scrollCategories('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:scale-110 transition-all opacity-0 group-hover/nav-scroll:opacity-100 hidden md:block"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>

              {/* Right Arrow Button */}
              <button 
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:scale-110 transition-all opacity-0 group-hover/nav-scroll:opacity-100 hidden md:block"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>

              {/* Gradient Masks */}
              <div className="absolute inset-y-0 left-0 w-8 md:w-24 bg-gradient-to-r from-blue-50 dark:from-slate-900 to-transparent z-10 pointer-events-none opacity-40"></div>
              <div className="absolute inset-y-0 right-0 w-8 md:w-24 bg-gradient-to-l from-blue-50 dark:from-slate-900 to-transparent z-10 pointer-events-none opacity-40"></div>
              
              <div 
                ref={categoryScrollRef}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                className={`flex items-center gap-2 md:gap-3 overflow-x-auto pb-4 md:pb-6 no-scrollbar md:custom-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none px-4 md:px-12`}
              >
              {isAdmin && (
                <button
                  onClick={() => setActiveCategory('الكل')}
                  className={`whitespace-nowrap px-6 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[13px] md:text-sm font-black transition-all shadow-sm ${
                    activeCategory === 'الكل'
                      ? 'bg-blue-500 text-white shadow-blue-200 scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-blue-200'
                  }`}
                >
                  الكل
                </button>
              )}
              {categories.filter(cat => isSectionVisible(cat)).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-6 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[13px] md:text-sm font-black transition-all shadow-sm ${
                    activeCategory === cat
                      ? 'bg-blue-500 text-white shadow-blue-200 scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-blue-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

            {filteredLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                 <div className="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6 animate-pulse">
                   <PlusIcon className="w-12 h-12 text-blue-200 dark:text-slate-700" />
                 </div>
                <p className="text-xl font-bold text-slate-400">لا توجد نتائج في السحابة</p>
              </div>
            ) : (
              <div className="space-y-16">
                {activeCategory !== 'الكل' ? (
                  <SectionGate sectionName={activeCategory}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {filteredLinks.map(link => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          onEdit={(l) => { setEditingLink(l); setIsModalOpen(true); }}
                          onDelete={handleDeleteLink}
                          onPin={handleTogglePin}
                          isAdmin={isAdmin}
                        />
                      ))}
                    </div>
                  </SectionGate>
                ) : (
                  groupedByCategories && [...categories, "بدون تصنيف"].map(cat => {
                    const catLinks = groupedByCategories[cat];
                    if (!catLinks?.length) return null;
                    return (
                      <section key={cat} className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-orange-400 rounded-full"></div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{cat}</h2>
                          </div>
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-xl text-xs font-black">
                            {catLinks.length} عنصر
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                          {catLinks.map(link => (
                            <LinkCard
                              key={link.id}
                              link={link}
                              onEdit={(l) => { setEditingLink(l); setIsModalOpen(true); }}
                              onDelete={handleDeleteLink}
                              onPin={handleTogglePin}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </main>

      {(isAdmin || (activeCategory !== 'الكل' && isSectionAuthorized(activeCategory))) && (
        <button
          onClick={() => { setEditingLink(null); setIsModalOpen(true); }}
          className="fixed bottom-6 right-6 md:bottom-10 md:left-10 w-16 h-16 md:w-20 md:h-20 bg-orange-400 text-white rounded-2xl md:rounded-[2rem] shadow-[0_20px_50px_rgba(251,146,60,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 transform hover:rotate-6"
        >
          <PlusIcon className="w-8 h-8 md:w-10 md:h-10" />
        </button>
      )}

      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLink(null); }}
        onSave={handleSaveLink}
        initialData={editingLink}
        categories={categories}
        fixedCategory={!isAdmin && activeCategory !== 'الكل' ? activeCategory : null}
      />
      
      <CategoryModal 
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
      />
    </div>
  );
};

export default App;
