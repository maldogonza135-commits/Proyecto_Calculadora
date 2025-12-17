// hooks/useAuthData.ts
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { inicializarUsuario } from '../utils/firestoreService';

export const useAuthData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Verificar conexión a internet
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    
    checkOnlineStatus(); // Estado inicial
    
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Solo intentar inicializar en Firestore si hay conexión
          if (isOnline) {
            await inicializarUsuario(
              firebaseUser.uid, 
              firebaseUser.email || '', 
              firebaseUser.displayName || ''
            );
          } else {
            console.log('⚠️ Modo offline - Saltando inicialización de Firestore');
          }
          
          console.log('✅ Usuario autenticado:', firebaseUser.uid);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        // Si es error de offline, solo mostrar warning
        if (err.code === 'unavailable' || err.message?.includes('offline')) {
          console.warn('⚠️ Error de conexión:', err.message);
          setError('Sin conexión a internet. Modo offline activado.');
        } else {
          console.error('❌ Error en autenticación:', err);
          setError('Error al cargar datos del usuario');
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isOnline]); // Dependencia de isOnline

  return { 
    user, 
    loading, 
    error,
    isOnline
  };
};