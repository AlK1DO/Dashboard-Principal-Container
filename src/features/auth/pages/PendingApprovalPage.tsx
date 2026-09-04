import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PendingApprovalPage() {
  const { logout, checkStatus, user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    await checkStatus();
    setTimeout(() => setIsChecking(false), 1000);
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
            Tu cuenta ({user?.email}) está en proceso de revisión. Un administrador debe aprobar tu acceso para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={handleCheckStatus}
            disabled={isChecking}
          >
            {isChecking ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
            Verificar Estado
          </Button>
          <Button 
            className="w-full" 
            variant="ghost" 
            onClick={logout}
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

