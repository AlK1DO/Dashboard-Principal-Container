import { useState, type FormEvent } from "react";
import { ExternalLink, FolderOpen, GitBranch, Pencil, Plus, Power } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { useProjects, type ProjectInput } from "@/hooks/useProjects";

const emptyProject: ProjectInput = {
  name: "",
  description: "",
  path: "",
  vercelUrl: "",
  repository: "",
  icon: "",
  activo: true,
  authorizedUsers: [],
};

export default function ProjectsModal() {
  const { projects, loading, error, addProject, toggleProject } = useProjects();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [form, setForm] = useState<ProjectInput>(emptyProject);
  const [saving, setSaving] = useState(false);

  const updateForm = (field: keyof ProjectInput, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await addProject(form);
      setForm(emptyProject);
      setIsNewProjectOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700 sm:px-7">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Gestión de proyectos</h2>
        </header>
        <div className="px-5 py-4 sm:px-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {projects.length} {projects.length === 1 ? "proyecto registrado" : "proyectos registrados"}
            </p>
            <button type="button" onClick={() => setIsNewProjectOpen(true)} className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              Nuevo proyecto
            </button>
          </div>

          {loading && <p className="py-8 text-sm text-neutral-500">Cargando proyectos...</p>}
          {error && <p className="py-8 text-sm text-red-600">{error}</p>}
          {!loading && !error && projects.length === 0 && <p className="py-8 text-sm text-neutral-500">Todavía no hay proyectos registrados.</p>}
          {!loading && !error && projects.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article key={project.id} className="flex min-h-[265px] flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300">
                      {project.icon ? <img src={project.icon} alt="" className="h-6 w-6 rounded object-cover" /> : <FolderOpen className="h-5 w-5" />}
                    </div>
                    <span className={project.activo ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500"}>
                      {project.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="mt-auto">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">{project.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">{project.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-neutral-400">
                    <div className="flex items-center gap-4">
                      <a href={project.vercelUrl || project.url || "#"} target="_blank" rel="noreferrer" aria-label="Abrir proyecto" className="hover:text-neutral-900 dark:hover:text-white"><ExternalLink className="h-4 w-4" /></a>
                      <a href={project.repository || "#"} target="_blank" rel="noreferrer" aria-label="Abrir repositorio" className="hover:text-neutral-900 dark:hover:text-white"><GitBranch className="h-4 w-4" /></a>
                    </div>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => void toggleProject(project)} aria-label={project.activo ? "Desactivar proyecto" : "Activar proyecto"} className="hover:text-neutral-900 dark:hover:text-white"><Power className="h-4 w-4" /></button>
                      <button type="button" aria-label="Editar proyecto" className="hover:text-neutral-900 dark:hover:text-white"><Pencil className="h-4 w-4" /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={isNewProjectOpen} onClose={() => setIsNewProjectOpen(false)} title="Nuevo proyecto" className="max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Nombre<Input required value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="CRM básico" className="mt-1.5" /></label>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Ruta interna<Input required value={form.path} onChange={(event) => updateForm("path", event.target.value)} placeholder="/crm" className="mt-1.5" /></label>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">URL de Vercel<Input type="url" value={form.vercelUrl} onChange={(event) => updateForm("vercelUrl", event.target.value)} placeholder="https://mi-proyecto.vercel.app" className="mt-1.5" /></label>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Repositorio de GitHub<Input type="url" value={form.repository} onChange={(event) => updateForm("repository", event.target.value)} placeholder="https://github.com/usuario/repositorio" className="mt-1.5" /></label>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300 sm:col-span-2">Icono (URL opcional)<Input type="url" value={form.icon} onChange={(event) => updateForm("icon", event.target.value)} placeholder="https://.../icono.png" className="mt-1.5" /></label>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300 sm:col-span-2">Descripción<textarea required value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Describe brevemente el proyecto" className="mt-1.5 min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 sm:col-span-2"><input type="checkbox" checked={form.activo} onChange={(event) => updateForm("activo", event.target.checked)} />Proyecto activo</label>
          </div>
          <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4 dark:border-neutral-700 sm:px-7">
            <button type="button" onClick={() => setIsNewProjectOpen(false)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Guardando..." : "Guardar proyecto"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}