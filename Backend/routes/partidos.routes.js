import express from "express";
import { sincronizarPartidos } from "../controllers/partidos.js";

const router = express.Router();

router.post("/sync", sincronizarPartidos);

export default router;
