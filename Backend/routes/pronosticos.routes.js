import { Router } from "express";
import { getMatches, guardarPronosticos } from "../controllers/pronosticos.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();


router.get("/matches", authMiddleware, getMatches);
router.post("/guardar-todos", authMiddleware, guardarPronosticos);
export default router;