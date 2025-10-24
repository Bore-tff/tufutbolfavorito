import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // ← este formato es importante
  }
  return config;
});

export const getMatches = () => API.get('/matches');

// Guardar pronóstico
export const guardarTodosLosPronosticos = async (predictionsArray) => {
  const response = await API.post("/guardar-todos", {
    pronosticos: predictionsArray,
  });
  return response.data;
};

export const getPronosticosByFecha = (fecha) => API.get(`/pronosticos?fecha=${fecha}`);

export const getPronosticosFavoritosByFecha = (fecha) => API.get(`/pronosticos-favoritos?fecha=${fecha}`);

export const getPronosticosFavoritosGoleadorByFecha = (fecha) => API.get(`/pronosticos-favoritos-goleador?fecha=${fecha}`);

export const guardarTodosLosPronosticosFavoritos = async (predictionsArray) => {
  const response = await API.post("/guardar-todos-favoritos", {
    pronosticos: predictionsArray,
  });
  return response.data;
};

export const guardarTodosLosPronosticosFavoritosGoleador = async (predictionsArray) => {
  const response = await API.post("/guardar-todos-favoritos-goleador", {
    pronosticos: predictionsArray,
  });
  return response.data;
};

export const actualizarTodosLosPronosticos = async () => {
  const response = await API.post("/calcular-puntajes");
  return response.data;
};

export const actualizarTodosLosPronosticosFavoritos = async () => {
  const response = await API.post("/calcular-puntajes-favoritos");
  return response.data;
};

export const actualizarTodosLosPronosticosFavoritosGoleador = async () => {
  const response = await API.post("/calcular-puntajes-favoritos-goleador");
  return response.data;
};
