import PronosticoFavoritoGoleador from "../models/predictionsFavoritosGoleador.model.js";
import Partido from "../models/partido.model.js";
import Usuario from "../models/user.model.js";
import axios from "axios";


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

    // Validar que haya pronósticos
    if (!Array.isArray(pronosticos) || pronosticos.length === 0) {
      return res.status(400).json({ message: "Se requiere al menos un pronóstico" });
    }

    // Traer todos los partidos desde la API externa
    const response = await axios.get(
      "https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions"
    );
    const partidos = response.data.flatMap(f =>
      f.partidos.map(p => ({
        ...p,
        fecha: f.fecha // 👈 agregamos la fecha/jornada
      }))
    );

    const nuevosPronosticos = [];

    for (const p of pronosticos) {
      const { matchId, goles } = p;
      if (matchId === undefined || goles === undefined) continue;

      const partido = partidos.find(m => m.id === matchId);
      if (!partido) continue;

      // Solo procesar si participa el equipo favorito
      if (partido.home.name !== equipoFavorito && partido.away.name !== equipoFavorito) continue;

      let golesAcertados = null;

      const resultadoRealHome = partido.score?.home ?? null;
      const resultadoRealAway = partido.score?.away ?? null;

      const resultadoDisponible =
        resultadoRealHome !== null &&
        resultadoRealAway !== null;

      if (resultadoDisponible) {
        golesAcertados = 0;
        const golesReales = partido.home.name === equipoFavorito
          ? Number(resultadoRealHome)
          : Number(resultadoRealAway);
        const golesPronosticados = Number(goles);

        if (golesReales > 0) {
          if (golesPronosticados === golesReales) golesAcertados += golesReales;
          else if (golesPronosticados > 0 && golesPronosticados < golesReales)
            golesAcertados += golesPronosticados;
        }
      }

      // Guardar pronóstico
      const nuevoPronostico = await PronosticoFavoritoGoleador.create({
        userId,
        matchId,
        fecha: partido.fecha, // ✅ igual que pronosticosFavoritos
        golesPronosticados: goles,
        golesAcertados
      });

      nuevosPronosticos.push(nuevoPronostico.get({ plain: true }));
    }

    // Recalcular puntajes si es necesario
    // await recalcularPuntajesFavoritosGoleador();

    res.status(201).json(nuevosPronosticos);
  } catch (error) {
    console.error("Error al guardar los pronósticos favoritos goleador:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};



export const recalcularPuntajesFavoritosGoleador = async () => {
  const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
  const partidos = response.data.flatMap(f => f.partidos);

  const pronosticos = await PronosticoFavoritoGoleador.findAll({ where: { golesAcertados: null } });

  for (const pronostico of pronosticos) {
    const partido = partidos.find(p => p.id === pronostico.matchId);
    if (!partido?.score) continue;

    const resultadoRealHome = partido.score.home;
    const resultadoRealAway = partido.score.away;
    if (resultadoRealHome == null || resultadoRealAway == null) continue;

    const usuario = await Usuario.findByPk(pronostico.userId);
    if (!usuario || !usuario.equipoFavoritoGoleador) continue;

    const equipoFavorito = usuario.equipoFavoritoGoleador;

    let golesAcertados = 0;

    if (partido.home.name === equipoFavorito) {
      golesAcertados = Number(resultadoRealHome);
    } else if (partido.away.name === equipoFavorito) {
      golesAcertados = Number(resultadoRealAway);
    }

    // En este juego "goleador", los puntos = goles acertados
    const puntos = golesAcertados;

    // Actualizamos ambos campos en la base de datos
    await pronostico.update({ golesAcertados, puntos });
  }
};
