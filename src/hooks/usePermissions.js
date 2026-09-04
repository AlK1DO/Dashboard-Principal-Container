import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { userService } from "../services/userService";

export function usePermissions() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await userService.registrarUsuario(currentUser);
        const userRef = doc(db, "usuarios", currentUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const hasAccessToProject = (projectId) => {
    return userService.hasProjectAccess(userData, projectId);
  };

  // Blindado con toLowerCase() para que no falle si el estado/rol
  // se guarda con mayúsculas en algún punto (Firestore manual, etc.)
  const isAdmin = userData?.rol?.toLowerCase() === "administrador";
  const isApproved = userData?.estado?.toLowerCase() === "aprobado";
  const isBlocked = userData?.estado?.toLowerCase() === "bloqueado";

  return { user, userData, loading, hasAccessToProject, isAdmin, isApproved, isBlocked };
}