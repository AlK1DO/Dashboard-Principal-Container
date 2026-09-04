import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
import LoginPage from "./features/auth/pages/LoginPage";
import PendingApprovalPage from "./features/auth/pages/PendingApprovalPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Button } from "./components/ui/button";

function DashboardLayout() {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

function DashboardHome() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-4">Bienvenido al Dashboard</h2>
      <p className="text-slate-600">Has iniciado sesión con éxito y tu cuenta está aprobada.</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

