import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  /** Email del cliente dueño del hilo (key del chat en Firestore) */
  clientEmail: string;
  /** Email del usuario que está escribiendo ahora */
  currentUserEmail: string;
  /** Rol del usuario que está escribiendo */
  currentUserRole: "admin" | "client";
  /** Email del admin — necesario para notificar cuando escribe el cliente */
  adminEmail?: string;
  className?: string;
}

export default function ChatWindow({
  clientEmail,
  currentUserEmail,
  currentUserRole,
  adminEmail,
  className,
}: ChatWindowProps) {
  const { messages, loading, error, sendMessage } = useChatMessages(
    clientEmail || null
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending || !currentUserEmail) return;
    setSending(true);
    setSendError(null);
    try {
      await sendMessage(input, currentUserEmail.toLowerCase(), currentUserRole, adminEmail);
      setInput("");
    } catch (e: any) {
      setSendError("Error al enviar: " + (e?.message ?? "desconocido"));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!clientEmail) {
    return (
      <div className={cn("flex items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700", className)}>
        <p className="text-sm text-neutral-400">Cargando chat...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 overflow-hidden",
        className
      )}
    >
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 h-96">
        {loading && (
          <p className="text-center text-sm text-neutral-400 mt-8">
            Cargando mensajes...
          </p>
        )}

        {error && (
          <p className="text-center text-sm text-red-500 mt-8">
            Error: {error}
          </p>
        )}

        {!loading && !error && messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400 mt-8">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </p>
        )}

        {messages.map((msg) => {
          const isMine =
            msg.senderEmail.toLowerCase() === currentUserEmail.toLowerCase();

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[75%] gap-1",
                isMine ? "ml-auto items-end" : "items-start"
              )}
            >
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 px-1">
                {isMine
                  ? "Tú"
                  : msg.senderRole === "admin"
                  ? "Admin"
                  : msg.senderEmail}
              </span>

              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
                  isMine
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-white rounded-tl-sm"
                )}
              >
                {msg.text}
              </div>

              {msg.createdAt?.toDate && (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 px-1">
                  {msg.createdAt.toDate().toLocaleTimeString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error de envío */}
      {sendError && (
        <p className="px-4 pb-1 text-xs text-red-500">{sendError}</p>
      )}

      {/* Input */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 p-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Escribe un mensaje… (Enter para enviar)"
          className="flex-1 resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
          style={{ maxHeight: 120 }}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!input.trim() || sending || !currentUserEmail}
          className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
