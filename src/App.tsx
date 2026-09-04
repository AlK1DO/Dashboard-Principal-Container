import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import ClientDashboardPage from "@/pages/ClientDashboardPage";

/**
 * Rutas:
 *   /           → redirige a /dashboard
 *   /login      → lo implementa el compañero (aquí solo se referencia)
 *   /dashboard  → solo rol "client"
 *   /admin      → solo rol "admin"
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
  );
}

export default App;
