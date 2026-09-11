import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, ArrowRight, X, Mail, User, MessageSquare } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { sendContactEmail } from "@/features/auth/services/emailService";

// Tecnologías a mostrar en el footer
const technologies = [
  { name: "React", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "TypeScript", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "Tailwind CSS", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Firebase", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
  { name: "Vite", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg" },
  { name: "Node.js", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
];

export default function LandingPage() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || 
             window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const navigate = useNavigate();

  // Toggling dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    try {
      // 1. Guardar en Firestore para el panel de admin
      await addDoc(collection(db, "contactMessages"), {
        fullName,
        email,
        message,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // 2. Enviar correo vía EmailJS
      await sendContactEmail(fullName, email, message);

      setContactSuccess(true);
      setTimeout(() => {
        setIsContactOpen(false);
        setContactSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      alert("Hubo un error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-50 flex flex-col font-sans transition-colors duration-300">
      
      {/* HEADER */}
      <header className="w-full flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="font-bold text-xl tracking-tight">Sempiterno</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsContactOpen(true)}
            className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Contáctanos
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto -mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
            Sempiterno
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Plataforma centralizada para la visualización y gestión ágil de proyectos. 
            Accede de forma segura a tus aplicaciones autorizadas, explora repositorios 
            y mantén el control de tus ecosistemas digitales en un solo lugar.
          </p>
          
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
          >
            Acceder a Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </main>

      {/* FOOTER & TECHNOLOGIES CAROUSEL */}
      <footer className="w-full pb-10 pt-6 border-t border-neutral-100 dark:border-neutral-900 overflow-hidden">
        <div className="text-center text-sm font-medium text-neutral-500 dark:text-neutral-500 mb-8">
          Tecnologías que utilizamos
        </div>
        
        {/* Infinite Carousel effect using Framer Motion */}
        <div className="w-full flex relative max-w-5xl mx-auto mask-image-gradient pb-8">
          <motion.div
            className="flex gap-12 sm:gap-20 items-center shrink-0 pr-12 sm:pr-20"
            animate={{ x: [0, -1000] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 20,
            }}
          >
            {[...technologies, ...technologies, ...technologies].map((tech, idx) => (
              <div 
                key={idx} 
                className="group relative flex flex-col items-center justify-center cursor-default transition-transform hover:scale-110"
              >
                <img 
                  src={tech.src} 
                  alt={tech.name} 
                  className="w-10 h-10 object-contain transition-all duration-300 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 drop-shadow-sm" 
                />
                <span className="absolute -bottom-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-white/80 dark:bg-black/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 pointer-events-none shadow-sm">
                  {tech.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </footer>

      {/* CONTACT MODAL */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative border border-neutral-200 dark:border-neutral-800"
            >
              <button
                onClick={() => setIsContactOpen(false)}
                className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Contáctanos</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    O escríbenos a kellerrobles23@gmail.com
                  </p>
                </div>

                {contactSuccess ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-center text-sm font-medium">
                    ¡Mensaje enviado con éxito! Te contactaremos pronto.
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Nombre Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          required
                          name="fullName"
                          type="text"
                          placeholder="Tu nombre completo"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          required
                          name="email"
                          type="email"
                          placeholder="tu.correo@ejemplo.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Mensaje</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <textarea
                          required
                          name="message"
                          rows={4}
                          placeholder="¿En qué podemos ayudarte?"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none"
                        ></textarea>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                      {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Estilos adicionales para la máscara del carrusel */}
      <style>{`
        .mask-image-gradient {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
}
