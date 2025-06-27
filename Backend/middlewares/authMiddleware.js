import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id }; // Asegurate que estás usando "id" si así lo seteás en el JWT
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido." });
    }
  };

export default authMiddleware;