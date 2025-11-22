import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/user.model.js";
import Pronostico from "../models/predictions.model.js";
import PronosticoFavorito from "../models/predictionsFavoritos.model.js";
import PronosticoFavoritoGoleador from "../models/predictionsFavoritosGoleador.model.js";
import Partido from '../models/partido.model.js';
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";
import { fn, col, literal } from 'sequelize';
import generarId from "../helpers/generarId.js";

export const registro = async (req, res) => {
  const { user, email, password } = req.body;

  if (!password) {
    return res.status(400).json({ msg: "La contraseña es obligatoria" });
  }

  try {
    // Prevenir usuarios duplicados
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({ msg: "El usuario ya está registrado" });
    }

    // Crear nuevo usuario de forma controlada
    const usuario = await Usuario.create({ user, email, password });

    // Enviar mail
    emailRegistro({
      email,
      user,
      token: usuario.token,
    });

    res.status(201).json({
      msg: "Usuario registrado exitosamente, verifica tu mail para confirmar tu cuenta",
    });
  } catch (error) {
    console.log("Error en registro:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

export const perfil = (req, res) => {
  const { user } = req;
  res.json({ user });
};

export const confirmar = async (req, res) => {
  const { token } = req.params;

  const usuarioConfirmar = await Usuario.findOne({ where: { token } }); // <- CORRECCIÓN

  if (!usuarioConfirmar) {
    const error = new Error("Token inválido");
    return res.status(404).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.token = null;
    usuarioConfirmar.confirmado = true;
    await usuarioConfirmar.save();

    res.json({ msg: "Usuario confirmado correctamente!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al confirmar usuario" });
  }
};

export const login = async (req, res) => {
  const { user, password } = req.body;
  try {
    const usuario = await User.findOne({ where: { user } });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: usuario.id, user: usuario.user },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 📌 Totales generales
    const totalGolesAcertados = await PronosticoFavoritoGoleador.sum("golesAcertados", {
      where: { userId: usuario.id },
    });

    const totalPuntos = await Pronostico.sum("puntos", {
      where: { userId: usuario.id },
    });

    // 📌 Puntos y goles por fecha
    const puntajePorFecha = await Pronostico.findAll({
      where: { userId: usuario.id },
      attributes: [
        "Partido.fecha",
        [fn("SUM", col("Pronostico.puntos")), "puntosFecha"],
        [fn("SUM", col("Pronostico.golesAcertados")), "golesFecha"],
      ],
      include: [
        {
          model: Partido,
          attributes: [],
        },
      ],
      group: ["Partido.fecha"],
      raw: true,
    });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: usuario.id,
        nombre: usuario.user,
        equipoFavorito: usuario.equipoFavorito,
        equipoFavoritoGoleador: usuario.equipoFavoritoGoleador,
        golesAcertados: totalGolesAcertados || 0,
        puntos: totalPuntos || 0,
        puntajesPorFecha: puntajePorFecha, // 👈 acá va el array [{fecha, puntosFecha, golesFecha}]
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor", error });
  }
};

export const olvidePassword = async (req, res) => {
  const { email } = req.body;

  const existeUsuario = await Usuario.findOne({ where: {email} });
  if (!existeUsuario) {
    const error = new Error("Usuario no existe!");
    return res.status(400).json({ msg: error.message });
  }

  try {
    existeUsuario.token = generarId();
    await existeUsuario.save();

    // Enviar email con las instrucciones
    emailOlvidePassword({
      email,
      user: existeUsuario.user,
      token: existeUsuario.token,
    });

    res.json({ msg: "Te hemos enviado las instrucciones a tu correo" });
  } catch (error) {
    console.log(error);
  }
};

export const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const tokenValido = await Usuario.findOne({ token });

  if (tokenValido) {
    res.json({ msg: "Token valido y el usuario existe!" });
  } else {
    const error = new Error("Token Invalido");
    return res.status(400).json({ msg: error.message });
  }
};

