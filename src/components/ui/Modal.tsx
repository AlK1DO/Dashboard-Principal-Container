import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function Modal({ isOpen, onClose, children, title, className = "" }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      role="presentation"
    >
      <section
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`max-h-[min(90vh,800px)] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 ${className}`}
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
          {title ? <h2 id="modal-title" className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2> : <span />}
          <button type="button" onClick={onClose} aria-label="Cerrar ventana" className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body
  );
}