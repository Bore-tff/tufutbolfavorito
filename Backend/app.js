import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./routes/user.routes.js";
import pronosticosRoutes from "./routes/pronosticos.routes.js";
import partidosRoutes from "./routes/partidos.routes.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionSuccessStatus: 200,
};

  app.use(cors(corsOptions));
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(cookieParser());
  
  app.use("/api/auth", authRoutes);  
  app.use("/api/pronosticos", pronosticosRoutes);
  app.use("/api/partidos", partidosRoutes);

export default app;