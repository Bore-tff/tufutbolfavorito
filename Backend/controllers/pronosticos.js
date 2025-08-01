import Pronostico from "../models/predictions.model.js";
import axios from "axios";

export const getMatches = async (req, res) => {
  try {
    const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
    const matches = response.data;

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error al obtener los partidos:", error.message);
    res.status(500).json({ message: "Error al obtener los partidos", error: error.message });
  }
};

// En controllers/pronosticos.js


export const guardarPronosticos = async (req, res) => {
  
  try {
    const { pronosticos } = req.body;
    
    const userId = req.user.id;

    if (!Array.isArray(pronosticos) || pronosticos.length === 0) {
      return res.status(400).json({ message: "Se requiere al menos un pronóstico" });
    }

    const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
    const partidos = response.data.flatMap(f => f.partidos);

    const nuevosPronosticos = [];

    for (const p of pronosticos) {
      const { matchId, homeScore, awayScore } = p;
      if (matchId === undefined || homeScore === undefined || awayScore === undefined) continue;

      const partido = partidos.find((m) => m.id === matchId);
      if (!partido) continue;

      const resultadoRealHome = partido?.score?.home;
      const resultadoRealAway = partido?.score?.away;

      let puntos = null;
      let golesAcertados = null;

      const resultadoDisponible =
        resultadoRealHome !== null &&
        resultadoRealAway !== null &&
        resultadoRealHome !== undefined &&
        resultadoRealAway !== undefined;

      if (resultadoDisponible) {
        const resultadoReal =
          resultadoRealHome > resultadoRealAway ? "LOCAL" :
          resultadoRealHome < resultadoRealAway ? "VISITANTE" : "EMPATE";

        const resultadoPronosticado =
          homeScore > awayScore ? "LOCAL" :
          homeScore < awayScore ? "VISITANTE" : "EMPATE";

        puntos = 0;
        golesAcertados = 0;

        if (resultadoReal === resultadoPronosticado) {
          if (resultadoReal === "LOCAL") puntos = 2;
          else if (resultadoReal === "VISITANTE") puntos = 3;
          else puntos = 1;
        }

        if (homeScore === resultadoRealHome && resultadoRealHome > 0) {
          golesAcertados += resultadoRealHome;
        }

        if (awayScore === resultadoRealAway && resultadoRealAway > 0) {
          golesAcertados += resultadoRealAway;
        }
      }

      const nuevoPronostico = await Pronostico.create({
        userId,
        matchId,
        homeScore,
        awayScore,
        puntos,
        golesAcertados
      });

      nuevosPronosticos.push(nuevoPronostico.get({ plain: true }));
    }

    await recalcularPuntajes();

    res.status(201).json(nuevosPronosticos);
  } catch (error) {
    console.error("Error al guardar los pronósticos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};





export const recalcularPuntajes = async () => {
  const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
  const partidos = response.data.flatMap(f => f.partidos);

  const pronosticos = await Pronostico.findAll({ where: { puntos: null } });

  for (const pronostico of pronosticos) {
    const partido = partidos.find(p => p.id === pronostico.matchId);
    if (!partido) continue;

    const resultadoRealHome = partido.score?.home;
    const resultadoRealAway = partido.score?.away;

    if (resultadoRealHome == null || resultadoRealAway == null) continue;

    let puntos = 0;
    let golesAcertados = 0;

    const resultadoReal =
      resultadoRealHome > resultadoRealAway ? "LOCAL" :
      resultadoRealHome < resultadoRealAway ? "VISITANTE" : "EMPATE";

    const resultadoPronosticado =
      pronostico.homeScore > pronostico.awayScore ? "LOCAL" :
      pronostico.homeScore < pronostico.awayScore ? "VISITANTE" : "EMPATE";

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

export const actualizarPuntajesPendientes = async (req, res) => {
  try {
    await recalcularPuntajes();
    res.status(200).json({ message: "Puntajes actualizados correctamente" });
  } catch (error) {
    console.error("Error al actualizar puntajes:", error);
    res.status(500).json({ message: "Error al actualizar puntajes", error: error.message });
  }
};

  