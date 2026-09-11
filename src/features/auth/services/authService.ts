import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export interface UserProfile {
  email: string;
  displayName: string;
  role: "admin" | "client";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// Correos que siempre tienen rol admin y status approved
const ADMIN_EMAILS = ["infolostralaleritosdesenati@gmail.com"];

export const getOrCreateUser = async (email: string): Promise<UserProfile> => {
  const emailLower = email.toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(emailLower);
  const userRef = doc(db, "users", emailLower);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const profile = userSnap.data() as UserProfile;
    // Si es admin pero su doc tiene datos incorrectos, los corrige
    if (isAdmin && (profile.role !== "admin" || profile.status !== "approved")) {
      await updateDoc(userRef, { role: "admin", status: "approved" });
      return { ...profile, role: "admin", status: "approved" };
    }
    return profile;
  }

  // Usuario nuevo
  const newUser: UserProfile = {
    email: emailLower,
    displayName: emailLower.split("@")[0],
    role: isAdmin ? "admin" : "client",
    status: isAdmin ? "approved" : "pending",
    createdAt: new Date().toISOString(),
  };
  await setDoc(userRef, newUser);
  return newUser;
};

