import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";

import { FirebaseError } from "firebase/app";
import { auth } from "../config/firebase.js";


const login = async (email:string, password:string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("Sesion iniciada, UID: " + user.uid)
        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
            }
        };
    } catch (error) {
        if (error instanceof FirebaseError){
            console.error("Error en login:", error.code, error.message);
            return {
                success: false,
                error: error.message,
                errorCode: error.code
            };
        }
        return {
            success: false,
            error: "Error inesperado"
        };
    }
}

const register = async (email:string, password:string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Cuenta creada, UID: " + user);

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
            }
        };
    } catch (error) {
        if (error instanceof FirebaseError){
            console.error("Error en registro:", error.code, error.message);
            return {
                success: false,
                error: error.message,
                errorCode: error.code
            };
        }
        return {
            success: false,
            error: "Error inesperado"
        };
    }
}

const signout = async () => {
    try {
        await signOut(auth);
        console.log("Sesion cerrada")
        return {
            success: true,
            message: "Sesión cerrada exitosamente"
        };
    } catch (error) {
        if (error instanceof FirebaseError){
            console.error("Error al cerrar sesion, vuelva a intentar:", error.code, error.message);
            return {
                success: false,
                error: error.message,
                errorCode: error.code
            };
        }
        return {
            success: false,
            error: "Error inesperado"
        };
    }
}

const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);

    return {
            success: true,
            message: "Email de recuperación enviado"
    };
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      let errorMessage = "Error al enviar email de recuperación";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No existe una cuenta con este email";
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      };
    }
    
    return {
      success: false,
      error: "Error inesperado"
    };
  }
};

export {
    login,
    register, resetPassword, signout
};

