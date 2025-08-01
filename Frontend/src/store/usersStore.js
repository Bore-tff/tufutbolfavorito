import { create } from "zustand";
import {
  registerRequest,
  fetchUsers,
  obtenerUsuariosConPuntaje,
  obtenerResumenDeUsuario,
  obtenerRankingPorFecha,
  seleccionarEquipoFavorito,
  obtenerRankingPorFechaFavoritos
} from "../api/auth";

const useUserStore = create((set) => {
  const storedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  return {
    user: storedUser,
    rankingFecha: [],
    rankingsFavoritos: [],
    rankingGeneral: [],
    resumenUsuario: null,
    equipoFavorito: storedUser?.equipoFavorito || null,
    mensaje: null,
    loading: false,
    error: null,

    

    login: async (usuario, password) => {
      try {
        set({ loading: true, error: null });

        const response = await fetch(import.meta.env.VITE_API_USERS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: usuario, password }),
        });

        const data = await response.json();

        if (response.ok) {
          set({ user: data.user, equipoFavorito: data.user.equipoFavorito || null, loading: false });
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
          return true;
        } else {
          set({ error: data.message || "Credenciales incorrectas", loading: false });
          return false;
        }
      } catch (error) {
        set({ error: "Error al conectar con el servidor", loading: false });
        return false;
      }
    },

    register: async ({ user, password, nombre, apellido, email }) => {
        set({ loading: true, error: null });
        try {
          const response = await registerRequest({ user, password, nombre, apellido, email });
          set({ user: response.data, loading: false });
        } catch (error) {
          console.error("Error en el registro:", error);
          const mensaje =
            error.response?.data?.message || "Error en el registro";
            set({ error: mensaje, loading: false });
          throw error; // opcional, si querés seguir manejándolo en el componente
        }
      },


    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({
        user: null,
        equipoFavorito: null,
        resumenUsuario: null,
        rankingFecha: [],
        rankingGeneral: [],
        rankingsFavoritos: [],
        error: null,
        loading: false,
      });
    },

  /*----------------------------- MODO DE JUEGO NORMAL -----------------------------*/

    getRankingPorFecha: async (fecha) => {
      try {
        set({ loading: true, error: null });
        const res = await obtenerRankingPorFecha(fecha);
        set({ rankingFecha: res.data, loading: false });
         return res.data; // ✅ Ahora devuelve los datos para usar en el componente
         } catch (error) {
        set({ error: "Error al obtener ranking por fecha", loading: false });
         return []; // ⛑️ Devuelve array vacío en caso de error
      }
    },

    getUsersWithPuntaje: async () => {
      try {
        const { data } = await obtenerUsuariosConPuntaje();
        set({ rankingGeneral: data });
      } catch (error) {
        console.error("Error al obtener usuarios con puntaje", error);
      }
    },

    getAllUsers: async () => {
      try {
        set({ loading: true, error: null });
        const response = await fetchUsers();
        set({ usuarios: response.data, loading: false });
      } catch (error) {
        set({ error: "Error al obtener usuarios", loading: false });
      }
    },

    getResumenUsuario: async (userId, fecha) => {
      try {
        set({ loading: true, error: null });
        const { data } = await obtenerResumenDeUsuario(userId, fecha);
        set({
          resumenUsuario: data.usuario,
          rankingFecha: data.rankingFecha,
          rankingGeneral: data.rankingGeneral,
          loading: false,
        });
      } catch (error) {
        set({ error: "Error al obtener el resumen del usuario", loading: false });
        console.error(error);
      }
    },

  /*----------------------------- MODO DE JUEGO FAVORITO -----------------------------*/  
  seleccionarEquipoFavorito: async (equipo) => {
  try {
    set({ loading: true, error: null });

    const res = await seleccionarEquipoFavorito(equipo);
    const { equipoFavorito, message } = res.data;

    
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...currentUser, equipoFavorito };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    set({
      equipoFavorito,
      user: updatedUser,
      mensaje: message,
      loading: false
    });
  } catch (error) {
    console.error("Error al seleccionar equipo favorito:", error);
    set({
      error: error.response?.data?.message || "Error al guardar equipo favorito.",
      loading: false
    });
  }
},

getRankingPorFechaFavoritos: async (fecha) => {
      try {
        set({ loading: true, error: null });
        const res = await obtenerRankingPorFechaFavoritos(fecha);
        set({ rankingsFavoritos: res.data, loading: false });
         return res.data;
         } catch (error) {
        set({ error: "Error al obtener ranking por fecha", loading: false });
         return [];
      }
    },
  };
});

export default useUserStore;
