import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/user.model.js";
import Pronostico from "../models/predictions.model.js";
import PronosticoFavorito from "../models/predictionsFavoritos.model.js";
import Partido from '../models/partido.model.js';
import { fn, col, literal } from 'sequelize';

export const registro = async (req, res) => {
  const { user, password, nombre, apellido, email } = req.body;
  try {
    const nuevoUsuario = await User.create({ user, password, nombre, apellido, email });
    return res.status(201).json({ message: "Usuario registrado", usuario: nuevoUsuario });
  } catch (error) {
    return res.status(500).json({ message: "Error al registrar usuario", error });
  }
};

export const login = async (req, res) => {
  const { user, password } = req.body;
  try {
    const usuario = await User.findOne({ where: { user } });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign({ id: usuario.id, user: usuario.user }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const totalPuntos = await Pronostico.sum("puntos", {
      where: { userId: usuario.id },
    });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: usuario.id,
        nombre: usuario.user,
        equipoFavorito: usuario.equipoFavorito,
        puntos: totalPuntos || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor", error });
  }
};

export const logout = (req, res) => {
  try {
    if (req.session) {
      req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Error al cerrar sesión" });
        res.clearCookie("connect.sid");
        return res.status(200).json({ message: "Sesión cerrada correctamente" });
      });
    } else {
      return res.status(200).json({ message: "Cierre de sesión exitoso" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

/*----------------------------- MODO DE JUEGO NORMAL -----------------------------*/
export const getUsers = async (req, res) => {
  try {
    const usuariosConPuntaje = await obtenerUsuariosConPuntaje();
    const usuariosConPuntajeFavoritos = await obtenerUsuariosConPuntajeFavoritos();

    res.json({
      usuariosConPuntaje,
      usuariosConPuntajeFavoritos
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios con puntaje", error });
  }
};

export const obtenerUsuariosConPuntaje = async () => {
  try {
    const usuarios = await User.findAll({
  attributes: [
    'id',
    'user',
    'equipoFavorito',
    [fn('SUM', col('Pronosticos.puntos')), 'totalPuntos'],
    [fn('SUM', col('Pronosticos.golesAcertados')), 'golesAcertados'],
    [fn('SUM', literal('Pronosticos.puntos + Pronosticos.golesAcertados')), 'sumaTotal']
  ],
  include: [{ model: Pronostico, attributes: [] }],
  group: ['Usuario.id'],
  raw: true,
});

return usuarios.map(usuario => ({
  id: usuario.id,
  user: usuario.user,
  equipoFavorito: usuario.equipoFavorito,
  puntos: Number(usuario.totalPuntos) || 0,
  goles: Number(usuario.golesAcertados) || 0,
  sumaTotal: Number(usuario.sumaTotal) || 0,
}));
  } catch (error) {
    console.error('Error al obtener los usuarios con puntaje:', error);
    throw new Error('No se pudieron obtener los usuarios con puntaje');
  }
};

export const obtenerRankingPorFecha = async (numeroFecha) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: [
        'id',
        'user',
        [fn('SUM', literal(`CASE WHEN \`Pronosticos->Partido\`.\`fecha\` = ${numeroFecha} THEN \`Pronosticos\`.\`puntos\` ELSE 0 END`)), 'puntosFecha'],
        [fn('SUM', literal(`CASE WHEN \`Pronosticos->Partido\`.\`fecha\` = ${numeroFecha} THEN \`Pronosticos\`.\`golesAcertados\` ELSE 0 END`)), 'golesFecha'],
        [fn('SUM', col('Pronosticos.puntos')), 'puntajeTotal'],
        [fn('SUM', col('Pronosticos.golesAcertados')), 'golesTotales'],
        [fn('SUM', literal('Pronosticos.puntos + Pronosticos.golesAcertados')), 'sumaTotal']
      ],
      include: [
        {
          model: Pronostico,
          attributes: [],
          include: [
            {
              model: Partido,
              attributes: []
            }
          ]
        }
      ],
      group: ['Usuario.id'],
      raw: true,
    });

    return usuarios.map(usuario => ({
      id: usuario.id,
      user: usuario.user,
      puntos: Number(usuario.puntosFecha) || 0,
      puntajeTotal: Number(usuario.puntajeTotal) || 0,
      golesFecha: Number(usuario.golesFecha) || 0,
      golesTotales: Number(usuario.golesTotales) || 0,
      sumaTotal: Number(usuario.sumaTotal) || 0,
    }));
  } catch (error) {
    console.error('Error al obtener ranking por fecha:', error);
    throw new Error('No se pudo obtener el ranking por fecha');
  }
};

export const obtenerPuntajeDeUsuarioPorFecha = async (userId, numeroFecha) => {
  try {
    const usuario = await User.findOne({
      where: { id: userId },
      attributes: [
        'id',
        'user',
        [fn('SUM', literal(`CASE WHEN partidos.fecha = ${numeroFecha} THEN pronosticos.puntos ELSE 0 END`)), 'puntosFecha'],
        [fn('SUM', literal(`CASE WHEN partidos.fecha = ${numeroFecha} THEN pronosticos.golesAcertados ELSE 0 END`)), 'golesFecha']
      ],
      include: [
        {
          model: Pronostico,
          attributes: [],
          include: [
            {
              model: Partido,
              attributes: []
            }
          ]
        }
      ],
      group: ['Usuario.id'],
      raw: true,
    });

    return {
      id: usuario?.id ?? userId,
      user: usuario?.user ?? 'Desconocido',
      puntos: Number(usuario?.puntosFecha) || 0,
      goles: Number(usuario?.golesFecha) || 0
    };
  } catch (error) {
    console.error('Error al obtener puntaje del usuario en la fecha:', error);
    throw new Error('No se pudo obtener el puntaje del usuario en la fecha');
  }
};

export const obtenerResumenDeUsuario = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const numeroFecha = parseInt(req.params.fecha, 10);

  if (isNaN(userId) || isNaN(numeroFecha)) {
    return res.status(400).json({ message: "Parámetros inválidos" });
  }

  try {
    const [puntajeTotal, puntajeFecha, rankingFecha] = await Promise.all([
      obtenerUsuariosConPuntaje(),
      obtenerPuntajeDeUsuarioPorFecha(userId, numeroFecha),
      obtenerRankingPorFecha(numeroFecha),
    ]);

    const usuarioTotal = puntajeTotal.find(u => u.id === userId);

    return res.json({
      usuario: {
        id: userId,
        user: usuarioTotal?.user || puntajeFecha.user,
        puntajeTotal: usuarioTotal?.puntos || 0,
        puntajeFecha: puntajeFecha.puntos || 0,
        golesTotales: usuarioTotal?.goles || 0,
        golesFecha: puntajeFecha.goles || 0,
        sumaTotal: (usuarioTotal?.puntos || 0) + (usuarioTotal?.goles || 0), // ✅ Acá calculás la suma total
      },
      rankingFecha,
    });
  } catch (error) {
    console.error("Error al obtener el resumen:", error);
    res.status(500).json({ message: "Error al obtener el resumen", error });
  }
};

/*----------------------------- MODO DE JUEGO FAVORITO -----------------------------*/

export const seleccionarEquipoFavorito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { equipoFavorito } = req.body;

    if (!equipoFavorito) return res.status(400).json({ message: "Debe elegir un equipo favorito." });

    const usuario = await Usuario.findByPk(userId);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    if (usuario.equipoFavorito) return res.status(400).json({ message: "Ya seleccionaste un equipo favorito y no se puede cambiar." });

    usuario.equipoFavorito = equipoFavorito;
    await usuario.save();

    res.status(200).json({ message: "Equipo favorito guardado correctamente.", equipoFavorito });
  } catch (error) {
    console.error("Error al guardar equipo favorito:", error);
    res.status(500).json({ message: "Error al guardar equipo favorito." });
  }
};

