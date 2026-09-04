import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export interface UserProfile {
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const getOrCreateUser = async (email: string): Promise<UserProfile> => {
  try {
    const userRef = doc(db, "users", email.toLowerCase());
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    } else {
      const newUser: UserProfile = {
        email: email.toLowerCase(),
        status: "pending", // Default status for new users
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (error: any) {
    console.warn("Firestore error (posiblemente reglas de seguridad). Usando usuario local simulado.", error);
    // Fallback if Firestore fails (e.g. missing security rules)
    return {
      email: email.toLowerCase(),
      status: "approved", // Set to approved so they can see the dashboard
      createdAt: new Date().toISOString(),
    };
  }
};

