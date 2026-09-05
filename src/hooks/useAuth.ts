import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

export type UserRole = "admin" | "client" | null;

interface AuthState {
  user: { uid: string; email: string | null; displayName?: string | null; emailVerified?: boolean } | null;
  role: UserRole;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const checkLocalSession = () => {
      const savedEmail = localStorage.getItem("auth_email");
      if (!savedEmail) {
        setState({ user: null, role: null, loading: false });
        return;
      }

      const emailLower = savedEmail.toLowerCase();
      const userRef = doc(db, "users", emailLower);
      
      unsubscribeDoc = onSnapshot(
        userRef,
        (snapshot) => {
          const role = (snapshot.data()?.role as UserRole) ?? "client";
          // We provide a fake user object matching the shape needed by components
          const authMethod = localStorage.getItem("auth_method");
          const authUser = { 
            uid: emailLower, 
            email: emailLower, 
            displayName: snapshot.data()?.displayName,
            emailVerified: authMethod === "link" 
          };
          setState({ user: authUser, role, loading: false });
        },
        (error) => {
          console.error("Error fetching user role from Firestore:", error);
          const authMethod = localStorage.getItem("auth_method");
          const authUser = { uid: emailLower, email: emailLower, emailVerified: authMethod === "link" };
          setState({ user: authUser, role: "client", loading: false });
        }
      );
    };

    checkLocalSession();

    // Re-check when storage changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_email") {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = undefined;
        }
        checkLocalSession();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return state;
}
