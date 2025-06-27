import { Router } from "express";
import {
  login,
  registro,
  logout,
  getUsers,
  obtenerUsuariosConPuntaje,
  obtenerRankingPorFecha,
  obtenerPuntajeDeUsuarioPorFecha,
  obtenerResumenDeUsuario
} from "../controllers/user.controllers.js";

const router = Router();

// Autenticación
router.post("/registro", registro);
router.post("/login", login);
router.post("/logout", logout);

// Usuarios
router.get("/", getUsers);

// 1. 🔢 Ranking general
router.get("/puntaje", obtenerUsuariosConPuntaje);

// 2. 📅 Ranking por fecha
// Ejemplo: /usuarios/puntaje/fecha/2
router.get("/puntaje/fecha/:fecha", async (req, res) => {
  const { fecha } = req.params;
  try {
    const ranking = await obtenerRankingPorFecha(Number(fecha));
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
    const puntaje = await obtenerPuntajeDeUsuarioPorFecha(Number(id), Number(fecha));
    res.json(puntaje);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener puntaje del usuario", error });
  }
});

router.get("/resumen/:id/fecha/:fecha", obtenerResumenDeUsuario);

export default router;
