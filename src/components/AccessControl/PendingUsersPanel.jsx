import React, { useEffect, useState } from "react";
import * as userService from "../../services/userService";
import AssignAccessModal from "./AssignAccessModal";
import "./AccessControl.css";

export default function PendingUsersPanel() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("pendiente");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarUsuarios = async () => {
    try {
      const data = await userService.obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleEstado = async (uid, nuevoEstado) => {
    try {
      await userService.actualizarEstadoUsuario(uid, nuevoEstado);
      cargarUsuarios();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const abrirModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtro === "todos") return true;
    return u.estado === filtro;
  });

  return (
    <div className="access-control-container">
      <h2>Panel de Control de Usuarios y Permisos</h2>

      <div className="tabs">
        <button
          className={filtro === "pendiente" ? "active" : ""}
          onClick={() => setFiltro("pendiente")}
        >
          Pendientes
        </button>
        <button
          className={filtro === "aprobado" ? "active" : ""}
          onClick={() => setFiltro("aprobado")}
        >
          Aprobados
        </button>
        <button
          className={filtro === "bloqueado" ? "active" : ""}
          onClick={() => setFiltro("bloqueado")}
        >
          Bloqueados
        </button>
        <button
          className={filtro === "todos" ? "active" : ""}
          onClick={() => setFiltro("todos")}
        >
          Todos
        </button>
      </div>

      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No hay usuarios en esta sección.</td>
              </tr>
            ) : (
              usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.estado}`}>{u.estado}</span>
                  </td>
                  <td>{u.rol}</td>
                  <td>
                    {u.estado === "pendiente" && (
                      <>
                        <button className="btn-approve" onClick={() => handleEstado(u.id, "aprobado")}>Aprobar</button>
                        <button className="btn-reject" onClick={() => handleEstado(u.id, "rechazado")}>Rechazar</button>
                      </>
                    )}
                    {u.estado === "aprobado" && (
                      <button className="btn-block" onClick={() => handleEstado(u.id, "bloqueado")}>Bloquear</button>
                    )}
                    {u.estado === "bloqueado" && (
                      <button className="btn-approve" onClick={() => handleEstado(u.id, "aprobado")}>Reactivar</button>
                    )}
                    <button className="btn-config" onClick={() => abrirModal(u)}>Configurar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AssignAccessModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSave={cargarUsuarios}
        />
      )}
    </div>
  );
}