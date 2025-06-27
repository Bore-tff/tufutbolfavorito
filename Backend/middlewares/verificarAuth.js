import jwt from "jsonwebtoken";

const verificarAuth = (req, res, next) => {
  // Obtener el token del encabezado Authorization
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener token después de 'Bearer'
  
  // Si no hay token, respondemos con un error
  if (!token) {
    return res.status(401).json({ message: "No autorizado. Token no proporcionado." });
  }

  // Verificar el token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token no válido." });
    }
    
    // Si el token es válido, agregamos la información del usuario a req.user
    req.user = user;
    next(); // Pasamos el control al siguiente middleware o ruta
  });
};

export default verificarAuth;