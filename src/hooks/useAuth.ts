import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

export type UserRole = "admin" | "client" | null;

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
}

/**
 * Escucha el estado de autenticación y lee el campo `role`
 * del documento users/{uid} en Firestore.
 *
 * Estructura esperada en Firestore:
 *   collection: "users"
 *   document:   uid del usuario
 *   fields:     { role: "admin" | "client", ... }
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Escucha cambios de sesión de Firebase Auth
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setState({ user: null, role: null, loading: false });
        return;
      }

      // Escucha el documento del usuario en Firestore en tiempo real
      const userRef = doc(db, "users", user.uid);
      const unsubscribeDoc = onSnapshot(
        userRef,
        (snapshot) => {
          const role = (snapshot.data()?.role as UserRole) ?? null;
          setState({ user, role, loading: false });
        },
        (error) => {
          console.error("Error fetching user role from Firestore:", error);
          // Si hay error de permisos (por reglas de Firestore), 
          // asumimos un rol por defecto o nulo para no quedarnos en "Cargando..."
          setState({ user, role: "client", loading: false });
        }
      );

      // Limpia el listener de Firestore cuando el usuario cambia
      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  return state;
}
