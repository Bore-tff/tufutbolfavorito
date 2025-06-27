import {create} from 'zustand';
import { getMatches, guardarTodosLosPronosticos, actualizarTodosLosPronosticos } from '../api/pronosticos';

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

    // 🔁 Llama para recalcular puntos si ahora hay resultados disponibles
    await actualizarTodosLosPronosticos();
  } catch (error) {
    set({ error: error.message || "Error al obtener los partidos", loading: false });
  }
},


 guardarPronosticos: async (predictionData) => {
  set({ loading: true, error: null, successMessage: null });
  try {
    const response = await guardarTodosLosPronosticos(predictionData);
    if (response?.data) {
      set((state) => ({
        pronosticos: [...state.pronosticos, ...response.data], // con spread para no anidar arrays
        loading: false,
        successMessage: "Pronóstico guardado correctamente",
      }));
    }
  } catch (error) {
    set({
      error: error.message || "Error al guardar el pronóstico",
      loading: false,
    });
  }
},

  actualizarPronosticos: async () => {
  set({ loading: true, error: null, successMessage: null });
  try {
    const response = await actualizarTodosLosPronosticos(); // no necesita datos
    set({
      loading: false,
      successMessage: response.message || "Puntajes actualizados correctamente",
    });
  } catch (error) {
    set({
      error: error.message || "Error al actualizar puntajes",
      loading: false,
    });
  }
},
}));

export default usePronosticoStore;