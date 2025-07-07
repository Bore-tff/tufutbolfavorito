import { Router } from "express";
import {
  login,
  registro,
  logout,
  getUsersFavorito,
  obtenerUsuariosConPuntajeFavorito,
  obtenerRankingPorFechaFavorito,
  obtenerPuntajeDeUsuarioPorFechaFavorito,
  obtenerResumenDeUsuarioFavorito,
  seleccionarEquipoFavorito
} from "../controllers/user2.controller.js";
import verificarAuth from "../middlewares/verificarAuth.js";

const router = Router();

// Autenticación
router.post("/registro", registro);
router.post("/login", login);
router.post("/logout", logout);
router.post("/usuarios/equipo-favorito", verificarAuth, seleccionarEquipoFavorito);

// Usuarios
router.get("/", getUsersFavorito);

// 1. 🔢 Ranking general
router.get("/puntaje", obtenerUsuariosConPuntajeFavorito);

// 2. 📅 Ranking por fecha
// Ejemplo: /usuarios/puntaje/fecha/2
router.get("/puntaje/fecha/:fecha", async (req, res) => {
  const { fecha } = req.params;
  try {
    const ranking = await obtenerRankingPorFechaFavorito(Number(fecha));
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ranking por fecha", error });
  }
});

// 3. 🙋 Puntaje de un usuario en una fecha
// Ejemplo: /usuarios/puntaje/usuario/5/fecha/2
router.get("/puntaje/usuario/:id/fecha/:fecha", async (req, res) => {
  const { id, fecha } = req.params;
  try {
    const puntaje = await obtenerPuntajeDeUsuarioPorFechaFavorito(Number(id), Number(fecha));
    res.json(puntaje);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener puntaje del usuario", error });
  }
});

router.get("/resumen/:id/fecha/:fecha", obtenerResumenDeUsuarioFavorito);

export default router;
