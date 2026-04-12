import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { verifyPassword } from '../lib/hash';

interface SectionGateProps {
  sectionName: string;
  children: React.ReactNode;
}

const SectionGate: React.FC<SectionGateProps> = ({ sectionName, children }) => {
  const { isSectionAuthorized, authorizeSection, isAdmin } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (isSectionAuthorized(sectionName)) {
    return <>{children}</>;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      const q = query(collection(db, 'sections'), where('name', '==', sectionName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('هذا القسم غير محمي بكلمة مرور أو غير موجود.');
      } else {
        const sectionData = querySnapshot.docs[0].data();
        if (verifyPassword(password, sectionData.passwordHash)) {
          authorizeSection(sectionName);
        } else {
          setError('كلمة المرور غير صحيحة.');
        }
      }
    } catch (err) {
      console.error("Error verifying section password:", err);
      setError('حدث خطأ أثناء التحقق من كلمة المرور.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl border border-blue-50 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center">
        <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">قسم محمي</h3>
        <p className="text-slate-500 dark:text-slate-400">يرجى إدخال كلمة المرور الخاصة بقسم "{sectionName}" للمتابعة.</p>
      </div>

      <form onSubmit={handleVerify} className="w-full max-w-xs space-y-4">
        <input
          type="password"
          placeholder="كلمة مرور القسم"
          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="text-pink-500 text-sm font-bold">{error}</p>}
        <button
          type="submit"
          disabled={isVerifying}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 disabled:opacity-50"
        >
          {isVerifying ? 'جاري التحقق...' : 'دخول القسم'}
        </button>
      </form>
    </div>
  );
};

export default SectionGate;
