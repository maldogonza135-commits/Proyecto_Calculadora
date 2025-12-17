// services/firestoreService.ts (solo las partes necesarias)
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Tipo de Tarea simplificado
export interface TareaType {
  id?: string;
  nombreMateria: string;
  nombreTema: string;
  numeroClase: number;
  fechaTarea: Date;
}

// Tipo para el documento de usuario
export interface UsuarioDocumento {
  uid: string;
  email: string;
  displayName?: string;
  fechaRegistro: Date;
}

/**
 * Inicializa el documento del usuario si no existe
 */
export const inicializarUsuario = async (
  uid: string, 
  email: string, 
  displayName?: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'usuarios', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const usuarioData: UsuarioDocumento = {
        uid,
        email,
        displayName,
        fechaRegistro: new Date()
      };
      
      await setDoc(userRef, usuarioData);
      console.log('✅ Documento de usuario creado:', uid);
    }
  } catch (error: any) {
    // Ignorar error de offline durante desarrollo
    if (error.code === 'failed-precondition' || 
        error.code === 'unavailable' ||
        error.message.includes('offline')) {
      console.warn('⚠️ Modo offline: No se pudo verificar/crear usuario en Firestore');
      return; // Silenciosamente retornar
    }
    
    console.error('❌ Error inicializando usuario:', error);
    throw error;
  }
};

/**
 * Obtener referencia a una colección del usuario
 */
export const obtenerColeccionUsuario = (
  uid: string, 
  nombreColeccion: string
) => {
  return collection(db, 'usuarios', uid, nombreColeccion);
};

// Servicio de Tareas simplificado
export const tareaService = {
  /**
   * Obtener todas las tareas del usuario
   */
  obtenerTareas: async (uid: string): Promise<TareaType[]> => {
    try {
      const tareasRef = collection(db, 'usuarios', uid, 'tareas');
      const q = query(tareasRef, orderBy('fechaTarea', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // ✅ CONVERTIR TIMESTAMP A DATE CORRECTAMENTE
        let fechaConvertida: Date;
        
        if (data.fechaTarea && typeof data.fechaTarea.toDate === 'function') {
          // Es un Timestamp de Firestore
          fechaConvertida = data.fechaTarea.toDate();
        } else if (data.fechaTarea && data.fechaTarea.seconds) {
          // Es un objeto Timestamp en formato {seconds, nanoseconds}
          fechaConvertida = new Date(data.fechaTarea.seconds * 1000);
        } else if (data.fechaTarea) {
          // Es ya un Date o string ISO
          fechaConvertida = new Date(data.fechaTarea);
        } else {
          // Sin fecha
          fechaConvertida = new Date();
        }
        
        return {
          id: doc.id,
          nombreMateria: data.nombreMateria || '',
          nombreTema: data.nombreTema || data.nombreTena || '',
          numeroClase: data.numeroClase || data.numeroClass || 0,
          fechaTarea: fechaConvertida // ✅ Ahora es un Date real
        } as TareaType;
      });
    } catch (error) {
      console.error('❌ Error obteniendo tareas:', error);
      throw error;
    }
  },

  /**
   * Crear nueva tarea
   */
  crearTarea: async (
    uid: string, 
    tareaData: Omit<TareaType, 'id'>
  ): Promise<string> => {
    try {
      const tareasRef = obtenerColeccionUsuario(uid, 'tareas');
      
      const docRef = await addDoc(tareasRef, tareaData);
      console.log('✅ Tarea creada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creando tarea:', error);
      throw error;
    }
  },

  /**
   * Actualizar tarea
   */
  actualizarTarea: async (
    uid: string, 
    tareaId: string, 
    datosActualizados: Partial<TareaType>
  ): Promise<void> => {
    try {
      const tareaRef = doc(db, 'usuarios', uid, 'tareas', tareaId);
      await updateDoc(tareaRef, datosActualizados);
      console.log('✅ Tarea actualizada:', tareaId);
    } catch (error) {
      console.error('❌ Error actualizando tarea:', error);
      throw error;
    }
  },

  /**
   * Eliminar tarea
   */
  eliminarTarea: async (uid: string, tareaId: string): Promise<{success: boolean; message: string}> => {
    try {
        console.log('🔍 Eliminando tarea con:', { uid, tareaId });
        
        const tareaRef = doc(db, 'usuarios', uid, 'tareas', tareaId);
        console.log('🗺️ Ruta completa:', `usuarios/${uid}/tareas/${tareaId}`);
        
        const tareaSnap = await getDoc(tareaRef);
        console.log('📄 Documento existe?:', tareaSnap.exists());
        
        if (tareaSnap.exists()) {
            await deleteDoc(tareaRef);
            console.log('✅ Tarea eliminada exitosamente');
            
            return {
                success: true,
                message: 'Tarea eliminada correctamente'
            };
        } else {
            console.warn('⚠️ El documento NO existe en la ruta especificada');
            return {
                success: false,
                message: 'La tarea no existe o ya fue eliminada'
            };
        }
        
    } catch (error: any) {
        console.error('❌ Error eliminando tarea:');
        console.error('   Código:', error.code);
        console.error('   Mensaje:', error.message);
        
        return {
            success: false,
            message: `Error al eliminar: ${error.message}`
        };
    }
  }
};