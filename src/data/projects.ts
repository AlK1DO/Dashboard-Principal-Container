export interface Project {
  id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  tech: string[];
}

// Los proyectos se cargan desde Firestore.
// Este array es solo el tipo de referencia — no hardcodear datos aquí.
export const projects: Project[] = [];
