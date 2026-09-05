import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import ClientDashboardPage from "@/pages/ClientDashboardPage";

// Importaciones de Rama-Rojas (login)
import { AuthProvider } from "@/features/auth/context/AuthContext";
import LoginPage from "@/features/auth/pages/LoginPage";
import PendingApprovalPage from "@/features/auth/pages/PendingApprovalPage";
import { ensureInitialProject } from "@/hooks/useProjects";

function App() {
  useEffect(() => {
    void ensureInitialProject().catch((error) => {
      console.error("Error creando el proyecto inicial:", error);
    });
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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

          {/* Fallback: cualquier ruta desconocida va al dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
