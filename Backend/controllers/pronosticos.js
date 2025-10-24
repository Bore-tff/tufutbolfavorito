import Pronostico from "../models/predictions.model.js";
import axios from "axios";

// Obtener partidos desde la API
export const getMatches = async (req, res) => {
  try {
    const response = await axios.get(
      "https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions"
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error al obtener los partidos:", error.message);
    res.status(500).json({ message: "Error al obtener los partidos", error: error.message });
  }
};

export const getPronosticosPorFecha = async (req, res) => {
  try {
    const userId = req.user.id;
    const fecha = Number(req.query.fecha);

    if (!fecha) return res.status(400).json({ message: "Se requiere la fecha" });

    const pronosticos = await Pronostico.findAll({
      where: { userId, fecha },
      attributes: ["matchId", "homeScore", "awayScore"],
      raw: true,
    });

    res.status(200).json(pronosticos);
  } catch (error) {
    console.error("Error al obtener pronósticos por fecha:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};


// Guardar pronósticos sin calcular puntos si aún no hay resultados
export const guardarPronosticos = async (req, res) => {
  try {
    const { pronosticos } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(pronosticos) || pronosticos.length === 0) {
      return res.status(400).json({ message: "Se requiere al menos un pronóstico" });
    }

    // Traer partidos desde la API
    const response = await axios.get(
      "https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions"
    );
    const partidos = response.data.flatMap(f =>
      f.partidos.map(p => ({ ...p, fecha: f.fecha }))
    );

    const nuevosPronosticos = [];

    for (const p of pronosticos) {
      const { matchId, homeScore, awayScore } = p;
      if (matchId === undefined || homeScore === undefined || awayScore === undefined) continue;

      const partido = partidos.find(m => m.id === matchId);
      if (!partido || partido.fecha == null) continue;

      // Guardar pronóstico sin calcular puntos si score aún no existe o no es número
      const nuevoPronostico = await Pronostico.create({
        userId,
        matchId,
        homeScore,
        awayScore,
        puntos: null,
        golesAcertados: null,
        fecha: partido.fecha
      });

      nuevosPronosticos.push(nuevoPronostico.get({ plain: true }));
    }

    res.status(201).json(nuevosPronosticos);
  } catch (error) {
    console.error("Error al guardar los pronósticos:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Recalcular puntajes pendientes cuando ya hay resultados
export const recalcularPuntajes = async () => {
  const response = await axios.get(
    "https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions"
  );
  const partidos = response.data.flatMap(f => f.partidos);

  // Buscar pronósticos pendientes
  const pronosticos = await Pronostico.findAll({ where: { puntos: null } });

  for (const pronostico of pronosticos) {
    const partido = partidos.find(p => p.id === pronostico.matchId);

    // Si no hay score o score no es número, saltar
    if (
      !partido?.score ||
      typeof partido.score.home !== "number" ||
      typeof partido.score.away !== "number"
    ) continue;

    const resultadoRealHome = partido.score.home;
    const resultadoRealAway = partido.score.away;

    let puntos = 0;
    let golesAcertados = 0;

    const resultadoReal =
      resultadoRealHome > resultadoRealAway
        ? "LOCAL"
        : resultadoRealHome < resultadoRealAway
        ? "VISITANTE"
        : "EMPATE";

    const resultadoPronosticado =
      pronostico.homeScore > pronostico.awayScore
        ? "LOCAL"
        : pronostico.homeScore < pronostico.awayScore
        ? "VISITANTE"
        : "EMPATE";

    if (resultadoReal === resultadoPronosticado) {
      if (resultadoReal === "LOCAL") puntos = 2;
      else if (resultadoReal === "VISITANTE") puntos = 3;
      else puntos = 1;
    }

    if (pronostico.homeScore === resultadoRealHome && resultadoRealHome > 0) {
      golesAcertados += resultadoRealHome;
    }
    if (pronostico.awayScore === resultadoRealAway && resultadoRealAway > 0) {
      golesAcertados += resultadoRealAway;
    }

    await pronostico.update({ puntos, golesAcertados });
  }
};

// Endpoint para actualizar puntajes pendientes
export const actualizarPuntajesPendientes = async (req, res) => {
  try {
    await recalcularPuntajes();
    res.status(200).json({ message: "Puntajes actualizados correctamente" });
  } catch (error) {
    console.error("Error al actualizar puntajes:", error);
    res.status(500).json({ message: "Error al actualizar puntajes", error: error.message });
  }
};
