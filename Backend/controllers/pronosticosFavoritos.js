import PronosticoFavorito from "../models/predictionsFavoritos.model.js";
import Partido from "../models/partido.model.js";
import Usuario from "../models/user.model.js";
import axios from "axios";


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

      let puntos = 0;

      // Calculamos resultado real
      const resultadoReal =
        partido.homeScore > partido.awayScore ? "LOCAL" :
        partido.homeScore < partido.awayScore ? "VISITANTE" : "EMPATE";

      // Calculamos resultado pronosticado
      const resultadoPronosticado =
        homeScore > awayScore ? "LOCAL" :
        homeScore < awayScore ? "VISITANTE" : "EMPATE";

      // Si el pronóstico coincide con el resultado
      if (resultadoReal === resultadoPronosticado) {
        if (resultadoReal === "LOCAL" && partido.homeTeam === equipoFavorito) puntos = 2;
        else if (resultadoReal === "VISITANTE" && partido.awayTeam === equipoFavorito) puntos = 3;
        else if (resultadoReal === "EMPATE") puntos = 1;
      }

      const nuevoPronostico = await PronosticoFavorito.create({
        userId,
        matchId,
        homeScore,
        awayScore,
        puntos,
        fecha: partido.fecha // 👈 se guarda la fecha del partido
      });

      nuevosPronosticos.push(nuevoPronostico.get({ plain: true }));
    }

    res.status(201).json(nuevosPronosticos);
  } catch (error) {
    console.error("Error al guardar los pronósticos favoritos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Recalcular puntajes de pronósticos favoritos
export const recalcularPuntajesFavoritos = async () => {
  try {
    const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
    const partidos = response.data.flatMap(f => f.partidos);

    const pronosticos = await PronosticoFavorito.findAll();

    for (const pronostico of pronosticos) {
      const partido = partidos.find(p => p.id === pronostico.matchId);
      if (!partido?.score) continue;

      const usuario = await Usuario.findByPk(pronostico.userId);
      if (!usuario?.equipoFavorito) continue;
      const equipoFavorito = usuario.equipoFavorito;

      const resultadoReal =
        partido.score.home > partido.score.away ? "LOCAL" :
        partido.score.home < partido.score.away ? "VISITANTE" : "EMPATE";

      const resultadoPronostico =
        pronostico.homeScore > pronostico.awayScore ? "LOCAL" :
        pronostico.homeScore < pronostico.awayScore ? "VISITANTE" : "EMPATE";

      let puntos = 0;
      if (resultadoReal === resultadoPronostico) {
        if (resultadoReal === "LOCAL" && partido.home.name === equipoFavorito) puntos = 2;
        else if (resultadoReal === "VISITANTE" && partido.away.name === equipoFavorito) puntos = 3;
        else if (resultadoReal === "EMPATE") puntos = 1;
      }

      await pronostico.update({ puntos });
    }
  } catch (error) {
    console.error("Error al recalcular puntajes favoritos:", error);
  }
};


  