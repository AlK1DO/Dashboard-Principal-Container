import React from "react";
import { usePermissions } from "../../hooks/usePermissions";

export default function RequireProjectAccess({ projectId, children }) {
  const { loading, userData, hasAccessToProject, isApproved, isAdmin } = usePermissions();

  if (loading) {
    return <div className="loading-screen">Verificando credenciales de acceso...</div>;
  }

  if (!userData || !isApproved) {
    return (
      <div className="access-denied-box">
        <h3>Cuenta Pendiente o No Autorizada</h3>
        <p>Tu cuenta se encuentra en estado: <strong>{userData?.estado || "desconocido"}</strong>.</p>
        <p>Un administrador debe aprobar tu acceso para visualizar este módulo.</p>
      </div>
    );
  }

  if (!isAdmin && !hasAccessToProject(projectId)) {
    return (
      <div className="access-denied-box">
        <h3>Acceso Restringido</h3>
        <p>No tienes permisos asignados para visualizar el proyecto: <strong>{projectId}</strong>.</p>
      </div>
    );
  }

  return children;
}