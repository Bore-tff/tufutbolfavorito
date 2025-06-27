import {create} from 'zustand';
import { getMatches, guardarTodosLosPronosticos } from '../api/pronosticos';

const usePronosticoStore = create((set) => ({
  matches: [],
  pronosticos: [],
  resultadoComparacion: null,
  loading: false,
  error: null,
  successMessage: null,
  puntosObtenidos: null,

  setUserId: (id) => set({ userId: id }),
  
  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getMatches();
      console.log("getMatches data:", data);
      set((state) => ({ ...state, matches: data.data, loading: false }));
    } catch (error) {
      set({ error: error.message || "Error al obtener los partidos", loading: false });
    }
  },

  guardarPronosticos: async (predictionData) => {
    set({ loading: true, error: null });
    try {
      const response = await guardarTodosLosPronosticos(predictionData);
      if (response?.data) {
        set((state) => ({
          pronosticos: [...state.pronosticos, response.data],
          loading: false,
          successMessage: "Pronóstico guardado correctamente",
          puntosObtenidos: response.data.puntos, // 👈 Guardamos los puntos
        }));
      }
    } catch (error) {
      set({
        error: error.message || "Error al guardar el pronóstico",
        loading: false,
        puntosObtenidos: null,
      });
    }
  },
}));

export default usePronosticoStore;