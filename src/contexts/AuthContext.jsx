import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc, getDoc, runTransaction, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setRole(userDoc.data().role ?? null);
          } else {
            // Hujjat yo'q. Birinchi marta hech kim admin bo'lmagan bo'lsa
            // (system/bootstrap.adminCreated hali true emas), shu kirgan
            // kishi bir martalik "bootstrap" sifatida avtomatik admin
            // qilinadi. Tranzaksiya ikkala yozuvni (users/{uid} va
            // system/bootstrap) baravar bajaradi — ikki kishi bir vaqtda
            // kirsa ham faqat bittasi admin bo'ladi. Keyingi
            // foydalanuvchilar uchun bu ishlamaydi — ularning
            // users/{uid} hujjatini mavjud admin qo'lda yaratadi.
            try {
              const bootstrapRef = doc(db, 'system', 'bootstrap');
              const newRole = await runTransaction(db, async (tx) => {
                const flag = await tx.get(bootstrapRef);
                if (flag.exists() && flag.data().adminCreated) {
                  return null;
                }
                tx.set(userRef, {
                  role: 'admin',
                  email: firebaseUser.email,
                  createdAt: serverTimestamp(),
                  bootstrapped: true,
                });
                tx.set(bootstrapRef, {
                  adminCreated: true,
                  createdBy: firebaseUser.uid,
                  createdAt: serverTimestamp(),
                });
                return 'admin';
              });
              setRole(newRole);
            } catch (bootstrapErr) {
              console.error('Bootstrap xatosi:', bootstrapErr);
              setRole(null);
            }
          }
        } catch (err) {
          console.error('Rol olishda xatolik:', err);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth faqat AuthProvider ichida ishlatiladi');
  }
  return context;
}