import React, { useState } from "react";
import * as userService from "../../services/userService";

export default function AssignAccessModal({ user, onClose, onSave }) {
  const [rol, setRol] = useState(user?.rol || "usuario");
  const [proyectosAsignados, setProyectosAsignados] = useState(user?.proyectosAsignados || []);

  const proyectosDisponibles = [
    { id: "proyecto-1", nombre: "Proyecto Alpha" },
    { id: "proyecto-2", nombre: "Proyecto Beta" },
    { id: "proyecto-3", nombre: "Proyecto Gamma" }
  ];

  const handleCheckboxChange = (projectId) => {
    if (proyectosAsignados.includes(projectId)) {
      setProyectosAsignados(proyectosAsignados.filter(id => id !== projectId));
    } else {
      setProyectosAsignados([...proyectosAsignados, projectId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.actualizarPermisosUsuario(user.id, {
        rol,
        proyectosAsignados
      });
      onSave();
      onClose();
    } catch (error) {
      console.error("Error al guardar permisos:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Configurar Acceso: {user?.nombre}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rol del Sistema:</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="usuario">Usuario</option>
              <option value="supervisor">Supervisor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <div className="form-group">
            <label>Proyectos Asignados:</label>
            <div className="checkbox-list">
              {proyectosDisponibles.map((p) => (
                <label key={p.id} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={proyectosAsignados.includes(p.id)}
                    onChange={() => handleCheckboxChange(p.id)}
                  />
                  {p.nombre}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}