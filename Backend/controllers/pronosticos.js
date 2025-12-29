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
      attributes: ["matchId", "homeScore", "awayScore", "penalesHome", "penalesAway"],
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

    // 🛑 Validaciones básicas
    if (!Array.isArray(pronosticos) || pronosticos.length === 0) {
      return res.status(400).json({ message: "Debes enviar pronósticos" });
    }

    if (pronosticos.length !== 15) {
      return res.status(400).json({
        message: "Debes completar los 15 partidos de la fecha",
      });
    }

    // 🔗 Traer partidos reales desde la API
    const response = await axios.get(
      "https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions"
    );

    // Flatten: [{...partido, fecha}]
    const partidos = response.data.flatMap(f =>
      f.partidos.map(p => ({
        ...p,
        fecha: f.fecha,
      }))
    );

    const resultados = [];

    // 🔁 Procesar cada pronóstico
    for (const p of pronosticos) {
      const {
        matchId,
        homeScore,
        awayScore,
        penalesHome,
        penalesAway,
      } = p;

      if (
        matchId == null ||
        homeScore == null ||
        awayScore == null
      ) continue;

      const partido = partidos.find(m => m.id === matchId);
      if (!partido) continue;

      const fecha = partido.fecha;
      const fase = partido.fase ?? null;

      let puntos = null;
      let golesAcertados = 0;

      // 🧠 Resultado real
      const realHome = partido.score?.home;
      const realAway = partido.score?.away;

      const tieneResultado =
        typeof realHome === "number" &&
        typeof realAway === "number";

      if (tieneResultado) {
  const resultadoReal =
    realHome > realAway
      ? "LOCAL"
      : realHome < realAway
      ? "VISITANTE"
      : "EMPATE";

  const resultadoPronosticado =
    homeScore > awayScore
      ? "LOCAL"
      : homeScore < awayScore
      ? "VISITANTE"
      : "EMPATE";

  // 🏆 PUNTOS POR RESULTADO
  puntos = 0;

  if (resultadoReal === resultadoPronosticado) {
    if (resultadoReal === "LOCAL") puntos = 2;
    else if (resultadoReal === "VISITANTE") puntos = 3;
    else if (resultadoReal === "EMPATE") puntos = 1;
  }

  // ⚽ GOLES EXACTOS (se suman)
  golesAcertados = 0;

  if (homeScore === realHome) {
    golesAcertados += realHome; // suma los goles reales
  }

  if (awayScore === realAway) {
    golesAcertados += realAway;
  }

  //puntos += golesAcertados;

        // ⚽ Eliminatorias con penales
        //const esEliminatoria = ["Octavos", "Cuartos", "Semis", "Final"].includes(fase);

        //if (
          //esEliminatoria &&
          //resultadoReal === "EMPATE" &&
          //resultadoPronosticado === "EMPATE" &&
          //typeof partido.penalesHome === "number" &&
          //typeof partido.penalesAway === "number"
        //) {
          //const ganadorReal =
            //partido.penalesHome > partido.penalesAway ? "LOCAL" : "VISITANTE";
          //const ganadorPronosticado =
            //penalesHome > penalesAway ? "LOCAL" : "VISITANTE";

          // 1 punto extra por acertar empate
          //puntos += 1;

          // 4 puntos por penales exactos
          //if (
            //penalesHome === partido.penalesHome &&
            //penalesAway === partido.penalesAway
          //) {
            //puntos += 4;
          //}

          // (opcional) punto por ganador por penales
          //if (ganadorReal === ganadorPronosticado) {
            //puntos += 1;
          //}
        //}
      }

      // 💾 Guardar (findOrCreate + update)
      const [registro, created] = await Pronostico.findOrCreate({
        where: { userId, matchId },
        defaults: {
          homeScore,
          awayScore,
          penalesHome: penalesHome ?? null,
          penalesAway: penalesAway ?? null,
          puntos,
          golesAcertados,
          fecha,
          fase,
        },
      });

      if (!created) {
        await registro.update({
          homeScore,
          awayScore,
          penalesHome: penalesHome ?? null,
          penalesAway: penalesAway ?? null,
          puntos,
          golesAcertados,
          fecha,
          fase,
        });
      }

      resultados.push(registro);
    }

    return res.status(201).json({
      message: "Pronósticos guardados correctamente",
      total: resultados.length,
      resultados,
    });

  } catch (error) {
    console.error("Error al guardar pronósticos:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
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
