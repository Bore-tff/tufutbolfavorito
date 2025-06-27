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
