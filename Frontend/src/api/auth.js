import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api/auth',
  withCredentials: true // 👉 importante si usás cookies para autenticación
});

// Registro y login
export const registerRequest = async (user) =>
  API.post('/registro', user);

export const loginRequest = async (user) =>
  API.post('/login', user);

// Logout
export const logoutRequest = async () =>
  API.post('/logout');

export const seleccionarEquipoFavorito = async (equipoFavorito) => {
  const token = localStorage.getItem("token");

  return API.post(
    '/usuarios/equipo-favorito',
    { equipoFavorito },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};
// Obtener lista de usuarios (sin puntajes)
export const fetchUsers = () => API.get('/');

// 1.  Ranking general de usuarios
export const obtenerUsuariosConPuntaje = () => API.get('/puntaje');
export const obtenerUsuariosConPuntajeFavoritos = () => API.get('/puntaje-favorito');

// 2.  Ranking por fecha
export const obtenerRankingPorFecha = (fecha) =>
  API.get(`/puntaje/fecha/${fecha}`);

export const obtenerRankingPorFechaFavoritos = (fecha) =>
  API.get(`/puntaje-favorito/fecha/${fecha}`);

// 3.  Puntaje de un usuario en una fecha
export const obtenerPuntajeDeUsuarioPorFecha = (userId, fecha) =>
  API.get(`/puntaje/usuario/${userId}/fecha/${fecha}`);

export const obtenerPuntajeDeUsuarioPorFechaFavoritos = (userId, fecha) =>
  API.get(`/puntaje-favorito/usuario/${userId}/fecha/${fecha}`);

export const obtenerResumenDeUsuario = (userId, fecha) =>
  API.get(`/resumen/${userId}/fecha/${fecha}`);

export const obtenerResumenDeUsuarioFavoritos = (userId, fecha) =>
  API.get(`/resumen-favorito/${userId}/fecha/${fecha}`);