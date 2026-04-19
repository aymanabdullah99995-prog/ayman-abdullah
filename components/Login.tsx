import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { verifyPassword, hashPassword } from '../lib/hash';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'ok' | 'error'>('testing');

  React.useEffect(() => {
    const testConnection = async () => {
      try {
        await getDoc(doc(db, 'settings', 'connection_test'));
        setConnectionStatus('ok');
      } catch (err) {
        console.error("Firestore connection test failed:", err);
        setConnectionStatus('error');
      }
    };
    testConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 0. Admin Override (Force update DB with 6200)
      if (password === '6200') {
        const hash = hashPassword('6200');
        await setDoc(doc(db, 'settings', 'admin_config'), { adminPasswordHash: hash });
        await setDoc(doc(db, 'settings', 'global_config'), { globalPasswordHash: hash });
        login(true);
        return;
      }

      // 1. Check Global Password
      const globalDoc = await getDoc(doc(db, 'settings', 'global_config'));
      if (globalDoc.exists()) {
        const { globalPasswordHash } = globalDoc.data();
        if (verifyPassword(password, globalPasswordHash)) {
          login(false);
          return;
        }
      }

      // 2. Check Admin Password (if not global)
      const adminDoc = await getDoc(doc(db, 'settings', 'admin_config'));
      if (adminDoc.exists()) {
        const { adminPasswordHash } = adminDoc.data();
        if (verifyPassword(password, adminPasswordHash)) {
          login(true);
          return;
        }
      }

      // 3. Check Section-Specific Passwords
      // Allow users to enter the platform using a section password
      const hashedSearch = hashPassword(password);
      const sectionsQuery = query(collection(db, 'sections'), where('passwordHash', '==', hashedSearch));
      const sectionSnapshot = await getDocs(sectionsQuery);
      
      if (!sectionSnapshot.empty) {
        const sectionData = sectionSnapshot.docs[0].data();
        login(false, sectionData.name);
        return;
      }

      // 4. First-time Bootstrap (Initial Setup)
      // If admin_config doesn't exist, allow '6200' to create it
      if (!adminDoc.exists() && password === '6200') {
        const hash = hashPassword('6200');
        await setDoc(doc(db, 'settings', 'admin_config'), { adminPasswordHash: hash });
        if (!globalDoc.exists()) {
          await setDoc(doc(db, 'settings', 'global_config'), { globalPasswordHash: hash });
        }
        login(true);
        return;
      }

      setError('كلمة المرور غير صحيحة.');
    } catch (err) {
      console.error("Login error:", err);
      setError('حدث خطأ أثناء تسجيل الدخول.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-2xl border border-blue-50 dark:border-slate-700 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center overflow-hidden border border-blue-50 dark:border-slate-700 p-4">
            <img 
              src="https://alandalus.edu.sa/wp-content/uploads/2023/05/logo-1.png" 
              alt="Alandalus Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl font-black text-blue-500 dark:text-blue-400 tracking-tight">ذاكرة الاندلس الرقمية</h1>
          <div className="bg-blue-500/10 text-blue-500 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-500/20">
            النظام المطور v2.0
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-bold">يرجى إدخال كلمة المرور للمتابعة</p>
          {connectionStatus === 'error' && (
            <p className="text-red-500 text-xs mt-2 font-bold">⚠️ فشل الاتصال بقاعدة البيانات. تأكد من جدار الحماية أو الاتصال.</p>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <input
              type="password"
              placeholder="كلمة المرور"
              className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-700 border-none focus:ring-[3px] focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all text-center text-lg font-bold placeholder:text-slate-300 dark:placeholder:text-slate-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-pink-500 text-center font-bold text-sm">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-100 dark:shadow-none active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'جاري التحقق...' : 'دخول المنصة'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-300 dark:text-slate-600 font-bold">
          جميع الحقوق محفوظة لشركة الأندلس التعليمية © 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
