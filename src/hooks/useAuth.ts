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
    let unsubscribeDoc: (() => void) | undefined;

    const handleUser = (authUser: { uid: string; email: string | null } | null) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = undefined;
      }

      if (!authUser) {
        setState({ user: null, role: null, loading: false });
        return;
      }

      // Usamos el correo como ID del documento (como hace authService.ts)
      const docId = authUser.email ? authUser.email.toLowerCase() : authUser.uid;
      const userRef = doc(db, "users", docId);
      
      unsubscribeDoc = onSnapshot(
        userRef,
        (snapshot) => {
          const role = (snapshot.data()?.role as UserRole) ?? "client";
          setState({ user: authUser as User, role, loading: false });
        },
        (error) => {
          console.error("Error fetching user role from Firestore:", error);
          setState({ user: authUser as User, role: "client", loading: false });
        }
      );
    };

    // Escucha cambios de sesión de Firebase Auth (Link Mágico)
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        handleUser(fbUser);
      } else {
        // Fallback: Si no hay Firebase Auth, comprobamos el OTP guardado localmente
        const savedEmail = localStorage.getItem("auth_email");
        if (savedEmail) {
          // Simulamos un usuario donde el UID es su correo (para mantener compatibilidad)
          handleUser({ uid: savedEmail.toLowerCase(), email: savedEmail.toLowerCase() });
        } else {
          handleUser(null);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return state;
}
