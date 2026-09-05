import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ExternalLink,
  FolderOpen,
  GitBranch,
  Info,
  LayoutDashboard,
  Link,
  LogOut,
  UserCog,
} from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink, type SidebarLinkItem } from "@/components/ui/sidebar";
import { type Project } from "@/data/projects";
import { cn } from "@/lib/utils";
import { auth, db } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

// ── Logo ─────────────────────────────────────────────────────────────────────

const SidebarLogo = ({ expanded }: { expanded: boolean }) => (
  <div className="flex items-center gap-2 py-1">
    <div className="h-5 w-6 flex-shrink-0 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
    {expanded && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-sm text-black dark:text-white whitespace-pre"
      >
        Mis Proyectos
      </motion.span>
    )}
  </div>
);

// ── Project Tile ─────────────────────────────────────────────────────────────

const ProjectTile = ({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) => {
  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="group flex min-h-[300px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-700">
          {project.icon ? (
            <img src={project.icon} alt={project.name} className="h-full w-full object-cover" />
          ) : (
            <FolderOpen className="h-5 w-5 text-neutral-500" />
          )}
        </div>

        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            project.activo
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
          )}
        >
          {project.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      <button type="button" onClick={() => onOpen(project)} className="mt-6 min-w-0 text-left">
        <h3 className="truncate text-base font-semibold text-neutral-900 dark:text-white">
          {project.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {project.description || "Proyecto sin descripción"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tech?.slice(0, 3).map((technology) => (
            <span key={technology} className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
              {technology}
            </span>
          ))}
          <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
            {project.path || "Sin ruta"}
          </span>
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4 text-neutral-400 dark:border-neutral-700">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => openExternal(project.vercelUrl || project.url || project.path)} disabled={!project.vercelUrl && !project.url && !project.path} aria-label="Abrir proyecto" className="transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-white">
            <ExternalLink className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => openExternal(project.repository)} disabled={!project.repository} aria-label="Abrir repositorio" className="transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-white">
            <GitBranch className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => onOpen(project)} aria-label="Abrir proyecto dentro del dashboard" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
            <Link className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onOpen(project)} aria-label="Ver detalles del proyecto" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

// ── Nav config ────────────────────────────────────────────────────────────────

type Section = "dashboard" | "profile";

const NAV_ITEMS: { section: Section; label: string; Icon: React.ElementType }[] = [
  { section: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { section: "profile",   label: "Perfil",    Icon: UserCog },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ClientDashboardPage() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const navigate = useNavigate();

  const { user } = useAuth();

  // Proyectos activos visibles para el usuario:
  // - Si authorizedUsers está vacío → visible para todos los clientes.
  // - Si authorizedUsers tiene correos → solo esas personas lo ven.
  useEffect(() => {
    const q = query(
      collection(db, "projects"),
      where("activo", "==", true)
    );

    const emailLower = user?.email?.toLowerCase() ?? "";

    return onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
        const visible = all.filter((p) => {
          const authorized = p.authorizedUsers ?? [];
          return authorized.length === 0 || authorized.includes(emailLower);
        });
        setProjects(visible);
        setLoadingProjects(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setLoadingProjects(false);
      }
    );
  }, [user?.email]);

  const handleLogout = async () => {
    localStorage.removeItem("auth_email");
    await signOut(auth);
    navigate("/login");
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
        <header className="flex items-center px-6 py-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {activeSection === "dashboard" ? "Dashboard" : "Mi Perfil"}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {activeSection === "dashboard"
                ? `${projects.length} proyectos disponibles`
                : user?.email ?? ""}
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {activeSection === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-6">
                Proyectos autorizados
              </h2>

              {loadingProjects && (
                <p className="text-sm text-neutral-400">Cargando proyectos...</p>
              )}

              {!loadingProjects && projects.length === 0 && (
                <p className="text-sm text-neutral-400">
                  No tienes proyectos autorizados aún.
                </p>
              )}

              {!loadingProjects && projects.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {projects.map((project, idx) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ProjectTile project={project} onOpen={setSelectedProject} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeSection === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="max-w-lg"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <UserCog className="h-8 w-8 text-neutral-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {user?.displayName ?? "Sin nombre"}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {user?.email ?? ""}
                    </p>
                  </div>
                </div>

                <hr className="border-neutral-200 dark:border-neutral-700" />

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      Proyectos autorizados
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {projects.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      Correo verificado
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {user?.emailVerified ? "Sí" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-700 px-4 py-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedProject.name}</h3>
                <p className="text-xs text-neutral-400">{selectedProject.path}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700"
              >
                Cerrar
              </button>
            </div>

            {selectedProject.vercelUrl ? (
              <iframe
                src={selectedProject.vercelUrl}
                title={selectedProject.name}
                className="h-[72vh] w-full bg-white"
                loading="lazy"
              />
            ) : (
              <div className="flex h-[72vh] items-center justify-center bg-neutral-950 p-6 text-center text-neutral-300">
                Este proyecto no tiene una URL disponible para abrir dentro de la página.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}