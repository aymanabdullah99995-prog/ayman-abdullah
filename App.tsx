
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './services/supabaseClient.ts';
import { LinkEntry, Priority } from './types.ts';
import { DEFAULT_CATEGORIES, DARK_MODE_KEY } from './constants.ts';
import AddEditModal from './components/AddEditModal.tsx';
import CategoryModal from './components/CategoryModal.tsx';
import LinkCard from './components/LinkCard.tsx';
import { PlusIcon, MoonIcon, SunIcon, SettingsIcon } from './components/Icons.tsx';

const App: React.FC = () => {
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(DARK_MODE_KEY) === 'true';
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'الكل'>('الكل');

  // جلب البيانات من Supabase عند التحميل
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .order('created_at', { ascending: false });

        if (linksError) throw linksError;
        
        if (linksData) {
          setLinks(linksData.map(item => ({
            ...item,
            createdAt: Number(item.created_at),
            isPinned: item.is_pinned
          })));
        }

        const { data: catsData, error: catsError } = await supabase
          .from('categories')
          .select('name');

        if (catsError) throw catsError;
        if (catsData && catsData.length > 0) {
          setCategories(catsData.map(c => c.name));
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        // لا تظهر تنبيه هنا لتجنب إزعاج المستخدم عند أول دخول، سنكتفي بالكونسول
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
  }, [isDarkMode]);

  const handleSaveLink = async (linkData: Partial<LinkEntry>) => {
    setIsSyncing(true);
    try {
      if (editingLink) {
        const { error } = await supabase
          .from('links')
          .update({
            url: linkData.url,
            title: linkData.title,
            category: linkData.category,
            priority: linkData.priority,
            note: linkData.note,
          })
          .eq('id', editingLink.id);

        if (error) throw error;
        setLinks(prev => prev.map(l => l.id === editingLink.id ? { ...l, ...linkData } as LinkEntry : l));
      } else {
        const newLinkObj = {
          url: linkData.url!,
          title: linkData.title!,
          category: linkData.category!,
          priority: linkData.priority || Priority.NORMAL,
          note: linkData.note,
          created_at: Date.now(),
          is_pinned: false,
        };

        const { data, error } = await supabase
          .from('links')
          .insert([newLinkObj])
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          const inserted = data[0];
          setLinks(prev => [{
            ...inserted,
            createdAt: Number(inserted.created_at),
            isPinned: inserted.is_pinned
          }, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (error: any) {
      // إظهار تفاصيل الخطأ بدقة
      alert(`فشل الحفظ: ${error.message || 'خطأ غير معروف'}. تأكد من إنشاء الجداول في Supabase وتعطيل RLS.`);
      console.error('Full Error:', error);
    } finally {
      setIsSyncing(false);
      setEditingLink(null);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الرابط؟')) return;
    
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch (error: any) {
      alert(`خطأ في الحذف: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTogglePin = async (id: string) => {
    const linkToPin = links.find(l => l.id === id);
    if (!linkToPin) return;

    setIsSyncing(true);
    const newState = !linkToPin.isPinned;
    try {
      const { error } = await supabase
        .from('links')
        .update({ is_pinned: newState })
        .eq('id', id);

      if (error) throw error;
      setLinks(prev => prev.map(l => l.id === id ? { ...l, isPinned: newState } : l));
    } catch (error: any) {
      alert(`فشل التثبيت: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateCategories = async (newCats: string[]) => {
    setIsSyncing(true);
    try {
      const added = newCats.filter(x => !categories.includes(x));
      const removed = categories.filter(x => !newCats.includes(x));

      if (added.length > 0) {
        const { error } = await supabase.from('categories').insert(added.map(name => ({ name })));
        if (error) throw error;
      }
      if (removed.length > 0) {
        const { error } = await supabase.from('categories').delete().in('name', removed);
        if (error) throw error;
      }
      
      setCategories(newCats);
    } catch (error: any) {
      alert(`خطأ في تحديث الأقسام: ${error.message}`);
      console.error('Category Update Error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredLinks = useMemo(() => {
    return links
      .filter(link => {
        const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (link.note && link.note.toLowerCase().includes(searchQuery.toLowerCase()));
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
  }, [links, searchQuery, activeCategory]);

  const groupedByCategories = useMemo(() => {
    if (activeCategory !== 'الكل') return null;
    const groups: Record<string, LinkEntry[]> = {};
    filteredLinks.forEach(link => {
      if (!groups[link.category]) groups[link.category] = [];
      groups[link.category].push(link);
    });
    return groups;
  }, [filteredLinks, activeCategory]);

  return (
    <div className="min-h-screen pb-24 bg-white dark:bg-slate-900 transition-colors duration-500">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-blue-50/50 dark:border-slate-800 transition-colors">
        <div className="container mx-auto px-6 py-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-blue-500 dark:text-blue-400 flex items-center gap-3 tracking-tight">
              <span className="bg-blue-500 text-white p-2.5 rounded-[1.2rem] shadow-lg shadow-blue-200/50 flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              ذاكرة الاندلس الرقمية
              {isSyncing && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping ml-2"></div>
              )}
            </h1>
            <div className="flex gap-2 items-center">
              <div title={isSyncing ? "جاري المزامنة..." : "متصل بالسحابة"} className={`p-2 rounded-full ${isSyncing ? 'text-slate-300' : 'text-green-500'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <button
                onClick={() => setIsCatModalOpen(true)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-100 dark:border-slate-700"
                title="إدارة التصنيفات"
              >
                <SettingsIcon />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-100 dark:border-slate-700"
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ابحث عن أي رابط أو ملف مسجل هنا..."
              className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none focus:ring-[3px] focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all shadow-inner placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-6 mb-8 no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveCategory('الكل')}
            className={`whitespace-nowrap px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-sm ${
              activeCategory === 'الكل'
                ? 'bg-blue-500 text-white shadow-blue-200 scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-blue-200'
            }`}
          >
            الكل
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-sm ${
                activeCategory === cat
                  ? 'bg-blue-500 text-white shadow-blue-200 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-blue-200'
              }`}
            >
              {cat}
            </button>
          ))}
          <button 
            onClick={() => setIsCatModalOpen(true)}
            className="flex-shrink-0 p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-500 transition-all shadow-sm border border-dashed border-slate-300 dark:border-slate-600"
            title="إضافة قسم جديد"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold">جاري مزامنة الذاكرة الرقمية...</p>
           </div>
        ) : filteredLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
             <div className="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6 animate-pulse">
               <PlusIcon className="w-12 h-12 text-blue-200" />
             </div>
            <p className="text-xl font-bold text-slate-400">لا توجد نتائج</p>
            <p className="text-sm mt-2">ابدأ بتنظيم روابطك المفضلة الآن</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedByCategories ? (
              categories.map(cat => {
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredLinks.map(link => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onEdit={(l) => { setEditingLink(l); setIsModalOpen(true); }}
                    onDelete={handleDeleteLink}
                    onPin={handleTogglePin}
                  />
                ))}
              </div>
            )}
            
            {activeCategory === 'الكل' && filteredLinks.some(l => !categories.includes(l.category)) && (
               <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-slate-300 rounded-full"></div>
                    <h2 className="text-2xl font-black text-slate-400 dark:text-slate-500 tracking-tight">بدون تصنيف</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredLinks.filter(l => !categories.includes(l.category)).map(link => (
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
            )}
          </div>
        )}
      </main>

      <button
        onClick={() => { setEditingLink(null); setIsModalOpen(true); }}
        className="fixed bottom-10 left-10 w-20 h-20 bg-orange-400 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(251,146,60,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 transform hover:rotate-6"
      >
        <PlusIcon className="w-10 h-10" />
      </button>

      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLink(null); }}
        onSave={handleSaveLink}
        initialData={editingLink}
        categories={categories}
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
