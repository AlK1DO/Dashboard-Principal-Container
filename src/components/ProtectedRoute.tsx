import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

/**
 * Protege una ruta por rol y estado de aprobación.
 * - Sin sesión        → /login
 * - Status pending    → /pending-approval
 * - Rol incorrecto    → redirige al dashboard del rol real
 * - Cargando          → pantalla de espera
 */
export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const { user, role, status, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <span className="text-sm text-neutral-400">Cargando...</span>
      </div>
    );
  }

  // Sin sesión → al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Usuario pendiente o suspendido (solo clientes, los admin siempre pasan)
  if (role !== "admin" && (status === "pending" || status === "suspended")) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Rol correcto → renderiza la página
  if (role === allowedRole) {
    return <>{children}</>;
  }

  // Rol incorrecto → redirige al dashboard que le corresponde
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "client") return <Navigate to="/dashboard" replace />;

  // Rol no reconocido → al login
  return <Navigate to="/login" replace />;
}
