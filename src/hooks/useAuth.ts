import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

export type UserRole = "admin" | "client" | null;
export type UserStatus = "pending" | "approved" | "rejected" | "suspended" | null;

interface AuthState {
  user: { uid: string; email: string | null; displayName?: string | null; emailVerified?: boolean } | null;
  role: UserRole;
  status: UserStatus;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    status: null,
    loading: true,
  });

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const checkLocalSession = () => {
      const savedEmail = localStorage.getItem("auth_email");
      if (!savedEmail) {
        setState({ user: null, role: null, status: null, loading: false });
        return;
      }

      const emailLower = savedEmail.toLowerCase();
      const userRef = doc(db, "users", emailLower);

      unsubscribeDoc = onSnapshot(
        userRef,
        (snapshot) => {
          const data = snapshot.data();
          const role = ((data?.role as string)?.trim() as UserRole) ?? "client";
          const status = ((data?.status as string)?.trim() as UserStatus) ?? "pending";
          const authMethod = localStorage.getItem("auth_method");
          const authUser = {
            uid: emailLower,
            email: emailLower,
            displayName: data?.displayName,
            emailVerified: authMethod === "link",
          };
          setState({ user: authUser, role, status, loading: false });
        },
        (error) => {
          console.error("Error fetching user from Firestore:", error);
          const authMethod = localStorage.getItem("auth_method");
          const authUser = { uid: emailLower, email: emailLower, emailVerified: authMethod === "link" };
          setState({ user: authUser, role: "client", status: "pending", loading: false });
        }
      );
    };

    checkLocalSession();

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
