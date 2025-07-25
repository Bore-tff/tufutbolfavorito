import { Router } from "express";
import { getMatches, guardarPronosticos, actualizarPuntajesPendientes } from "../controllers/pronosticos.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { recalcularPuntajesFavoritos, guardarPronosticosFavoritos } from "../controllers/pronosticosFavoritos.js";

const router = Router();


router.get("/matches", authMiddleware, getMatches);
router.post("/guardar-todos", authMiddleware, guardarPronosticos);
router.post("/guardar-todos-favoritos", authMiddleware, guardarPronosticosFavoritos);
router.post('/calcular-puntajes', authMiddleware, actualizarPuntajesPendientes);
router.post("/calcular-puntajes-favoritos", authMiddleware, recalcularPuntajesFavoritos);
export default router;