export const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const usuario = await Usuario.findOne({ where: {token} });
  if (!usuario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }

  try {
    usuario.token = null;
    usuario.password = password;
    await usuario.save();
    res.json({ msg: "La contraseña se modifico correctamente!" });
  } catch (error) {
    console.log(error);
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
    'equipoFavoritoGoleador',
    [fn('SUM', col('Pronosticos.puntos')), 'totalPuntos'],
    [fn('SUM', col('Pronosticos.golesAcertados')), 'golesAcertados'],
    
    [fn('SUM', literal('Pronosticos.puntos + Pronosticos.golesAcertados')), 'sumaTotal']
  ],
  include: [{ model: Pronostico, attributes: [] }],
  group: ['Usuario.id'],
  raw: true,
});

console.log(usuarios);

return usuarios.map(usuario => ({
  id: usuario.id,
  user: usuario.user,
  equipoFavorito: usuario.equipoFavorito,
  
  equipoFavoritoGoleador: usuario.equipoFavoritoGoleador,
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
      fecha: numeroFecha,
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

export const seleccionarEquipoFavoritoGoleador = async (req, res) => {
  try {
    const userId = req.user.id;
    const { equipoFavoritoGoleador } = req.body;

    if (!equipoFavoritoGoleador) return res.status(400).json({ message: "Debe elegir un equipo favorito goleador." });

    const usuario = await Usuario.findByPk(userId);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    if (usuario.equipoFavoritoGoleador) return res.status(400).json({ message: "Ya seleccionaste un equipo favorito goleador y no se puede cambiar." });

    usuario.equipoFavoritoGoleador = equipoFavoritoGoleador;
    await usuario.save();

    res.status(200).json({ message: "Equipo favorito goleador guardado correctamente.", equipoFavoritoGoleador });
  } catch (error) {
    console.error("Error al guardar equipo favorito goleador:", error);
    res.status(500).json({ message: "Error al guardar equipo favorito goleador." });
  }
};

export const obtenerUsuariosConPuntajeFavoritos = async () => {
  try {
    // Traemos los puntajes agrupados por usuario y fecha
    const usuarios = await Usuario.findAll({
      attributes: ["id", "user", "equipoFavorito"],
      include: [
        {
          model: PronosticoFavorito,
          attributes: [
            "fecha",
            [fn("SUM", col("PronosticoFavoritos.puntos")), "puntosFecha"],
          ],
        },
      ],
      group: ["Usuario.id", "PronosticoFavoritos.fecha"],
      order: [[{ model: PronosticoFavorito }, "fecha", "ASC"]],
      raw: true,
    });

    // Agrupamos por usuario y acumulamos los puntos
    const acumulados = {};

    for (const row of usuarios) {
      const { id, user, equipoFavorito, "PronosticoFavoritos.fecha": fecha, puntosFecha } = row;

      if (!acumulados[id]) {
        acumulados[id] = {
          id,
          user,
          equipoFavorito,
          historial: [], // puntos acumulados por fecha
          total: 0,
        };
      }

      // sumamos los puntos de esta fecha a lo acumulado hasta ahora
      acumulados[id].total += Number(puntosFecha) || 0;

      acumulados[id].historial.push({
        fecha,
        puntosEnFecha: Number(puntosFecha) || 0,
        puntosAcumulados: acumulados[id].total,
      });
    }

    // Devolvemos un array
    return Object.values(acumulados);
  } catch (error) {
    console.error("Error al obtener los usuarios con puntaje:", error);
    throw new Error("No se pudieron obtener los usuarios con puntaje");
  }
};

export const obtenerUsuariosConPuntajeFavoritosGoleador = async () => {
  try {
    // Traemos goles por usuario y fecha
    const usuarios = await User.findAll({
      attributes: ["id", "user", "equipoFavoritoGoleador"],
      include: [
        {
          model: PronosticoFavoritoGoleador,
          attributes: [
            "fecha",
            [fn("SUM", col("PronosticoFavoritoGoleadors.golesAcertados")), "golesFecha"]
          ],
        },
      ],
      group: ["User.id", "PronosticoFavoritoGoleadors.fecha"],
      order: [[{ model: PronosticoFavoritoGoleador }, "fecha", "ASC"]],
      raw: true,
    });

    // Armamos acumulados por usuario
    const acumulados = {};

    for (const row of usuarios) {
      const {
        id,
        user,
        equipoFavoritoGoleador,
        "PronosticoFavoritoGoleadors.fecha": fecha,
        golesFecha
      } = row;

      if (!acumulados[id]) {
        acumulados[id] = {
          id,
          user,
          equipoFavorito: equipoFavoritoGoleador,
          total: 0,
          historial: [],
        };
      }

      // acumulamos goles
      acumulados[id].total += Number(golesFecha) || 0;

      acumulados[id].historial.push({
        fecha,
        golesEnFecha: Number(golesFecha) || 0,
        golesAcumulados: acumulados[id].total,
      });
    }

    return Object.values(acumulados);
  } catch (error) {
    console.error("Error al obtener los usuarios con puntaje:", error);
    throw new Error("No se pudieron obtener los usuarios con puntaje");
  }
};

export const obtenerRankingPorFechaFavoritos = async (numeroFecha) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: [
        "id",
        "user",
        "equipoFavorito", // ✅ se trae correctamente desde el modelo Usuario
        [
          fn(
            "SUM",
            literal(`CASE 
              WHEN \`PronosticoFavoritos->Partido\`.\`fecha\` = ${numeroFecha}
              THEN \`PronosticoFavoritos\`.\`puntos\`
              ELSE 0 
            END`)
          ),
          "puntosFecha",
        ],
        [
          fn(
            "SUM",
            literal(`CASE 
              WHEN \`PronosticoFavoritos->Partido\`.\`fecha\` <= ${numeroFecha}
              THEN \`PronosticoFavoritos\`.\`puntos\`
              ELSE 0 
            END`)
          ),
          "puntajeTotal",
        ],
      ],
      include: [
        {
          model: PronosticoFavorito,
          as: "PronosticoFavoritos",
          attributes: [],
          include: [
            {
              model: Partido,
              attributes: [],
            },
          ],
        },
      ],
      group: ["Usuario.id"],
      raw: true,
    });

    return usuarios.map((usuario) => ({
      id: usuario.id,
      user: usuario.user,
      equipoFavorito: usuario.equipoFavorito, // ✅ agregado aquí
      fecha: numeroFecha,
      puntos: Number(usuario.puntosFecha) || 0, // puntos de esta fecha
      puntajeTotal: Number(usuario.puntajeTotal) || 0, // acumulado hasta la fecha
    }));
  } catch (error) {
    console.error("Error al obtener ranking de favoritos por fecha:", error);
    throw new Error("No se pudo obtener el ranking de favoritos por fecha");
  }
};

