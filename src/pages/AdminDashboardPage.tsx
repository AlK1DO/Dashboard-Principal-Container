import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  FolderOpen,
  LogOut,
  UserCheck,
  ShieldCheck,
  Ban,
  UserX,
} from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink, type SidebarLinkItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { auth, db } from "@/config/firebase";
import ProjectsModal from "@/components/ui/ProjectsModal";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "client";
  status?: "pending" | "approved" | "rejected" | "suspended";
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

type Section = "projects" | "users";

const NAV_ITEMS: { section: Section; label: string; Icon: React.ElementType }[] = [
  { section: "projects", label: "Proyectos", Icon: FolderOpen },
  { section: "users",    label: "Usuarios",  Icon: Users },
];

// ── Admin Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("projects");
  const navigate = useNavigate();

  // Estado usuarios
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Carga todos los usuarios
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("email"));
    return onSnapshot(
      q,
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppUser)));
        setLoadingUsers(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoadingUsers(false);
      }
    );
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("auth_email");
    await signOut(auth);
    navigate("/login");
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

  // ── Nav links ─────────────────────────────────────────────────────────────

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
              {activeSection === "projects" ? "Proyectos" : "Usuarios"}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {activeSection === "projects" ? "Administra el catálogo de proyectos" : `${users.length} usuarios registrados`}
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
                            {u.displayName || "Sin nombre"}
                          </p>
                          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                            {u.email}
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
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Cambiar rol
                        </button>
                        {u.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => void handleDeleteUser(u.id)}
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
        </main>
      </div>
    </div>
  );
}