export const obtenerUsuariosConPuntajeFavoritos = async () => {
  try {
    const usuarios = await User.findAll({
      attributes: [
        'id',
        'user',
        'equipoFavorito',
        [fn('SUM', col('PronosticoFavoritos.puntos')), 'totalPuntos'],
        [fn('SUM', col('PronosticoFavoritos.golesAcertados')), 'golesAcertados'],
        [fn('SUM', col('PronosticoFavoritos.golesAcertados')), 'golesTotales']
      ],
      include: [
        {
          model: PronosticoFavorito,
          attributes: [],
        },
      ],
      group: ['Usuario.id'],
      raw: true,
    });

    return usuarios.map(usuario => ({
      id: usuario.id,
      user: usuario.user,
      equipoFavorito: usuario.equipoFavorito,
      puntos: Number(usuario.totalPuntos) || 0,
      goles: Number(usuario.golesAcertados) || 0,
      golesTotales: Number(usuario.golesTotales) || 0,
      sumaTotal: (Number(usuario.totalPuntos) || 0) + (Number(usuario.golesTotales) || 0),
    }));
  } catch (error) {
    console.error('Error al obtener los usuarios con puntaje:', error);
    throw new Error('No se pudieron obtener los usuarios con puntaje');
  }
};

export const obtenerRankingPorFechaFavoritos = async (numeroFecha) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: [
        'id',
        'user',
        [fn('SUM', literal(`CASE WHEN \`PronosticoFavoritos->Partido\`.\`fecha\` = ${numeroFecha} THEN \`PronosticoFavoritos\`.\`puntos\` ELSE 0 END`)), 'puntosFecha'],
        [fn('SUM', literal(`CASE WHEN \`PronosticoFavoritos->Partido\`.\`fecha\` = ${numeroFecha} THEN \`PronosticoFavoritos\`.\`golesAcertados\` ELSE 0 END`)), 'golesFecha'],
        [fn('SUM', col('PronosticoFavoritos.puntos')), 'puntajeTotal'],
        [fn('SUM', col('PronosticoFavoritos.golesAcertados')), 'golesTotales'],
      ],
      include: [
        {
          model: PronosticoFavorito,
          as: "PronosticoFavoritos", // este alias lo definís en la relación
          attributes: [],
          include: [
            {
              model: Partido,
              attributes: []
            }
          ]
        }
      ],
      group: ['Usuario.id'],
      raw: true,
    });

    return usuarios.map(usuario => ({
      id: usuario.id,
      user: usuario.user,
      puntos: Number(usuario.puntosFecha) || 0,
      puntajeTotal: Number(usuario.puntajeTotal) || 0,
      golesFecha: Number(usuario.golesFecha) || 0,
      golesTotales: Number(usuario.golesTotales) || 0
    }));
  } catch (error) {
    console.error('Error al obtener ranking de favoritos por fecha:', error);
    throw new Error('No se pudo obtener el ranking de favoritos por fecha');
  }
};

