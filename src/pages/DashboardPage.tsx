import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UserCog,
  LogOut,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";

// ── Logo ────────────────────────────────────────────────────────────────────
const Logo = () => (
  <div className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20">
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-semibold text-black dark:text-white whitespace-pre"
    >
      Mis Proyectos
    </motion.span>
  </div>
);

const LogoIcon = () => (
  <div className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20">
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
  </div>
);

// ── Project Card ─────────────────────────────────────────────────────────────
interface ProjectCardProps {
  name: string;
  description: string;
  image: string;
  url: string;
  tech: string[];
}

const ProjectCard = ({ name, description, image, url, tech }: ProjectCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
  >
    {/* Imagen */}
    <div className="h-40 overflow-hidden">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>

    {/* Contenido */}
    <div className="p-4 flex flex-col flex-1 gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-neutral-900 dark:text-white text-base leading-tight">
          {name}
        </h3>
        <FolderOpen className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-0.5" />
      </div>

      <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed flex-1">
        {description}
      </p>

      {/* Tecnologías */}
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

      {/* Botón abrir */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 flex items-center justify-center gap-2 w-full py-2 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium rounded-xl hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        Abrir proyecto
      </a>
    </div>
  </motion.div>
);

// ── Dashboard Page ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"dashboard" | "profile">("dashboard");
  const navigate = useNavigate();

  const authorizedProjects = projects.filter((p) => p.authorized);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <LayoutDashboard
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors",
            activeSection === "dashboard"
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          )}
        />
      ),
      onClick: () => setActiveSection("dashboard"),
    },
    {
      label: "Perfil",
      href: "#",
      icon: (
        <UserCog
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors",
            activeSection === "profile"
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          )}
        />
      ),
      onClick: () => setActiveSection("profile"),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* ── Sidebar ── */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          {/* Top: logo + links */}
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-1">
              {links.map((link) => (
                <SidebarLink
                  key={link.label}
                  link={link}
                  onClick={link.onClick}
                  className={cn(
                    "rounded-lg px-2 transition-colors",
                    (activeSection === "dashboard" && link.label === "Dashboard") ||
                    (activeSection === "profile" && link.label === "Perfil")
                      ? "bg-neutral-200 dark:bg-neutral-700"
                      : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Bottom: salir */}
          <div>
            <SidebarLink
              link={{
                label: "Salir",
                href: "#",
                icon: (
                  <LogOut className="h-5 w-5 flex-shrink-0 text-red-500" />
                ),
              }}
              onClick={handleLogout}
              className="rounded-lg px-2 hover:bg-red-50 dark:hover:bg-red-950/30"
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {activeSection === "dashboard" ? "Dashboard" : "Mi Perfil"}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {activeSection === "dashboard"
                ? `${authorizedProjects.length} proyectos disponibles`
                : "Información de tu cuenta"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
            </div>
          </div>
        </header>

        {/* Content area */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {authorizedProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                  >
                    <ProjectCard
                      name={project.name}
                      description={project.description}
                      image={project.image}
                      url={project.url}
                      tech={project.tech}
                    />
                  </motion.div>
                ))}
              </div>
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
                      Usuario
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Administrador de proyectos
                    </p>
                  </div>
                </div>
                <hr className="border-neutral-200 dark:border-neutral-700" />
                <div className="flex flex-col gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Proyectos autorizados</span>
                    <span>{authorizedProjects.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Rol</span>
                    <span>Administrador</span>
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
