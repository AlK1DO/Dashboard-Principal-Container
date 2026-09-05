import { useState, type FormEvent } from "react";
import {
  ExternalLink,
  FolderOpen,
  GitBranch,
  Pencil,
  Plus,
  Power,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { useProjects, type ProjectInput } from "@/hooks/useProjects";
import type { Project } from "@/data/projects";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit" | "users" | "delete" | null;

// ── Estado vacío del formulario ───────────────────────────────────────────────

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

// ── Formulario reutilizable (crear / editar) ──────────────────────────────────

interface ProjectFormProps {
  form: ProjectInput;
  saving: boolean;
  onChange: (field: keyof ProjectInput, value: string | boolean) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  submitLabel: string;
}

function ProjectForm({ form, saving, onChange, onSubmit, onCancel, submitLabel }: ProjectFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          Nombre
          <Input required value={form.name} onChange={(e) => onChange("name", e.target.value)} placeholder="CRM básico" className="mt-1.5" />
        </label>
        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          Ruta interna
          <Input required value={form.path} onChange={(e) => onChange("path", e.target.value)} placeholder="/crm" className="mt-1.5" />
        </label>
        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          URL de Vercel
          <Input type="url" value={form.vercelUrl} onChange={(e) => onChange("vercelUrl", e.target.value)} placeholder="https://mi-proyecto.vercel.app" className="mt-1.5" />
        </label>
        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          Repositorio de GitHub
          <Input type="url" value={form.repository} onChange={(e) => onChange("repository", e.target.value)} placeholder="https://github.com/usuario/repo" className="mt-1.5" />
        </label>
        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300 sm:col-span-2">
          Icono (URL opcional)
          <Input type="url" value={form.icon} onChange={(e) => onChange("icon", e.target.value)} placeholder="https://.../icono.png" className="mt-1.5" />
        </label>
        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300 sm:col-span-2">
          Descripción
          <textarea
            required
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Describe brevemente el proyecto"
            className="mt-1.5 min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 sm:col-span-2">
          <input type="checkbox" checked={form.activo} onChange={(e) => onChange("activo", e.target.checked)} />
          Proyecto activo
        </label>
      </div>
      <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4 dark:border-neutral-700 sm:px-7">
        <button type="button" onClick={onCancel} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── Modal de usuarios autorizados ─────────────────────────────────────────────

interface AuthUsersModalProps {
  project: Project;
  onClose: () => void;
  onSave: (users: string[]) => Promise<void>;
}

function AuthUsersModal({ project, onClose, onSave }: AuthUsersModalProps) {
  const [users, setUsers] = useState<string[]>(project.authorizedUsers ?? []);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [inputError, setInputError] = useState("");

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInputError("Correo inválido.");
      return;
    }
    if (users.includes(email)) {
      setInputError("Este correo ya está en la lista.");
      return;
    }
    setUsers((prev) => [...prev, email]);
    setNewEmail("");
    setInputError("");
  };

  const removeEmail = (email: string) => setUsers((prev) => prev.filter((u) => u !== email));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(users);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-7">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Agrega los correos de los usuarios que pueden ver <span className="font-medium text-neutral-900 dark:text-white">{project.name}</span>.
      </p>

      {/* Input para agregar */}
      <div className="flex gap-2">
        <Input
          type="email"
          value={newEmail}
          onChange={(e) => { setNewEmail(e.target.value); setInputError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }}
          placeholder="usuario@correo.com"
          className="flex-1"
        />
        <button type="button" onClick={addEmail} className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </div>
      {inputError && <p className="text-xs text-red-500">{inputError}</p>}

      {/* Lista de usuarios */}
      {users.length === 0 ? (
        <p className="py-4 text-center text-sm text-neutral-400">Sin usuarios autorizados.</p>
      ) : (
        <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto">
          {users.map((email) => (
            <li key={email} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{email}</span>
              <button type="button" onClick={() => removeEmail(email)} aria-label={`Eliminar ${email}`} className="text-neutral-400 hover:text-red-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
        <button type="button" onClick={onClose} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800">
          Cancelar
        </button>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ── Modal de confirmación de eliminación ──────────────────────────────────────

interface DeleteConfirmProps {
  project: Project;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteConfirm({ project, onClose, onConfirm }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-7">
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        ¿Estás seguro de que quieres eliminar{" "}
        <span className="font-semibold text-neutral-900 dark:text-white">{project.name}</span>?
        Esta acción no se puede deshacer.
      </p>
      <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
        <button type="button" onClick={onClose} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800">
          Cancelar
        </button>
        <button type="button" onClick={() => void handleConfirm()} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
          {deleting ? "Eliminando..." : "Sí, eliminar"}
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ProjectsModal() {
  const { projects, loading, error, addProject, updateProject, toggleProject, deleteProject } = useProjects();

  const [mode, setMode] = useState<ModalMode>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectInput>(emptyProject);
  const [saving, setSaving] = useState(false);

  const updateForm = (field: keyof ProjectInput, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setForm(emptyProject);
    setSelectedProject(null);
    setMode("create");
  };

  const openEdit = (project: Project) => {
    setForm({
      name: project.name,
      description: project.description,
      path: project.path,
      vercelUrl: project.vercelUrl,
      repository: project.repository,
      icon: project.icon,
      activo: project.activo,
      authorizedUsers: project.authorizedUsers ?? [],
    });
    setSelectedProject(project);
    setMode("edit");
  };

  const openUsers = (project: Project) => {
    setSelectedProject(project);
    setMode("users");
  };

  const openDelete = (project: Project) => {
    setSelectedProject(project);
    setMode("delete");
  };

  const closeModal = () => {
    setMode(null);
    setSelectedProject(null);
  };

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addProject(form);
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSaving(true);
    try {
      await updateProject(selectedProject.id, form);
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUsers = async (users: string[]) => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, { authorizedUsers: users });
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    await deleteProject(selectedProject.id);
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
            <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              Nuevo proyecto
            </button>
          </div>

          {loading && <p className="py-8 text-sm text-neutral-500">Cargando proyectos...</p>}
          {error && <p className="py-8 text-sm text-red-600">{error}</p>}
          {!loading && !error && projects.length === 0 && (
            <p className="py-8 text-sm text-neutral-500">Todavía no hay proyectos registrados.</p>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article key={project.id} className="flex min-h-[265px] flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300">
                      {project.icon
                        ? <img src={project.icon} alt="" className="h-6 w-6 rounded object-cover" />
                        : <FolderOpen className="h-5 w-5" />}
                    </div>
                    <span className={project.activo
                      ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                      : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500"}>
                      {project.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">{project.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">{project.description}</p>
                    <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                      {(project.authorizedUsers ?? []).length} usuario{(project.authorizedUsers ?? []).length !== 1 ? "s" : ""} autorizado{(project.authorizedUsers ?? []).length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-neutral-400">
                    <div className="flex items-center gap-4">
                      <a href={project.vercelUrl || project.url || "#"} target="_blank" rel="noreferrer" aria-label="Abrir proyecto" className="hover:text-neutral-900 dark:hover:text-white">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <a href={project.repository || "#"} target="_blank" rel="noreferrer" aria-label="Abrir repositorio" className="hover:text-neutral-900 dark:hover:text-white">
                        <GitBranch className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => openUsers(project)} aria-label="Gestionar usuarios autorizados" className="hover:text-neutral-900 dark:hover:text-white">
                        <Users className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => void toggleProject(project)} aria-label={project.activo ? "Desactivar proyecto" : "Activar proyecto"} className="hover:text-neutral-900 dark:hover:text-white">
                        <Power className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => openEdit(project)} aria-label="Editar proyecto" className="hover:text-neutral-900 dark:hover:text-white">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => openDelete(project)} aria-label="Eliminar proyecto" className="hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal: Crear proyecto */}
      <Modal isOpen={mode === "create"} onClose={closeModal} title="Nuevo proyecto" className="max-w-4xl">
        <ProjectForm
          form={form}
          saving={saving}
          onChange={updateForm}
          onSubmit={handleCreate}
          onCancel={closeModal}
          submitLabel="Guardar proyecto"
        />
      </Modal>

      {/* Modal: Editar proyecto */}
      <Modal isOpen={mode === "edit"} onClose={closeModal} title={`Editar — ${selectedProject?.name ?? ""}`} className="max-w-4xl">
        <ProjectForm
          form={form}
          saving={saving}
          onChange={updateForm}
          onSubmit={handleEdit}
          onCancel={closeModal}
          submitLabel="Guardar cambios"
        />
      </Modal>

      {/* Modal: Usuarios autorizados */}
      <Modal isOpen={mode === "users"} onClose={closeModal} title="Usuarios autorizados" className="max-w-lg">
        {selectedProject && (
          <AuthUsersModal
            project={selectedProject}
            onClose={closeModal}
            onSave={handleSaveUsers}
          />
        )}
      </Modal>

      {/* Modal: Confirmar eliminación */}
      <Modal isOpen={mode === "delete"} onClose={closeModal} title="Eliminar proyecto" className="max-w-md">
        {selectedProject && (
          <DeleteConfirm
            project={selectedProject}
            onClose={closeModal}
            onConfirm={handleDelete}
          />
        )}
      </Modal>
    </>
  );
}