export const obtenerPuntajeDeUsuarioPorFechaFavoritos = async (userId, numeroFecha) => {
  try {
    const usuario = await User.findOne({
      where: { id: userId },
      attributes: [
        'id',
        'user',
        [fn('SUM', literal(`CASE WHEN \`PronosticoFavoritos->Partido\`.\`fecha\` = ${numeroFecha} THEN \`PronosticoFavoritos\`.\`puntos\` ELSE 0 END`)), 'puntosFecha'],
        [fn('SUM', literal(`CASE WHEN \`PronosticoFavoritos->Partido\`.\`fecha\` = ${numeroFecha} THEN \`PronosticoFavoritos\`.\`golesAcertados\` ELSE 0 END`)), 'golesFecha']

      ],
      include: [
        {
          model: PronosticoFavorito,
          attributes: [],
          include: [
            {
              model: Partido,
              attributes: []
            }
          ]
        }
      ],
      group: ['Usuario.id'],
      raw: true,
    });

    return {
      id: usuario?.id ?? userId,
      user: usuario?.user ?? 'Desconocido',
      puntos: Number(usuario?.puntosFecha) || 0,
      goles: Number(usuario?.golesFecha) || 0
    };
  } catch (error) {
    console.error('Error al obtener puntaje del usuario en la fecha:', error);
    throw new Error('No se pudo obtener el puntaje del usuario en la fecha');
  }
};

export const obtenerResumenDeUsuarioFavoritos = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const numeroFecha = parseInt(req.params.fecha, 10);

  if (isNaN(userId) || isNaN(numeroFecha)) {
    return res.status(400).json({ message: "Parámetros inválidos" });
  }

  try {
    const [puntajeTotal, puntajeFecha, rankingFecha] = await Promise.all([
      obtenerUsuariosConPuntajeFavoritos(),
      obtenerPuntajeDeUsuarioPorFechaFavoritos(userId, numeroFecha),
      obtenerRankingPorFechaFavoritos(numeroFecha),
    ]);

    const usuarioTotal = puntajeTotal.find(u => u.id === userId);

    return res.json({
      usuario: {
        id: userId,
        user: usuarioTotal?.user || puntajeFecha.user,
        puntajeTotal: usuarioTotal?.puntos || 0,
        puntajeFecha: puntajeFecha.puntos || 0,
        golesTotales: usuarioTotal?.goles || 0,
        golesFecha: puntajeFecha.goles || 0,
      },
      rankingFecha,
    });
  } catch (error) {
    console.error("Error al obtener el resumen:", error);
    res.status(500).json({ message: "Error al obtener el resumen", error });
  }
};
