import { useEffect, useState } from "react";
import useUserStore from "../../../store/usersStore";
import { getMatches } from "../../../api/pronosticos";
import PronosticoEquipoFav from "./PronosticoEquipoFav";
import { motion } from "framer-motion";

export default function ElegirEquipo() {
  const {
    user,
    usuarios,
    equipoFavorito,
    equipoFavoritoGoleador,
    guardarAmbosFavoritos,
    getAllUsers,
    loading,
    error,
    mensaje,
  } = useUserStore();

  const [equipos, setEquipos] = useState([]);
  const [equiposGoleador, setEquiposGoleador] = useState([]);
  const [equipo, setEquipo] = useState("");
  const [equipoGoleador, setEquipoGoleador] = useState("");

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await getMatches();
        const partidasPorFecha = res.data;

        const equiposMap = new Map();

        partidasPorFecha.forEach((fecha) => {
          fecha.partidos.forEach((partido) => {
            equiposMap.set(partido.home.name, partido.home);
            equiposMap.set(partido.away.name, partido.away);
          });
        });

        const equiposArray = Array.from(equiposMap.values());

        setEquipos(equiposArray);
        setEquiposGoleador(equiposArray);

        console.log("EQUIPOS OBJETO:", equiposArray);
      } catch (err) {
        console.error("Error al traer equipos:", err);
      }
    };

    fetchEquipos();
  }, []);

  if (equipoFavorito) {
    return (
      <div>
        <PronosticoEquipoFav />
      </div>
    );
  }

  if (equipos.length === 0) {
    return <p>Cargando equipos...</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!equipo) {
      alert("Por favor, seleccioná un equipo campeón.");
      return;
    }
    if (!equipoGoleador) {
      alert("Por favor, seleccioná un equipo goleador.");
      return;
    }

    // Llamada al store
    await guardarAmbosFavoritos(equipo, equipoGoleador);
  };

  console.log(equipos);

  return (
    <motion.div
      className="space-y-10 p-4 "
      initial={{ y: -100, opacity: 0 }} // Empieza arriba y transparente
      animate={{ y: 0, opacity: 1 }} // Baja a su posición original y aparece
      transition={{ duration: 0.8, ease: "easeOut" }} // Suavidad
    >
      <div className="max-w-md mx-auto mt-10 bg-black border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff] rounded-2xl p-6">
        <h2 className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100 text-2xl font-bold mb-4 text-center">
          ELEGÍ TU EQUIPO FAVORITO
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-green-500 block mb-1" htmlFor="equipo">
              Equipo Campeón
            </label>
            <select
              id="equipo"
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              disabled={loading}
              className="w-full p-2 rounded-lg cursor-pointer bg-black border-2 border-green-500 text-white focus:outline-none"
            >
              <option value="">-- Seleccioná un equipo --</option>

              {equipos.map((eq) => (
                <option
                  key={eq.name}
                  value={eq.name}
                  className="text-white cursor-pointer"
                >
                  {eq.name} - {eq.apodo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="text-green-500 block mb-1"
              htmlFor="equipoGoleador"
            >
              Equipo Goleador
            </label>
            <select
              id="equipoGoleador"
              value={equipoGoleador}
              onChange={(e) => setEquipoGoleador(e.target.value)}
              disabled={loading}
              className="w-full p-2 rounded-lg cursor-pointer bg-black border-2 border-green-500 text-white focus:outline-none"
            >
              <option value="">-- Seleccioná un equipo --</option>

              {equiposGoleador.map((eq) => (
                <option
                  key={eq.name}
                  value={eq.name}
                  className="text-white cursor-pointer"
                >
                  {eq.name} - {eq.apodo}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 font-bold hover:bg-green-500 cursor-pointer  py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Aceptar"}
          </button>

          {error && <p className="text-red-400 text-center">{error}</p>}
          {mensaje && <p className="text-green-400 text-center">{mensaje}</p>}
        </form>
      </div>
    </motion.div>
  );
}
