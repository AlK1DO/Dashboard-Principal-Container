import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FolderOpen,
  LogOut,
  UserCheck,
  ShieldCheck,
  Ban,
  UserX,
  AlertTriangle,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink, type SidebarLinkItem } from "@/components/ui/sidebar";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { db } from "@/config/firebase";
import ProjectsModal from "@/components/ui/ProjectsModal";
import ChatWindow from "@/components/ui/ChatWindow";
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/features/auth/context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "client";
  status?: "pending" | "approved" | "rejected" | "suspended";
}

interface ConfirmDialog {
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
}

// ── Logo ──────────────────────────────────────────────────────────────────────

const SidebarLogo = ({ expanded }: { expanded: boolean }) => (
  <div className="flex items-center gap-2 py-1">
    <div className="h-5 w-6 flex-shrink-0 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
    {expanded && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-sm text-black dark:text-white whitespace-pre"
      >
        Admin Panel
      </motion.span>
    )}
  </div>
);

// ── Nav config ────────────────────────────────────────────────────────────────

type Section = "projects" | "users" | "contact";

const NAV_ITEMS: { section: Section; label: string; Icon: React.ElementType }[] = [
  { section: "projects", label: "Proyectos", Icon: FolderOpen },
  { section: "users",    label: "Usuarios",  Icon: Users },
  { section: "contact",  label: "Mensajes",  Icon: MessageSquare },
];

