import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import ClientDashboardPage from "@/pages/ClientDashboardPage";

// Importaciones de Rama-Rojas (login)
import { AuthProvider } from "@/features/auth/context/AuthContext";
import LoginPage from "@/features/auth/pages/LoginPage";
import PendingApprovalPage from "@/features/auth/pages/PendingApprovalPage";
import { useAuth } from "@/hooks/useAuth";

/** Redirige al dashboard correcto según el rol del usuario */
function RootRedirect() {
  const { user, role, status, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <span className="text-sm text-neutral-400">Cargando...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (status === "pending" && role !== "admin") return <Navigate to="/pending-approval" replace />;
  if (status === "suspended" && role !== "admin") return <Navigate to="/pending-approval" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="client">
                <ClientDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback: cualquier ruta desconocida redirige según rol */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
