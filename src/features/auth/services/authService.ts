import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export interface UserProfile {
  email: string;
  displayName: string;
  role: "admin" | "client";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const getOrCreateUser = async (email: string): Promise<UserProfile> => {
  const emailLower = email.toLowerCase();
  const userRef = doc(db, "users", emailLower);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  // Usuario nuevo: se guarda con rol "client" por defecto
  const newUser: UserProfile = {
    email: emailLower,
    displayName: emailLower.split("@")[0],
    role: "client",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  await setDoc(userRef, newUser);
  return newUser;
};