// ── Admin Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("projects");
  const { user: adminUser, logout } = useAuth();

  // Estado usuarios
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Chat: cliente seleccionado
  const [selectedChatClient, setSelectedChatClient] = useState<AppUser | null>(null);

  // Diálogo de confirmación genérico
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Carga todos los usuarios
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("email"));
    return onSnapshot(
      q,
      async (snap) => {
        const allDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppUser));

        // Limpiar documentos cuyo ID no coincide con su email (duplicados basura)
        const garbage = allDocs.filter(
          (u) => u.email && u.id !== u.email.toLowerCase()
        );
        if (garbage.length > 0) {
          console.log(`Limpiando ${garbage.length} documentos duplicados...`);
          await Promise.all(garbage.map((u) => deleteDoc(doc(db, "users", u.id))));
          // El snapshot se actualizará solo después del borrado
          return;
        }

        setUsers(allDocs);
        setLoadingUsers(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoadingUsers(false);
      }
    );
  }, []);

  const handleLogout = () => {
    logout();
  };

  // ── Usuarios: cambiar rol ────────────────────────────────────────────────

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "client" : "admin";
    await updateDoc(doc(db, "users", userId), { role: newRole });
  };

  const handleUpdateStatus = async (userId: string, status: AppUser["status"]) => {
    await updateDoc(doc(db, "users", userId), { status });
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteDoc(doc(db, "users", userId));
  };

  // ── Confirmaciones ───────────────────────────────────────────────────────

  const confirmToggleRole = (u: AppUser) => {
    const newRole = u.role === "admin" ? "cliente" : "admin";
    setConfirmDialog({
      title: "Cambiar rol",
      message: `¿Cambiar el rol de ${u.displayName || u.email} a ${newRole}?`,
      onConfirm: () => handleToggleRole(u.id, u.role),
    });
  };

  const confirmDeleteUser = (u: AppUser) => {
    setConfirmDialog({
      title: "Expulsar usuario",
      message: `¿Estás seguro de que quieres expulsar a ${u.displayName || u.email}? Esta acción no se puede deshacer.`,
      onConfirm: () => handleDeleteUser(u.id),
    });
  };

  const runConfirm = async () => {
    if (!confirmDialog) return;
    setConfirming(true);
    try {
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } finally {
      setConfirming(false);
    }
  };

  const navLinks: (SidebarLinkItem & { section: Section })[] = NAV_ITEMS.map(
    ({ section, label, Icon }) => ({
      section,
      label,
      href: "#",
      icon: (
        <Icon
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors",
            activeSection === section
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          )}
        />
      ),
    })
  );

  return (
    <div className="flex h-screen w-full bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarLogo expanded={open} />
            <nav className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <SidebarLink
                  key={link.section}
                  link={link}
                  onClick={() => setActiveSection(link.section)}
                  className={cn(
                    "rounded-lg px-2 transition-colors",
                    activeSection === link.section
                      ? "bg-neutral-200 dark:bg-neutral-700"
                      : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                />
              ))}
            </nav>
          </div>
          <SidebarLink
            link={{
              label: "Salir",
              href: "#",
              icon: <LogOut className="h-5 w-5 flex-shrink-0 text-red-500" />,
            }}
            onClick={handleLogout}
            className="rounded-lg px-2 hover:bg-red-50 dark:hover:bg-red-950/30"
          />
        </SidebarBody>
      </Sidebar>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {activeSection === "projects" ? "Proyectos" : activeSection === "users" ? "Usuarios" : "Mensajes"}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {activeSection === "projects"
                ? "Administra el catálogo de proyectos"
                : activeSection === "users"
                ? `${users.length} usuarios registrados`
                : selectedChatClient
                ? `Chat con ${selectedChatClient.email}`
                : "Selecciona un cliente para chatear"}
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── Proyectos ── */}
          {activeSection === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex w-full flex-col gap-6"
            >
              <ProjectsModal />
            </motion.div>
          )}

          {/* ── Usuarios ── */}
          {activeSection === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {loadingUsers && (
                <p className="text-sm text-neutral-400">Cargando usuarios...</p>
              )}
              {!loadingUsers && users.length === 0 && (
                <p className="text-sm text-neutral-400">No hay usuarios registrados.</p>
              )}
              {!loadingUsers && users.length > 0 && (
                <div className="flex flex-col gap-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 dark:border-neutral-700 dark:bg-neutral-800 sm:px-5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <Users className="h-4 w-4 text-neutral-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                            {u.email}
                          </p>
                          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                            {u.role === "admin" ? "Administrador" : "Cliente"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            u.role === "admin"
                              ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          )}
                        >
                          {u.role === "admin" ? "Admin" : "Cliente"}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {u.status === "pending" ? "Pendiente" : u.status === "suspended" ? "Suspendido" : "Verificado"}
                        </span>
                        {u.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => void handleUpdateStatus(u.id, "approved")}
                            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verificar
                          </button>
                        )}
                        {u.role !== "admin" && u.status !== "suspended" && (
                          <button
                            type="button"
                            onClick={() => void handleUpdateStatus(u.id, "suspended")}
                            className="flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-1.5 text-xs text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Suspender
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => confirmToggleRole(u)}
                          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Cambiar rol
                        </button>
                        {u.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => confirmDeleteUser(u)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            Expulsar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Mensajes / Chat ── */}
          {activeSection === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex gap-4 h-full"
            >
              {/* Lista de clientes */}
              <div className="w-64 flex-shrink-0 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1 px-1">
                  Clientes
                </p>
                {loadingUsers && (
                  <p className="text-sm text-neutral-400 px-1">Cargando...</p>
                )}
                {!loadingUsers && users.filter(u => u.role === "client").length === 0 && (
                  <p className="text-sm text-neutral-400 px-1">No hay clientes aún.</p>
                )}
                {users
                  .filter((u) => u.role === "client")
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedChatClient(u)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                        selectedChatClient?.id === u.id
                          ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
                          : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                      )}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <Users className="h-3.5 w-3.5 text-neutral-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {u.email}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Panel de chat */}
              <div className="flex-1 min-w-0">
                {!selectedChatClient ? (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
                    <div className="text-center text-neutral-400">
                      <MessageSquare className="mx-auto h-10 w-10 mb-3 opacity-40" />
                      <p className="text-sm">Selecciona un cliente para ver su chat</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 h-full">
                    <button
                      type="button"
                      onClick={() => setSelectedChatClient(null)}
                      className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 self-start"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Volver a lista
                    </button>
                    <ChatWindow
                      clientEmail={selectedChatClient.email.toLowerCase()}
                      currentUserEmail={adminUser?.email?.toLowerCase() ?? ""}
                      currentUserRole="admin"
                      className="flex-1"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Modal: Confirmar acción destructiva */}
      <Modal isOpen={!!confirmDialog} onClose={() => setConfirmDialog(null)} title={confirmDialog?.title ?? ""} className="max-w-md">
        <div className="flex flex-col gap-4 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{confirmDialog?.message}</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <button type="button" onClick={() => setConfirmDialog(null)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800">
              Cancelar
            </button>
            <button type="button" onClick={() => void runConfirm()} disabled={confirming} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {confirming ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}