import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Obtener todos los usuarios de la colección asegurando un formato limpio
export const obtenerUsuarios = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    const usuarios = querySnapshot.docs.map(documento => {
      const data = documento.data();
      return {
        id: documento.id,
        nombre: data.nombre || data.Nombre || "Sin nombre",
        email: data.email || data.Email || "Sin correo",
        // Normalizamos a minúsculas para que el filtro y los badges
        // funcionen sin importar cómo se guardó el dato originalmente
        estado: (data.estado || data.Estado || "pendiente").toLowerCase(),
        rol: (data.rol || data.Rol || "usuario").toLowerCase(),
        proyectosAsignados: data.proyectosAsignados || []
      };
    });
    return usuarios;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
};

// Actualizar el estado de un usuario (aprobar, rechazar, bloquear)
export const actualizarEstadoUsuario = async (idUsuario, nuevoEstado) => {
  try {
    const usuarioRef = doc(db, "usuarios", idUsuario);
    await updateDoc(usuarioRef, { estado: nuevoEstado.toLowerCase() });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    throw error;
  }
};

// Actualizar el rol o proyectos de un usuario
export const actualizarPermisosUsuario = async (idUsuario, nuevosDatos) => {
  try {
    const datosNormalizados = { ...nuevosDatos };
    if (datosNormalizados.rol) {
      datosNormalizados.rol = datosNormalizados.rol.toLowerCase();
    }
    const usuarioRef = doc(db, "usuarios", idUsuario);
    await updateDoc(usuarioRef, datosNormalizados);
  } catch (error) {
    console.error("Error al actualizar permisos:", error);
    throw error;
  }
};

// Registrar usuario si no existe (usado por el hook de permisos)
export const registrarUsuario = async (user, additionalData = {}) => {
  if (!user) return null;
  try {
    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        nombre: user.displayName || additionalData.nombre || "Sin nombre",
        estado: "pendiente",
        rol: "usuario",
        proyectosAsignados: [],
        createdAt: new Date().toISOString(),
        ...additionalData
      };
      await setDoc(userRef, userData);
      return userData;
    }
    return userSnap.data();
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

// Helper: determina si un usuario tiene acceso a un proyecto
export const hasProjectAccess = (userData, projectId) => {
  if (!userData || userData.estado?.toLowerCase() !== "aprobado") return false;
  if (userData.rol?.toLowerCase() === "administrador") return true;
  return userData.proyectosAsignados?.includes(projectId) || false;
};

// Backwards-compatible aggregate export
export const userService = {
  obtenerUsuarios,
  actualizarEstadoUsuario,
  actualizarPermisosUsuario,
  registrarUsuario,
  hasProjectAccess
};