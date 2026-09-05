import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Project } from "@/data/projects";

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

const INITIAL_PROJECT_ID = "crm-basico";
const initialProject: ProjectInput = {
  name: "CRM básico",
  description: "Sistema de gestión de clientes y oportunidades comerciales.",
  path: "/crm",
  vercelUrl: "https://crm-basico.vercel.app",
  repository: "https://github.com/AlK1DO/CRM-basico",
  icon: "",
  activo: true,
  authorizedUsers: [],
};

export async function ensureInitialProject() {
  const initialProjectRef = doc(db, "projects", INITIAL_PROJECT_ID);
  if (!(await getDoc(initialProjectRef)).exists()) {
    await setDoc(initialProjectRef, { ...initialProject, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const projectsQuery = query(collection(db, "projects"), orderBy("name"));
    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map((projectDoc) => ({ id: projectDoc.id, ...projectDoc.data() } as Project)));
      setLoading(false);
    }, (snapshotError) => {
      console.error("Error fetching projects:", snapshotError);
      setError("No se pudieron cargar los proyectos.");
      setLoading(false);
    });

    void ensureInitialProject().catch((seedError) => console.error("Error seeding initial project:", seedError));
    return unsubscribe;
  }, []);

  const addProject = async (project: ProjectInput) => {
    await addDoc(collection(db, "projects"), { ...project, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  };

  const updateProject = async (id: string, project: Partial<ProjectInput>) => {
    await updateDoc(doc(db, "projects", id), { ...project, updatedAt: serverTimestamp() });
  };

  const toggleProject = async (project: Project) => updateProject(project.id, { activo: !project.activo });

  const deleteProject = async (id: string) => {
    await deleteDoc(doc(db, "projects", id));
  };

  return { projects, loading, error, addProject, updateProject, toggleProject, deleteProject };
}