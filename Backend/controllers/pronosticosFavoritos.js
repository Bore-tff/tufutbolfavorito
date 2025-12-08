import PronosticoFavorito from "../models/predictionsFavoritos.model.js";
import Partido from "../models/partido.model.js";
import Usuario from "../models/user.model.js";
import axios from "axios";

export const getPronosticosFavoritosPorFecha = async (req, res) => {
  try {
    const userId = req.user.id;
    const fecha = Number(req.query.fecha);

    if (!fecha) return res.status(400).json({ message: "Se requiere la fecha" });

    const pronosticos = await PronosticoFavorito.findAll({
      where: { userId, fecha },
      attributes: ["matchId", "homeScore", "awayScore", "penalesHome", "penalesAway"],
      raw: true,
    });

    res.status(200).json(pronosticos);
  } catch (error) {
    console.error("Error al obtener pronósticos por fecha:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Guardar pronósticos favoritos sin calcular puntos si aún no hay resultados
export const guardarPronosticosFavoritos = async (req, res) => {
  try {
    const { pronosticos } = req.body;
    const userId = req.user.id;

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
      const { matchId, homeScore, awayScore, penalesHome, penalesAway } = p;
      if (matchId === undefined || homeScore === undefined || awayScore === undefined) continue;

      const partido = await Partido.findByPk(matchId);
      if (!partido) continue;

      // Solo procesar si participa el equipo favorito
      if (partido.homeTeam !== equipoFavorito && partido.awayTeam !== equipoFavorito) continue;

      let puntos = null;

      if (
        typeof partido.homeScore === "number" &&
        typeof partido.awayScore === "number"
      ) {
        // Resultado real
        const resultadoReal =
          partido.homeScore > partido.awayScore
            ? "LOCAL"
            : partido.homeScore < partido.awayScore
            ? "VISITANTE"
            : "EMPATE";

        // Resultado pronosticado
        const resultadoPronosticado =
          homeScore > awayScore
            ? "LOCAL"
            : homeScore < awayScore
            ? "VISITANTE"
            : "EMPATE";

        // Calcular puntos normales
        if (resultadoReal === resultadoPronosticado) {
          if (resultadoReal === "LOCAL" && partido.homeTeam === equipoFavorito)
            puntos = 2;
          else if (resultadoReal === "VISITANTE" && partido.awayTeam === equipoFavorito)
            puntos = 3;
          else if (resultadoReal === "EMPATE")
            puntos = 1;
        } else {
          puntos = 0;
        }

        // ⚽ Lógica extra: fases con penales
        const esFaseEliminatoria = ["Octavos", "Cuartos", "Semis", "Final"].includes(partido.fase);

        if (esFaseEliminatoria && resultadoReal === "EMPATE" && resultadoPronosticado === "EMPATE") {
          // Si existen resultados de penales reales
          if (
            typeof partido.penalesHome === "number" &&
            typeof partido.penalesAway === "number"
          ) {
            const ganadorReal = partido.penalesHome > partido.penalesAway ? "LOCAL" : "VISITANTE";
            const ganadorPronosticado = penalesHome > penalesAway ? "LOCAL" : "VISITANTE";

            let penalesAcertados = 0;

            // Sumar 1 punto base si acertó que era empate
            puntos = 1;

            // Sumar 4 puntos si acierta cantidad de penales exactos a favor de su equipo
            if (
              (ganadorReal === "LOCAL" && partido.homeTeam === equipoFavorito && penalesHome === partido.penalesHome) ||
              (ganadorReal === "VISITANTE" && partido.awayTeam === equipoFavorito && penalesAway === partido.penalesAway)
            ) {
              penalesAcertados = ganadorReal === "LOCAL" ? partido.penalesHome : partido.penalesAway;
              puntos += penalesAcertados;
            }
          }
        }
      }

      // Crear o actualizar el pronóstico
      const nuevoPronostico = await PronosticoFavorito.create({
        userId,
        matchId,
        homeScore,
        awayScore,
        penalesHome,
        penalesAway,
        puntos,
        fecha: partido.fecha,
        fase: partido.fase,
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
