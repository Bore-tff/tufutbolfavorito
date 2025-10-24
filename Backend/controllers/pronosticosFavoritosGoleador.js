import PronosticoFavoritoGoleador from "../models/predictionsFavoritosGoleador.model.js";
import Partido from "../models/partido.model.js";
import Usuario from "../models/user.model.js";
import axios from "axios";

// Guardar pronósticos favoritos goleador sin calcular goles si aún no hay resultados
export const guardarPronosticosFavoritosGoleador = async (req, res) => {
  try {
    const { pronosticos } = req.body;
    const userId = req.user.id;

    // Verificar que el usuario tenga equipo favorito goleador
    const usuario = await Usuario.findByPk(userId);
    if (!usuario || !usuario.equipoFavoritoGoleador) {
      return res.status(400).json({
        message: "Debe seleccionar un equipo favorito goleador antes de pronosticar."
      });
    }
    const equipoFavorito = usuario.equipoFavoritoGoleador;

    if (!Array.isArray(pronosticos) || pronosticos.length === 0) {
      return res.status(400).json({ message: "Se requiere al menos un pronóstico" });
    }

    const nuevosPronosticos = [];

    // Traemos todos los partidos desde la API
    const response = await axios.get(
      "https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions"
    );
    const partidos = response.data.flatMap(f =>
      f.partidos.map(p => ({
        ...p,
        fecha: f.fecha
      }))
    );

    for (const p of pronosticos) {
      
      const matchId = p.matchId;
      const goles = p.goles ?? p.golesAcertados;
      if (matchId === undefined || goles === undefined) continue;

      const partido = partidos.find(m => m.id === matchId);
      if (!partido) continue;

      // Solo procesar si participa el equipo favorito goleador
      if (partido.home.name !== equipoFavorito && partido.away.name !== equipoFavorito) continue;

      let golesAcertados = null; // null si aún no hay resultados

      const resultadoRealHome = partido.score?.home ?? null;
      const resultadoRealAway = partido.score?.away ?? null;

      const resultadoDisponible =
        resultadoRealHome !== null && resultadoRealAway !== null;

      if (resultadoDisponible) {
        const golesReales = partido.home.name === equipoFavorito
          ? Number(resultadoRealHome)
          : Number(resultadoRealAway);
        const golesPronosticados = Number(goles);

        golesAcertados = 0;
        if (golesReales > 0) {
          if (golesPronosticados === golesReales) golesAcertados += golesReales;
          else if (golesPronosticados > 0 && golesPronosticados < golesReales)
            golesAcertados += golesPronosticados;
        }
      }

      const nuevoPronostico = await PronosticoFavoritoGoleador.create({
        userId,
        matchId,
        fecha: partido.fecha,
        golesAcertados: Number(goles)
      });

      nuevosPronosticos.push(nuevoPronostico.get({ plain: true }));
    }

    res.status(201).json(nuevosPronosticos);
  } catch (error) {
    console.error("Error al guardar los pronósticos favoritos goleador:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

export const getPronosticosFavoritosGoleadorPorFecha = async (req, res) => {
  try {
    const userId = req.user.id;
    const fecha = Number(req.query.fecha);

    if (!fecha) return res.status(400).json({ message: "Se requiere la fecha" });

    const pronosticos = await PronosticoFavoritoGoleador.findAll({
      where: { userId, fecha },
      attributes: ["matchId", "golesAcertados"],
      raw: true,
    });

    res.status(200).json(pronosticos);
  } catch (error) {
    console.error("Error al obtener pronósticos goleador por fecha:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Recalcular puntajes y goles acertados cuando existan resultados
export const recalcularPuntajesFavoritosGoleador = async () => {
  try {
    const response = await axios.get(
      "https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions"
    );
    const partidos = response.data.flatMap(f => f.partidos);

    const pronosticos = await PronosticoFavoritoGoleador.findAll({ where: { golesAcertados: null } });

    for (const pronostico of pronosticos) {
      const partido = partidos.find(p => p.id === pronostico.matchId);
      if (!partido?.score) continue;
      if (partido.score.home == null || partido.score.away == null) continue;

      const usuario = await Usuario.findByPk(pronostico.userId);
      if (!usuario || !usuario.equipoFavoritoGoleador) continue;
      const equipoFavorito = usuario.equipoFavoritoGoleador;

      let golesAcertados = 0;

      if (partido.home.name === equipoFavorito) {
        golesAcertados = Number(partido.score.home);
      } else if (partido.away.name === equipoFavorito) {
        golesAcertados = Number(partido.score.away);
      }

      // En este juego "goleador", los puntos = goles acertados
      const puntos = golesAcertados;

      await pronostico.update({ golesAcertados, puntos });
    }
  } catch (error) {
    console.error("Error al recalcular puntajes favoritos goleador:", error);
  }
};
