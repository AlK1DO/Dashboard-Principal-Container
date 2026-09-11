import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { sendChatNotificationEmail } from "@/features/auth/services/emailService";

export interface ChatMessage {
  id: string;
  text: string;
  senderEmail: string;
  senderRole: "admin" | "client";
  createdAt: any;
}

/**
 * Hook para el chat en tiempo real entre admin y un cliente.
 * Colección Firestore: chats/{clientEmail}/messages/{messageId}
 *
 * NO usa orderBy en la query para evitar que Firestore crashee
 * en subcolecciones vacías. El orden se aplica en el cliente.
 */
export function useChatMessages(clientEmail: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientEmail || clientEmail.trim() === "") {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = collection(db, "chats", clientEmail.trim(), "messages");

    // Sin orderBy — evita el crash de Firestore en subcolecciones vacías
    const unsub = onSnapshot(
      messagesRef,
      (snap) => {
        const msgs: ChatMessage[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ChatMessage, "id">),
        }));

        // Ordenar en el cliente por timestamp (segundos)
        msgs.sort((a, b) => {
          const ta = a.createdAt?.seconds ?? a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.seconds ?? b.createdAt?.toMillis?.() ?? 0;
          return ta - tb;
        });

        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        console.error("Chat error:", err.code, err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [clientEmail]);

  const sendMessage = async (
    text: string,
    senderEmail: string,
    senderRole: "admin" | "client",
    adminEmail?: string  // email del admin, necesario cuando escribe el cliente
  ) => {
    if (!clientEmail?.trim() || !text.trim()) return;

    const messagesRef = collection(db, "chats", clientEmail.trim(), "messages");

    // 1. Guardar en Firestore
    await addDoc(messagesRef, {
      text: text.trim(),
      senderEmail: senderEmail.toLowerCase(),
      senderRole,
      createdAt: serverTimestamp(),
    });

    // 2. Notificar por email al receptor
    //    - Si escribe el cliente  → notificar al admin
    //    - Si escribe el admin    → notificar al cliente (clientEmail)
    const recipientEmail =
      senderRole === "client"
        ? (adminEmail ?? import.meta.env.VITE_ADMIN_EMAIL ?? "")
        : clientEmail.trim();

    if (recipientEmail) {
      void sendChatNotificationEmail(
        recipientEmail,
        senderEmail.toLowerCase(),
        senderRole,
        text.trim()
      );
    }
  };

  return { messages, loading, error, sendMessage };
}