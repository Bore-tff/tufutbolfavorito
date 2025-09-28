import { create } from "zustand";
import {
  registerRequest,
  fetchUsers,
  obtenerUsuariosConPuntaje,
  obtenerResumenDeUsuario,
  obtenerRankingPorFecha,
  seleccionarEquipoFavorito,
  seleccionarEquipoFavoritoGoleador,
  obtenerRankingPorFechaFavoritos,
  obtenerRankingPorFechaFavoritosGoleador
} from "../api/auth";

const useUserStore = create((set) => {
  const storedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null; 

  return {
    user: storedUser,
    rankingFecha: [],
    rankingsFavoritos: [],
    rankingsFavoritosGoleador:[],
    rankingGeneral: [],
    resumenUsuario: null,
    equipoFavorito: storedUser?.equipoFavorito || null,
    equipoFavoritoGoleador: storedUser?.equipoFavoritoGoleador || null,
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
          set({ user: data.user, equipoFavorito: data.user.equipoFavorito, equipoFavoritoGoleador: data.user.equipoFavoritoGoleador || null, loading: false });
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

    register: async ({ user, password, email }) => {
        set({ loading: true, error: null });
        try {
          const response = await registerRequest({ user, password, email });
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
        equipoFavoritoGoleador: null,
        resumenUsuario: null,
        rankingFecha: [],
        rankingsFavoritosGoleador: [],
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
    const nuevosUsuarios = res.data;

    set((state) => {
      // eliminamos la fecha que se actualiza si existía
      const otrasFechas = state.rankingFecha.filter(r => r.fecha !== fecha);
      // agregamos la nueva fecha
      return { rankingFecha: [...otrasFechas, ...nuevosUsuarios], loading: false };
    });

    return nuevosUsuarios; // ✅ Devuelve los datos para usar en el componente
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
  actualizarEquipoFavorito: async (tipo, equipo) => {
      try {
        set({ loading: true, error: null });

        let res;
        if (tipo === "campeon") {
          res = await seleccionarEquipoFavorito(equipo);
        } else if (tipo === "goleador") {
          res = await seleccionarEquipoFavoritoGoleador(equipo);
        } else {
          throw new Error("Tipo de equipo no válido");
        }

        const data = res.data;
        const currentUser = JSON.parse(localStorage.getItem("user")) || {};

        const updatedUser = {
          ...currentUser,
          ...(tipo === "campeon" && { equipoFavorito: data.equipoFavorito }),
          ...(tipo === "goleador" && { equipoFavoritoGoleador: data.equipoFavoritoGoleador }),
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        set({
          user: updatedUser,
          equipoFavorito: updatedUser.equipoFavorito,
          equipoFavoritoGoleador: updatedUser.equipoFavoritoGoleador,
          mensaje: data.message,
          loading: false,
        });
      } catch (error) {
        set({
          error: error?.response?.data?.message || "Error al guardar equipo favorito.",
          loading: false,
        });
      }
    },

    // GUARDAR AMBOS A LA VEZ
    guardarAmbosFavoritos: async (equipoCampeon, equipoGoleador) => {
      try {
        set({ loading: true, error: null, mensaje: null });

        const [resCampeon, resGoleador] = await Promise.all([
          seleccionarEquipoFavorito(equipoCampeon),
          seleccionarEquipoFavoritoGoleador(equipoGoleador),
        ]);

        const currentUser = JSON.parse(localStorage.getItem("user")) || {};
        const updatedUser = {
          ...currentUser,
          equipoFavorito: resCampeon.data.equipoFavorito,
          equipoFavoritoGoleador: resGoleador.data.equipoFavoritoGoleador,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        set({
          user: updatedUser,
          equipoFavorito: updatedUser.equipoFavorito,
          equipoFavoritoGoleador: updatedUser.equipoFavoritoGoleador,
          mensaje: resCampeon.data.message || resGoleador.data.message || "Equipos guardados con éxito",
          loading: false,
        });
      } catch (error) {
        set({
          error: error?.response?.data?.message || "Error al guardar equipos favoritos.",
          loading: false,
        });
      }
    },

getRankingPorFechaFavoritos: async (fecha) => {
  try {
    set({ loading: true, error: null });

    const res = await obtenerRankingPorFechaFavoritos(fecha);
    const nuevosUsuarios = res.data;

    set((state) => {
      // 🔹 eliminamos la fecha que se actualiza si ya existía
      const otrasFechas = state.rankingsFavoritos.filter(r => r.fecha !== fecha);
      // 🔹 agregamos la nueva fecha con sus usuarios
      return { 
        rankingsFavoritos: [...otrasFechas, ...nuevosUsuarios], 
        loading: false 
      };
    });

    return nuevosUsuarios; // ✅ para usar directo en componentes
  } catch (error) {
    set({ error: "Error al obtener ranking por fecha", loading: false });
    return [];
  }
},

    getRankingPorFechaFavoritosGoleador: async (fecha) => {
  try {
    set({ loading: true, error: null });

    const res = await obtenerRankingPorFechaFavoritosGoleador(fecha);
    const nuevosUsuarios = res.data;

    set((state) => {
      const otrasFechas = state.rankingsFavoritosGoleador.filter(
        (r) => r.fecha !== fecha
      );
      return {
        rankingsFavoritosGoleador: [...otrasFechas, ...nuevosUsuarios],
        loading: false,
      };
    });

    return nuevosUsuarios;
  } catch (error) {
    set({ error: "Error al obtener ranking goleador por fecha", loading: false });
    return [];
  }
}
  };

  
});

export default useUserStore;
