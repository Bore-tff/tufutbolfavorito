import { TOKEN_SECRET } from "../config.js";
import jwt from "jsonwebtoken";

// Token de acceso para autenticación
export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
      { expiresIn: "1d" }, // Expira en 1 día
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}

// Token de confirmación para email
export function createConfirmationToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
      { expiresIn: "24h" }, // Expira en 24 horas
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}