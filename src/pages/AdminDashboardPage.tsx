import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  LogOut,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink, type SidebarLinkItem } from "@/components/ui/sidebar";
import { type Project } from "@/data/projects";
import { cn } from "@/lib/utils";
import { auth, db } from "@/config/firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "client";
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

  // Estado proyectos
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Estado usuarios
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Formulario nuevo proyecto
  const [form, setForm] = useState({ name: "", description: "", image: "", url: "", tech: "" });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Carga todos los proyectos (admin ve todos)
  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("name"));
    return onSnapshot(
      q,
      (snap) => {
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
        setLoadingProjects(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setLoadingProjects(false);
      }
    );
  }, []);

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

  // ── Proyectos CRUD ────────────────────────────────────────────────────────

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "projects"), {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      url: form.url.trim(),
      tech: form.tech.split(",").map((t) => t.trim()).filter(Boolean),
      authorizedUsers: [],
    });
    setForm({ name: "", description: "", image: "", url: "", tech: "" });
    setShowForm(false);
    setSaving(false);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteDoc(doc(db, "projects", id));
  };

  // ── Usuarios: cambiar rol ────────────────────────────────────────────────

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "client" : "admin";
    await updateDoc(doc(db, "users", userId), { role: newRole });
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
              {activeSection === "projects"
                ? `${projects.length} proyectos registrados`
                : `${users.length} usuarios registrados`}
            </p>
          </div>
          {activeSection === "projects" && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium rounded-xl hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo proyecto
            </button>
          )}
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
              className="flex flex-col gap-6"
            >
              {/* Formulario nuevo proyecto */}
              {showForm && (
                <form
                  onSubmit={handleAddProject}
                  className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 flex flex-col gap-3"
                >
                  <h2 className="font-semibold text-neutral-900 dark:text-white">
                    Nuevo proyecto
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      placeholder="Nombre *"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                    <input
                      placeholder="URL del proyecto"
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                    <input
                      placeholder="URL de imagen"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                    <input
                      placeholder="Tecnologías (separadas por coma)"
                      value={form.tech}
                      onChange={(e) => setForm({ ...form, tech: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                    <textarea
                      placeholder="Descripción"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={2}
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 text-sm rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de proyectos */}
              {loadingProjects && (
                <p className="text-sm text-neutral-400">Cargando proyectos...</p>
              )}
              {!loadingProjects && projects.length === 0 && (
                <p className="text-sm text-neutral-400">No hay proyectos aún.</p>
              )}
              {!loadingProjects && projects.length > 0 && (
                <div className="flex flex-col gap-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 px-5 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FolderOpen className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                            {project.name}
                          </p>
                          {project.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {project.tech?.length > 0 && (
                          <div className="hidden sm:flex gap-1.5">
                            {project.tech.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-full"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          aria-label="Eliminar proyecto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                      className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 px-5 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-neutral-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                            {u.displayName || "Sin nombre"}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium",
                            u.role === "admin"
                              ? "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                              : "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                          )}
                        >
                          {u.role === "admin" ? "Admin" : "Cliente"}
                        </span>
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Cambiar rol
                        </button>
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