export const obtenerRankingPorFechaFavoritosGoleador = async (numeroFecha) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: [
        "id",
        "user",
        "equipoFavoritoGoleador",
        // Goles SOLO de la fecha actual
        [
          fn(
            "SUM",
            literal(`CASE 
              WHEN \`PronosticoFavoritoGoleador->Partido\`.\`fecha\` = ${numeroFecha} 
              THEN \`PronosticoFavoritoGoleador\`.\`golesAcertados\` 
              ELSE 0 
            END`)
          ),
          "golesAcertados", // 👈 usamos el mismo nombre que en el modelo
        ],

        // Goles acumulados hasta esa fecha
        [
          fn(
            "SUM",
            literal(`CASE 
              WHEN \`PronosticoFavoritoGoleador->Partido\`.\`fecha\` <= ${numeroFecha} 
              THEN \`PronosticoFavoritoGoleador\`.\`golesAcertados\` 
              ELSE 0 
            END`)
          ),
          "golesTotales",
        ],
      ],
      include: [
        {
          model: PronosticoFavoritoGoleador,
          as: "PronosticoFavoritoGoleador",
          attributes: [],
          include: [
            {
              model: Partido,
              attributes: [],
            },
          ],
        },
      ],
      group: ["Usuario.id"],
      raw: true,
    });

    return usuarios.map((usuario) => ({
      id: usuario.id,
      user: usuario.user,
      fecha: numeroFecha,
      equipoFavoritoGoleador: usuario.equipoFavoritoGoleador,
      golesAcertados: Number(usuario.golesAcertados) || 0, // 👈 mismo nombre que espera tu front
      golesTotales: Number(usuario.golesTotales) || 0,
    }));
  } catch (error) {
    console.error(
      "Error al obtener ranking de favoritos goleador por fecha:",
      error
    );
    throw new Error(
      "No se pudo obtener el ranking de favoritos goleador por fecha"
    );
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

export const obtenerPuntajeDeUsuarioPorFechaFavoritosGoleador = async (userId, numeroFecha) => {
  try {
    const usuario = await User.findOne({
      where: { id: userId },
      attributes: [
        'id',
        'user',
        [fn('SUM', literal(`CASE WHEN \`PronosticoFavoritosGoleador->Partido\`.\`fecha\` = ${numeroFecha} THEN \`PronosticoFavoritoGoleador\`.\`golesAcertados\` ELSE 0 END`)), 'golesFecha']

      ],
      include: [
        {
          model: PronosticoFavoritoGoleador,
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
      goles: Number(usuario?.golesAcertados) || 0
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
    const [usuariosConPuntaje, puntajeFecha, rankingFecha] = await Promise.all([
      obtenerUsuariosConPuntajeFavoritos(),
      obtenerPuntajeDeUsuarioPorFechaFavoritos(userId, numeroFecha),
      obtenerRankingPorFechaFavoritos(numeroFecha),
    ]);

    const usuarioTotal = usuariosConPuntaje.find(u => u.id === userId);

    // 🔹 Calcular puntos acumulados HASTA la fecha actual
    const puntosAcumuladosHastaFecha =
      usuarioTotal?.historial
        ?.filter(h => h.fecha <= numeroFecha)
        ?.reduce((acc, h) => acc + h.puntosEnFecha, 0) || 0;

    // 🔹 Calcular goles acumulados hasta la fecha (si también querés eso)
    // (Suponiendo que tu función `obtenerUsuariosConPuntajeFavoritos` también los tuviera)
    // Por ahora dejamos goles totales en 0
    const golesAcumuladosHastaFecha = usuarioTotal?.golesTotales || 0;

    return res.json({
      usuario: {
        id: userId,
        user: usuarioTotal?.user || puntajeFecha.user,
        puntajeTotal: puntosAcumuladosHastaFecha, // 🔹 acumulativo hasta la fecha
        puntajeFecha: puntajeFecha.puntos || 0,
        golesTotales: golesAcumuladosHastaFecha,
        golesFecha: puntajeFecha.goles || 0,
      },
      rankingFecha,
    });
  } catch (error) {
    console.error("Error al obtener el resumen:", error);
    res.status(500).json({ message: "Error al obtener el resumen", error });
  }
};

export const obtenerResumenDeUsuarioFavoritosGoleador = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const numeroFecha = parseInt(req.params.fecha, 10);

  if (isNaN(userId) || isNaN(numeroFecha)) {
    return res.status(400).json({ message: "Parámetros inválidos" });
  }

  try {
    const [puntajeTotal, puntajeFecha, rankingFecha] = await Promise.all([
      obtenerUsuariosConPuntajeFavoritosGoleador(),
      obtenerPuntajeDeUsuarioPorFechaFavoritosGoleador(userId, numeroFecha),
      obtenerRankingPorFechaFavoritosGoleador(numeroFecha),
    ]);

    const usuarioTotal = puntajeTotal.find(u => u.id === userId);

    return res.json({
      usuario: {
        id: userId,
        user: usuarioTotal?.user || puntajeFecha.user,
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
