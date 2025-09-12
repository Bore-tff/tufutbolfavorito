import PronosticoFavorito from "../models/predictionsFavoritos.model.js";
import Partido from "../models/partido.model.js";
import Usuario from "../models/user.model.js";
import axios from "axios";

// Guardar pronósticos favoritos sin calcular puntos si aún no hay resultados
export const guardarPronosticosFavoritos = async (req, res) => {
  try {
    const { pronosticos } = req.body;
    const userId = req.user.id;

    // Verificar que el usuario tenga un equipo favorito
    const usuario = await Usuario.findByPk(userId);
    if (!usuario || !usuario.equipoFavorito) {
      return res.status(400).json({ message: "Debe seleccionar un equipo favorito antes de pronosticar." });
    }
    const equipoFavorito = usuario.equipoFavorito;

    if (!Array.isArray(pronosticos) || pronosticos.length === 0) {
      return res.status(400).json({ message: "Se requiere al menos un pronóstico" });
    }

    const nuevosPronosticos = [];

    for (const p of pronosticos) {
      const { matchId, homeScore, awayScore } = p;
      if (matchId === undefined || homeScore === undefined || awayScore === undefined) continue;

      const partido = await Partido.findByPk(matchId);
      if (!partido) continue;

      // Solo procesar si participa el equipo favorito
      if (partido.homeTeam !== equipoFavorito && partido.awayTeam !== equipoFavorito) continue;

      // Guardar pronóstico sin calcular puntos si score aún no existe o no es número
      const puntos =
        typeof partido.homeScore === "number" && typeof partido.awayScore === "number"
          ? (() => {
              const resultadoReal =
                partido.homeScore > partido.awayScore ? "LOCAL" :
                partido.homeScore < partido.awayScore ? "VISITANTE" : "EMPATE";

              const resultadoPronosticado =
                homeScore > awayScore ? "LOCAL" :
                homeScore < awayScore ? "VISITANTE" : "EMPATE";

              if (resultadoReal === resultadoPronosticado) {
                if (resultadoReal === "LOCAL" && partido.homeTeam === equipoFavorito) return 2;
                if (resultadoReal === "VISITANTE" && partido.awayTeam === equipoFavorito) return 3;
                if (resultadoReal === "EMPATE") return 1;
              }
              return 0;
            })()
          : null;

      const nuevoPronostico = await PronosticoFavorito.create({
        userId,
        matchId,
        homeScore,
        awayScore,
        puntos, // será null si no hay resultados
        fecha: partido.fecha
      });

      nuevosPronosticos.push(nuevoPronostico.get({ plain: true }));
    }

    res.status(201).json(nuevosPronosticos);
  } catch (error) {
    console.error("Error al guardar los pronósticos favoritos:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Recalcular puntajes de pronósticos favoritos cuando haya resultados
export const recalcularPuntajesFavoritos = async () => {
  try {
    const response = await axios.get(
      "https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions"
    );
    const partidos = response.data.flatMap(f => f.partidos);

    const pronosticos = await PronosticoFavorito.findAll({ where: { puntos: null } });

    for (const pronostico of pronosticos) {
      const partido = partidos.find(p => p.id === pronostico.matchId);
      if (!partido?.score) continue;
      if (typeof partido.score.home !== "number" || typeof partido.score.away !== "number") continue;

      const usuario = await Usuario.findByPk(pronostico.userId);
      if (!usuario?.equipoFavorito) continue;
      const equipoFavorito = usuario.equipoFavorito;

      const resultadoReal =
        partido.score.home > partido.score.away ? "LOCAL" :
        partido.score.home < partido.score.away ? "VISITANTE" : "EMPATE";

      const resultadoPronosticado =
        pronostico.homeScore > pronostico.awayScore ? "LOCAL" :
        pronostico.homeScore < pronostico.awayScore ? "VISITANTE" : "EMPATE";

      let puntos = null; // por defecto null si no hay resultado
      if (resultadoReal === resultadoPronosticado) {
        if (resultadoReal === "LOCAL" && partido.home.name === equipoFavorito) puntos = 2;
        else if (resultadoReal === "VISITANTE" && partido.away.name === equipoFavorito) puntos = 3;
        else if (resultadoReal === "EMPATE") puntos = 1;
        else puntos = 0;
      } else {
        puntos = 0;
      }

      await pronostico.update({ puntos });
    }
  } catch (error) {
    console.error("Error al recalcular puntajes favoritos:", error);
  }
};
