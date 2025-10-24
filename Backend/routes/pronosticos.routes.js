import { Router } from "express";
import { getMatches, guardarPronosticos, getPronosticosPorFecha, actualizarPuntajesPendientes } from "../controllers/pronosticos.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { recalcularPuntajesFavoritos, guardarPronosticosFavoritos, getPronosticosFavoritosPorFecha } from "../controllers/pronosticosFavoritos.js";
import { getPronosticosFavoritosGoleadorPorFecha, guardarPronosticosFavoritosGoleador, recalcularPuntajesFavoritosGoleador } from "../controllers/pronosticosFavoritosGoleador.js";

const router = Router();


router.get("/matches", authMiddleware, getMatches);
router.post("/guardar-todos", authMiddleware, guardarPronosticos);
router.post("/guardar-todos-favoritos", authMiddleware, guardarPronosticosFavoritos);
router.post("/guardar-todos-favoritos-goleador", authMiddleware, guardarPronosticosFavoritosGoleador);
router.get("/pronosticos", authMiddleware, getPronosticosPorFecha);
router.get("/pronosticos-favoritos", authMiddleware, getPronosticosFavoritosPorFecha);
router.get("/pronosticos-favoritos-goleador", authMiddleware, getPronosticosFavoritosGoleadorPorFecha);
router.post('/calcular-puntajes', authMiddleware, actualizarPuntajesPendientes);
router.post("/calcular-puntajes-favoritos", authMiddleware, recalcularPuntajesFavoritos);
router.post("/calcular-puntajes-favoritos-goleador", authMiddleware, recalcularPuntajesFavoritosGoleador);
export default router;