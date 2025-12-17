import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore"; // Importa persistentLocalCache

const firebaseConfig = {
    apiKey: 'AIzaSyD_Xgv2EQpcRoVauUsyFicrxynlx-2lNrs',
    authDomain: 'sistema-arf.firebaseapp.com',
    projectId: 'sistema-arf',
    storageBucket: 'sistema-arf.firebasestorage.app',
    messagingSenderId: '567848891530',
    appId: '1:567848891530:web:696cdf5fd9dc4d22e7a973',
    measurementId: 'G-3C7NSZ0K2W',
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({}), // ✅ Nuevo método oficial
});

export { app, auth };

