import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, UserCog, LogOut, ExternalLink, FolderOpen } from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink, type SidebarLinkItem } from "@/components/ui/sidebar";
import { type Project } from "@/data/projects";
import { cn } from "@/lib/utils";
import { db } from "@/config/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useAuth as useLocalAuth } from "@/features/auth/context/AuthContext";

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

// ── Project Card ─────────────────────────────────────────────────────────────

const ProjectCard = ({ name, description, image, url, tech }: Project) => (
  <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
    {image ? (
      <div className="h-40 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    ) : (
      <div className="h-40 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
        <FolderOpen className="h-10 w-10 text-neutral-400" />
      </div>
    )}

    <div className="p-4 flex flex-col flex-1 gap-3">
      <h3 className="font-semibold text-neutral-900 dark:text-white text-base leading-tight">
        {name}
      </h3>

      {description && (
        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed flex-1">
          {description}
        </p>
      )}

      {tech?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tech.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <a
        href={url || "#"}
        target={url ? "_blank" : undefined}
        rel="noopener noreferrer"
        aria-disabled={!url}
        className={cn(
          "mt-1 flex items-center justify-center gap-2 w-full py-2 px-4 text-sm font-medium rounded-xl transition-colors",
          url
            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200"
            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed pointer-events-none"
        )}
      >
        <ExternalLink className="h-4 w-4" />
        {url ? "Abrir proyecto" : "Sin enlace"}
      </a>
    </div>
  </div>
);

// ── Nav config ────────────────────────────────────────────────────────────────

type Section = "dashboard" | "profile";

const NAV_ITEMS: { section: Section; label: string; Icon: React.ElementType }[] = [
  { section: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { section: "profile",   label: "Perfil",    Icon: UserCog },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { user } = useAuth();
  const { logout: localLogout } = useLocalAuth();

  // Carga proyectos autorizados desde Firestore en tiempo real
  useEffect(() => {
    if (!user) return;

    // Usamos el correo en minúsculas para unificar la búsqueda sin importar cómo inició sesión
    const searchId = user.email ? user.email.toLowerCase() : user.uid;
    const q = query(
      collection(db, "projects"),
      where("authorizedUsers", "array-contains", searchId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        setProjects(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    localLogout();
    navigate("/");
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

              {loading && (
                <p className="text-sm text-neutral-400">Cargando proyectos...</p>
              )}

              {!loading && projects.length === 0 && (
                <p className="text-sm text-neutral-400">
                  No tienes proyectos autorizados aún.
                </p>
              )}

              {!loading && projects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map((project, idx) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07 }}
                    >
                      <ProjectCard {...project} />
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
    </div>
  );
}
