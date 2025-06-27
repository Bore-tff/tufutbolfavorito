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
    const pronosticos = req.body.pronosticos;
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

      const resultadoRealHome = partido.score.home;
      const resultadoRealAway = partido.score.away;

      let puntos = 0;
      let golesAcertados = 0;

      if (resultadoRealHome !== null && resultadoRealAway !== null) {
        const resultadoReal =
          resultadoRealHome > resultadoRealAway ? "LOCAL" :
          resultadoRealHome < resultadoRealAway ? "VISITANTE" : "EMPATE";

        const resultadoPronosticado =
          homeScore > awayScore ? "LOCAL" :
          homeScore < awayScore ? "VISITANTE" : "EMPATE";

        // ✅ puntos por resultado
        if (resultadoReal === resultadoPronosticado) {
          if (resultadoReal === "LOCAL") puntos = 2;
          else if (resultadoReal === "VISITANTE") puntos = 3;
          else puntos = 1;
        }

        // ✅ goles acertados (según tu lógica personalizada)
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
        golesAcertados,
      });

      nuevosPronosticos.push(nuevoPronostico.get({ plain: true }));
    }

    res.status(201).json(nuevosPronosticos);
  } catch (error) {
    console.error("Error al guardar los pronósticos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


  