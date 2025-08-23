import axios from "axios";
import Partido from "../models/partido.model.js";

function parseFechaHora(fechaStr) {
  const partes = fechaStr.split(" ");
  if (partes.length < 3) return new Date();

  let diaMes = partes[1];
  let hora = partes[2].replace("hs", "");

  const [dia, mes] = diaMes.split("/");

  const anio = new Date().getFullYear();

  const fechaISO = `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T${hora}:00`;

  return new Date(fechaISO);
}

export const sincronizarPartidos = async (req, res) => {
  try {
    const response = await axios.get("https://67e7322b6530dbd31112a6a5.mockapi.io/api/matches/predictions");
    const fechas = response.data;

    for (const fechaObj of fechas) {
      const fecha = parseInt(fechaObj.fecha);
      const partidos = fechaObj.partidos;

      for (const p of partidos) {
        await Partido.findOrCreate({
        where: { id: p.id }, // usar el id del mockAPI como PK
        defaults: {
         homeTeam: p.home.name,
         awayTeam: p.away.name,
         fecha,
         date: parseFechaHora(p.date),
         homeScore: p.score?.home ?? null,
         awayScore: p.score?.away ?? null,
        },
      });
     }
    }

    res.status(200).json({ message: "Partidos sincronizados correctamente" });
  } catch (error) {
    console.error("Error al sincronizar partidos:", error);
    res.status(500).json({ message: "Error al sincronizar partidos" });
  }
};
