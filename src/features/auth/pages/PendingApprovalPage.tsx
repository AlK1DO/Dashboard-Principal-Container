import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useLocalAuth } from "../context/AuthContext";
import { db } from "@/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PendingApprovalPage() {
  const { logout, user } = useLocalAuth();
  const navigate = useNavigate();

  // Escucha en tiempo real el documento del usuario en Firestore.
  useEffect(() => {
    if (!user?.email) return;

    const userRef = doc(db, "users", user.email.toLowerCase());

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      // Si el admin expulsó al usuario, el documento ya no existe
      if (!snapshot.exists()) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      const data   = snapshot.data();
      const status = (data?.status as string)?.trim();
      const role   = (data?.role   as string)?.trim();

      // Si fue aprobado, redirige automáticamente al dashboard correcto
      if (status === "approved") {
        navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
      }

      // Si fue suspendido o rechazado, mantenerlo en esta pantalla (ya está aquí)
    });

    return () => unsubscribe();
  }, [user?.email, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md shadow-lg border-slate-200 text-center">
        <CardHeader>
          <div className="mx-auto bg-amber-100 p-3 rounded-full mb-4 w-fit">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Esperando Aprobación
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Tu cuenta ({user?.email}) está en proceso de revisión.
            Serás redirigido automáticamente cuando un administrador apruebe tu acceso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Indicador de espera animado */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]" />
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
            <span className="ml-1">Esperando aprobación...</span>
          </div>

          <Button
            className="w-full"
            variant="ghost"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
