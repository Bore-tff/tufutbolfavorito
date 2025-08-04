import { Router } from "express";
import {
  login,
  registro,
  logout,
  getUsers,
  obtenerUsuariosConPuntaje,
  obtenerRankingPorFecha,
  obtenerPuntajeDeUsuarioPorFecha,
  obtenerResumenDeUsuario,
  seleccionarEquipoFavorito,
  obtenerUsuariosConPuntajeFavoritos,
  obtenerRankingPorFechaFavoritos,
  obtenerPuntajeDeUsuarioPorFechaFavoritos,
  obtenerResumenDeUsuarioFavoritos,
  seleccionarEquipoFavoritoGoleador,
  obtenerUsuariosConPuntajeFavoritosGoleador,
  obtenerRankingPorFechaFavoritosGoleador,
  obtenerPuntajeDeUsuarioPorFechaFavoritosGoleador,
  obtenerResumenDeUsuarioFavoritosGoleador
} from "../controllers/user.controllers.js";
import verificarAuth from "../middlewares/verificarAuth.js";

const router = Router();

// Autenticación
router.post("/registro", registro);
router.post("/login", login);
router.post("/logout", logout);
router.post("/usuarios/equipo-favorito", verificarAuth, seleccionarEquipoFavorito);
router.post("/usuarios/equipo-favorito-goleador", verificarAuth, seleccionarEquipoFavoritoGoleador);

// Usuarios
router.get("/", getUsers);

// 1. 🔢 Ranking general
router.get("/puntaje", obtenerUsuariosConPuntaje);
router.get("/puntaje-favorito", obtenerUsuariosConPuntajeFavoritos);
router.get("/puntaje-favorito-goleador", obtenerUsuariosConPuntajeFavoritosGoleador);

// 2. 📅 Ranking por fecha
router.get("/puntaje/fecha/:fecha", async (req, res) => {
  const { fecha } = req.params;
  try {
    const ranking = await obtenerRankingPorFecha(Number(fecha));
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ranking por fecha", error });
  }
});

router.get("/puntaje-favorito/fecha/:fecha", async (req, res) => {
  const { fecha } = req.params;
  try {
    const ranking = await obtenerRankingPorFechaFavoritos(Number(fecha));
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ranking por fecha", error });
  }
});

router.get("/puntaje-favorito-goleador/fecha/:fecha", async (req, res) => {
  const { fecha } = req.params;
  try {
    const ranking = await obtenerRankingPorFechaFavoritosGoleador(Number(fecha));
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ranking por fecha", error });
  }
});

// 3. 🙋 Puntaje de un usuario en una fecha
router.get("/puntaje/usuario/:id/fecha/:fecha", async (req, res) => {
  const { id, fecha } = req.params;
  try {
    const puntaje = await obtenerPuntajeDeUsuarioPorFecha(Number(id), Number(fecha));
    res.json(puntaje);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener puntaje del usuario", error });
  }
});

router.get("/puntaje-favorito/usuario/:id/fecha/:fecha", async (req, res) => {
  const { id, fecha } = req.params;
  try {
    const puntaje = await obtenerPuntajeDeUsuarioPorFechaFavoritos(Number(id), Number(fecha));
    res.json(puntaje);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener puntaje del usuario", error });
  }
});

router.get("/puntaje-favorito-goleador/usuario/:id/fecha/:fecha", async (req, res) => {
  const { id, fecha } = req.params;
  try {
    const puntaje = await obtenerPuntajeDeUsuarioPorFechaFavoritosGoleador(Number(id), Number(fecha));
    res.json(puntaje);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener puntaje del usuario", error });
  }
});

router.get("/resumen/:id/fecha/:fecha", obtenerResumenDeUsuario);
router.get("/resumen-favorito/:id/fecha/:fecha", obtenerResumenDeUsuarioFavoritos);
router.get("/resumen-favorito-goleador/:id/fecha/:fecha", obtenerResumenDeUsuarioFavoritosGoleador);

export default router;
