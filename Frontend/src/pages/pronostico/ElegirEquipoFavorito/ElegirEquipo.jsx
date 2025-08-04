import { useEffect, useState } from "react";
import useUserStore from "../../../store/usersStore";
import { getMatches } from "../../../api/pronosticos";
import PronosticoEquipoFav from "./PronosticoEquipoFav";

export default function ElegirEquipo() {
  const {
    user,
    usuarios,
    equipoFavorito,
    equipoFavoritoGoleador,
    seleccionarEquipoFavorito,
    seleccionarEquipoFavoritoGoleador,
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
    getAllUsers();
  }, [getAllUsers]);

  console.log(usuarios);
  console.log("1", user);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await getMatches();
        console.log("Respuesta de fetchMatches:", res);
        const partidasPorFecha = res.data; // ajustá según tu respuesta real

        // Extraer equipos únicos
        const equiposSet = new Set();

        partidasPorFecha.forEach((fecha) => {
          fecha.partidos.forEach((partido) => {
            equiposSet.add(partido.home.name);
            equiposSet.add(partido.away.name);
          });
        });

        setEquipos(Array.from(equiposSet));
        setEquiposGoleador(Array.from(equiposSet));
      } catch (err) {
        console.error("Error al traer equipos:", err);
      }
    };

    fetchEquipos();
  }, []);

  if (equipoFavorito) {
    return (
      <div>
        <div className="text-center mt-25">
          <h1 className="text-green-500 bg-gray-800 rounded-xl pt-1 pb-2 ml-150 mr-150 text-3xl mb-10">
            Modo de juego: Favorito
          </h1>
        </div>
        <div className="flex">
          <div className="text-white ml-10 bg-gray-800 pl-5 pt-1 pb-1 w-55 rounded-xl">
            <h2 className="text-2xl text-green-500">Equipo favorito:</h2>
            <p className="text-xl mt-2">{equipoFavorito}</p>
          </div>
          <div className="text-white ml-10 bg-gray-800 pl-5 pt-1 pb-1 w-85 rounded-xl">
            <h2 className="text-2xl text-green-500">
              Equipo favorito goleador:
            </h2>
            <p className="text-xl mt-2">{equipoFavoritoGoleador}</p>
          </div>
        </div>
        <PronosticoEquipoFav />
      </div>
    );
  }

  if (equipos.length === 0) {
    return <p>Cargando equipos...</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipo) return alert("Por favor, seleccioná un equipo.");
    if (!equipoGoleador) return alert("Por favor, seleccioná un equipo.");
    await seleccionarEquipoFavorito(equipo);
    await seleccionarEquipoFavoritoGoleador(equipoGoleador);
  };

  console.log("elegir", usuarios);

  return (
    <div className="max-w-md mx-auto mt-10 bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-white text-2xl font-bold mb-4 text-center">
        Elegí tu equipo favorito
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-white block mb-1" htmlFor="equipo">
            Equipo Favorito
          </label>
          <select
            id="equipo"
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            disabled={loading}
            className="w-full p-2 rounded-lg cursor-pointer bg-gray-700 text-white focus:outline-none"
          >
            <option value="">-- Seleccioná un equipo --</option>
            {equipos.map((eq) => (
              <option className="text-white cursor-pointer" key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-white block mb-1" htmlFor="equipoGoleador">
            Equipo Favorito Goleador
          </label>
          <select
            id="equipoGoleador"
            value={equipoGoleador}
            onChange={(e) => setEquipoGoleador(e.target.value)}
            disabled={loading}
            className="w-full p-2 rounded-lg cursor-pointer bg-gray-700 text-white focus:outline-none"
          >
            <option value="">-- Seleccioná un equipo --</option>
            {equiposGoleador.map((eq) => (
              <option className="text-white cursor-pointer" key={eq} value={eq}>
                {eq}
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
  );
}
