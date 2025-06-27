import { create } from "zustand";
import {
  registerRequest,
  fetchUsers,
  obtenerUsuariosConPuntaje,
  obtenerResumenDeUsuario,
  obtenerRankingPorFecha,
} from "../api/auth";

const useUserStore = create((set) => {
  const storedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  return {
    user: storedUser,
    rankingFecha: [],
    rankingGeneral: [],
    resumenUsuario: null,
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
          set({ user: data.user, loading: false });
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

    register: async (user, password) => {
      set({ loading: true, error: null });
      try {
        const response = await registerRequest({ user, password });
        set({ user: response.data, loading: false });
      } catch (error) {
        set({ error: "Error en el registro", loading: false });
      }
    },

    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({
        user: null,
        resumenUsuario: null,
        rankingFecha: [],
        rankingGeneral: [],
        error: null,
        loading: false,
      });
    },

    getRankingPorFecha: async (fecha) => {
      try {
        set({ loading: true, error: null });
        const res = await obtenerRankingPorFecha(fecha);
        set({ rankingFecha: res.data, loading: false });
      } catch (error) {
        set({ error: "Error al obtener ranking por fecha", loading: false });
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
          loading: false,
        });
      } catch (error) {
        set({ error: "Error al obtener el resumen del usuario", loading: false });
        console.error(error);
      }
    },
  };
});

export default useUserStore;
