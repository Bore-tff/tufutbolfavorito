import {create} from 'zustand';
import { getMatches, guardarTodosLosPronosticos, actualizarTodosLosPronosticos, getPronosticosByFecha, actualizarTodosLosPronosticosFavoritos, guardarTodosLosPronosticosFavoritos, guardarTodosLosPronosticosFavoritosGoleador, actualizarTodosLosPronosticosFavoritosGoleador, getPronosticosFavoritosByFecha, getPronosticosFavoritosGoleadorByFecha } from '../api/pronosticos';

const usePronosticoStore = create((set) => ({
  matches: [],
  pronosticos: [],
  resultadoComparacion: null,
  loading: false,
  error: null,
  successMessage: null,
  successMessageFavorito: null,
  successMessageGoleador: null,
  puntosObtenidos: null,

  setUserId: (id) => set({ userId: id }),

   /*----------------------------- MODO DE JUEGO NORMAL -----------------------------*/  
  
  fetchMatches: async () => {
  set({ loading: true, error: null });
  try {
    const data = await getMatches();
    
    set((state) => ({ ...state, matches: data.data, loading: false }));

    // 🔁 Llama para recalcular puntos si ahora hay resultados disponibles
    await actualizarTodosLosPronosticos();
  } catch (error) {
    set({ error: error.message || "Error al obtener los partidos", loading: false });
  }
},

fetchPronosticosByFecha: async (fecha) => {
  set({ loading: true, error: null });
  try {
    const res = await getPronosticosByFecha(fecha);
    const pronos = {};
    res.data.forEach(({ matchId, homeScore, awayScore }) => {
      pronos[matchId] = { home: homeScore, away: awayScore };
    });
    set({ pronosticos: pronos, loading: false });
  } catch (error) {
    set({ error: error.message || "Error al cargar pronósticos", loading: false });
  }
},

guardarPronosticos: async (predictionData) => {
  set({ loading: true, error: null, successMessage: null });
  try {
    // Aquí guardás directamente los datos (array de pronósticos) que devuelve la API
    const nuevosPronosticos = await guardarTodosLosPronosticos(predictionData);

    if (nuevosPronosticos) {
      set((state) => ({
        pronosticos: [...state.pronosticos, ...nuevosPronosticos],
        loading: false,
        successMessage: "Pronóstico guardado correctamente",
      }));
      return true; // Indica éxito
    }
    set({ loading: false });
    return false;
  } catch (error) {
    set({
      error: error.message || "Error al guardar el pronóstico",
      loading: false,
    });
    return false;
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

/*----------------------------- MODO DE JUEGO FAVORITO -----------------------------*/  
fetchMatchesFavorito: async () => {
  set({ loading: true, error: null });
  try {
    const data = await getMatches();
    
    set((state) => ({ ...state, matches: data.data, loading: false }));

    // 🔁 Llama para recalcular puntos si ahora hay resultados disponibles
    await actualizarTodosLosPronosticosFavoritos();
  } catch (error) {
    set({ error: error.message || "Error al obtener los partidos", loading: false });
  }
},

fetchPronosticosFavoritosByFecha: async (fecha) => {
  set({ loading: true, error: null });
  try {
    const res = await getPronosticosFavoritosByFecha(fecha);
    const pronos = {};
    res.data.forEach(({ matchId, homeScore, awayScore }) => {
      pronos[matchId] = { home: homeScore, away: awayScore };
    });
    set({ pronosticos: pronos, loading: false });
  } catch (error) {
    set({ error: error.message || "Error al cargar pronósticos", loading: false });
  }
},

fetchPronosticosFavoritosGoleadorByFecha: async (fecha) => {
  set({ loading: true, error: null });
  try {
    const res = await getPronosticosFavoritosGoleadorByFecha(fecha);
    const pronos = {};

    // cada partido tiene un golesAcertados asociado
    res.data.forEach(({ matchId, golesAcertados }) => {
      pronos[matchId] = { golesAcertados };
    });

    set({ pronosticosGoleador: pronos, loading: false });
  } catch (error) {
    set({
      error: error.message || "Error al cargar pronósticos goleadores",
      loading: false,
    });
  }
},

guardarPronosticosFavorito: async (predictionData) => {
  set({ loading: true, error: null, successMessageFavorito: null });
  try {
    const nuevosPronosticos = await guardarTodosLosPronosticosFavoritos(predictionData);

    if (nuevosPronosticos) {
      set((state) => ({
        pronosticos: [...state.pronosticos, ...nuevosPronosticos],
        loading: false,
        successMessageFavorito: "Pronóstico guardado correctamente",
      }));
      return true; // Indica éxito
    }
    set({ loading: false });
    return false;
  } catch (error) {
    set({
      error: error.message || "Error al guardar el pronóstico",
      loading: false,
    });
    return false;
  }
},

guardarPronosticosFavoritoGoleador: async (predictionData) => {
  set({ loading: true, error: null, successMessageGoleador: null });
  try {
    // Aquí guardás directamente los datos (array de pronósticos) que devuelve la API
    const nuevosPronosticos = await guardarTodosLosPronosticosFavoritosGoleador(predictionData);

    if (nuevosPronosticos) {
      set((state) => ({
        pronosticos: [...state.pronosticos, ...nuevosPronosticos],
        loading: false,
        successMessageGoleador: "Pronóstico guardado correctamente",
      }));
      return true; // Indica éxito
    }
    set({ loading: false });
    return false;
  } catch (error) {
    set({
      error: error.message || "Error al guardar el pronóstico",
      loading: false,
    });
    return false;
  }
},

actualizarPronosticosFavorito: async () => {
  set({ loading: true, error: null, successMessageFavorito: null });
  try {
    const response = await actualizarTodosLosPronosticosFavoritos(); // no necesita datos
    set({
      loading: false,
      successMessageFavorito: response.message || "Puntajes actualizados correctamente",
    });
  } catch (error) {
    set({
      error: error.message || "Error al actualizar puntajes",
      loading: false,
    });
  }
},

actualizarPronosticosFavoritoGoleador: async () => {
  set({ loading: true, error: null, successMessageGoleador: null });
  try {
    const response = await actualizarTodosLosPronosticosFavoritosGoleador(); // no necesita datos
    set({
      loading: false,
      successMessageGoleador: response.message || "Puntajes actualizados correctamente",
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