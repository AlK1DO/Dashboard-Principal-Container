export interface Project {
  id: string;
  name: string;
  description: string;
  path: string;
  vercelUrl: string;
  repository: string;
  icon: string;
  activo: boolean;
  authorizedUsers?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
  image?: string;
  url?: string;
  tech?: string[];
}

// Los proyectos se cargan desde Firestore.
// Este array es solo el tipo de referencia — no hardcodear datos aquí.
export const projects: Project[] = [];
