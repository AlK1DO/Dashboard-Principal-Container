export interface Project {
  id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  authorized: boolean;
  tech: string[];
}

export const projects: Project[] = [
  {
    id: "1",
    name: "Sistema de Inventario",
    description: "Gestión de inventario en tiempo real con alertas automáticas de stock y reportes exportables.",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&auto=format&fit=crop&q=60",
    url: "https://inventario.ejemplo.com",
    authorized: true,
    tech: ["React", "Node.js", "PostgreSQL"],
  },
  {
    id: "2",
    name: "Portal de Clientes",
    description: "Plataforma self-service para clientes con seguimiento de pedidos y soporte integrado.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60",
    url: "https://clientes.ejemplo.com",
    authorized: true,
    tech: ["Vue.js", "Firebase", "Tailwind"],
  },
  {
    id: "3",
    name: "Dashboard Analytics",
    description: "Visualización de métricas clave del negocio con gráficas interactivas y filtros avanzados.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60",
    url: "https://analytics.ejemplo.com",
    authorized: true,
    tech: ["React", "D3.js", "TypeScript"],
  },
  {
    id: "4",
    name: "App de Recursos Humanos",
    description: "Módulo de RRHH para gestión de nómina, vacaciones y evaluación de desempeño.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&auto=format&fit=crop&q=60",
    url: "https://rrhh.ejemplo.com",
    authorized: true,
    tech: ["Angular", "Spring Boot", "MySQL"],
  },
  {
    id: "5",
    name: "CRM Empresarial",
    description: "Herramienta de gestión de relaciones con clientes, seguimiento de ventas y pipeline.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=60",
    url: "https://crm.ejemplo.com",
    authorized: true,
    tech: ["React", "Express", "MongoDB"],
  },
  {
    id: "6",
    name: "Plataforma E-learning",
    description: "Sistema de cursos en línea con seguimiento de progreso, certificados y foros.",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=60",
    url: "https://elearning.ejemplo.com",
    authorized: true,
    tech: ["Next.js", "Prisma", "Stripe"],
  },
];
