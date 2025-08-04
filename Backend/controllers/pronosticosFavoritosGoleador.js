import PronosticoFavoritoGoleador from "../models/predictionsFavoritosGoleador.model.js";
import Usuario from "../models/user.model.js";
import axios from "axios";


export const guardarPronosticosFavoritosGoleador = async (req, res) => {
  
  try {
    const { pronosticos } = req.body;
    
    const userId = req.user.id;

    const usuario = await Usuario.findByPk(userId);
    if (!usuario || !usuario.equipoFavoritoGoleador) {
      return res.status(400).json({ message: "Debe seleccionar un equipo favorito goleador antes de pronosticar." });
    }
    const equipoFavorito = usuario.equipoFavoritoGoleador;

    if (!Array.isArray(pronosticos) || pronosticos.length === 0) {
      return res.status(400).json({ message: "Se requiere al menos un pronóstico" });
    }

    const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
    const partidos = response.data.flatMap(f => f.partidos);

    const nuevosPronosticos = [];

    for (const p of pronosticos) {
  const { matchId } = p;
  if (matchId === undefined) continue;

  const partido = partidos.find((m) => m.id === matchId);
  if (!partido) continue;

  // Solo procesar si participa el equipo favorito
  if (partido.home.name !== equipoFavorito && partido.away.name !== equipoFavorito) continue;

  let golesAcertados = null;

  const resultadoDisponible =
    resultadoRealHome !== null &&
    resultadoRealAway !== null &&
    resultadoRealHome !== undefined &&
    resultadoRealAway !== undefined;

  if (resultadoDisponible) {
    golesAcertados = 0;

    if (partido.home.name === equipoFavorito) {
  const golesReales = Number(resultadoRealHome);
  const golesPronosticados = Number(homeScore);

  if (golesReales > 0) {
    if (golesPronosticados === golesReales) {
      golesAcertados += golesReales;
    } else if (golesPronosticados > 0 && golesPronosticados < golesReales) {
      golesAcertados += golesPronosticados;
    }
  }
} else if (partido.away.name === equipoFavorito) {
  const golesReales = Number(resultadoRealAway);
  const golesPronosticados = Number(awayScore);

  if (golesReales > 0) {
    if (golesPronosticados === golesReales) {
      golesAcertados += golesReales;
    } else if (golesPronosticados > 0 && golesPronosticados < golesReales) {
      golesAcertados += golesPronosticados;
    }
  }
}
    

  }

  const nuevoPronostico = await PronosticoFavoritoGoleador.create({
    userId,
    matchId,
    golesAcertados
  });

  nuevosPronosticos.push(nuevoPronostico.get({ plain: true }));
}

    await recalcularPuntajesFavoritosGoleador();

    res.status(201).json(nuevosPronosticos);
  } catch (error) {
    console.error("Error al guardar los pronósticos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const recalcularPuntajesFavoritosGoleador = async () => {
  const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
  const partidos = response.data.flatMap(f => f.partidos);

  const pronosticos = await PronosticoFavoritoGoleador.findAll({ where: { puntos: null } });

  for (const pronostico of pronosticos) {
    const partido = partidos.find(p => p.id === pronostico.matchId);
    if (!partido) continue;

    const resultadoRealHome = partido.score?.home;
    const resultadoRealAway = partido.score?.away;
    if (resultadoRealHome == null || resultadoRealAway == null) continue;

    const usuario = await Usuario.findByPk(pronostico.userId);
    if (!usuario || !usuario.equipoFavoritoGoleador) continue;

    const equipoFavorito = usuario.equipoFavoritoGoleador;

    let golesAcertados = 0;

    if (partido.home.name === equipoFavorito) {
  const golesRealesNum = Number(resultadoRealHome);
  const golesPronosticadosNum = Number(pronostico.homeScore);

  if (golesRealesNum > 0) {
    if (golesPronosticadosNum === golesRealesNum) {
      golesAcertados += golesRealesNum;
    } else if (golesPronosticadosNum > 0 && golesPronosticadosNum < golesRealesNum) {
      golesAcertados += golesPronosticadosNum;
    }
  }
} else if (partido.away.name === equipoFavorito) {
  const golesRealesNum = Number(resultadoRealAway);
  const golesPronosticadosNum = Number(pronostico.awayScore);

  if (golesRealesNum > 0) {
    if (golesPronosticadosNum === golesRealesNum) {
      golesAcertados += golesRealesNum;
    } else if (golesPronosticadosNum > 0 && golesPronosticadosNum < golesRealesNum) {
      golesAcertados += golesPronosticadosNum;
    }
  }
}else {
      // No participa el equipo favorito en este partido
      golesAcertados = 0;
    }

    await pronostico.update({ puntos, golesAcertados });
  }
};

  