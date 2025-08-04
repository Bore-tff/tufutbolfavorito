import PronosticoFavorito from "../models/predictionsFavoritos.model.js";
import Usuario from "../models/user.model.js";
import axios from "axios";


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

    const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
    const partidos = response.data.flatMap(f => f.partidos);

    const nuevosPronosticos = [];

    for (const p of pronosticos) {
  const { matchId, homeScore, awayScore } = p;
  if (matchId === undefined || homeScore === undefined || awayScore === undefined) continue;

  const partido = partidos.find((m) => m.id === matchId);
  if (!partido) continue;

  // Solo procesar si participa el equipo favorito
  if (partido.home.name !== equipoFavorito && partido.away.name !== equipoFavorito) continue;

  // resto del cálculo como ya tenés...
  const resultadoRealHome = partido?.score?.home;
  const resultadoRealAway = partido?.score?.away;

  let puntos = null;

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

    if (resultadoReal === resultadoPronosticado) {
      if (resultadoReal === "LOCAL") puntos = 2;
      else if (resultadoReal === "VISITANTE") puntos = 3;
      else puntos = 1;
    }

    

  }

  const nuevoPronostico = await PronosticoFavorito.create({
    userId,
    matchId,
    homeScore,
    awayScore,
    puntos
  });

  nuevosPronosticos.push(nuevoPronostico.get({ plain: true }));
}

    await recalcularPuntajesFavoritos();

    res.status(201).json(nuevosPronosticos);
  } catch (error) {
    console.error("Error al guardar los pronósticos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const recalcularPuntajesFavoritos = async () => {
  const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
  const partidos = response.data.flatMap(f => f.partidos);

  const pronosticos = await PronosticoFavorito.findAll({ where: { puntos: null } });

  for (const pronostico of pronosticos) {
    const partido = partidos.find(p => p.id === pronostico.matchId);
    if (!partido) continue;

    const resultadoRealHome = partido.score?.home;
    const resultadoRealAway = partido.score?.away;
    if (resultadoRealHome == null || resultadoRealAway == null) continue;

    const usuario = await Usuario.findByPk(pronostico.userId);
    if (!usuario || !usuario.equipoFavorito) continue;

    const equipoFavorito = usuario.equipoFavorito;

    let puntos = 0;

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

  }
};

  