import { useEffect, useState } from "react";
import useUserStore from "../../../store/usersStore";
import usePronosticoStore from "../../../store/pronosticosStore";

const PronosticoEquipoFav = () => {
  const {
    matches,
    fetchMatches,
    guardarPronosticos,
    resultadoComparacion,
    actualizarPronosticos,
    error,
    loading,
  } = usePronosticoStore();
  const {
    usuarios,
    user,
    getRankingPorFecha,
    getUsersWithPuntaje,
    equipoFavorito,
    rankingGeneral,
    rankingFecha,
  } = useUserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedFecha, setSelectedFecha] = useState(matches[0]?.fecha || 1);
  const [predictions, setPredictions] = useState({});
  const [mensaje, setMensaje] = useState("");

  const currentFecha = matches.find((m) => m.fecha === selectedFecha);

  useEffect(() => {
    // Ejecuta la carga inicial
    setCurrentPage(1);
    fetchMatches();
    actualizarPronosticos();
    getUsersWithPuntaje();
    getRankingPorFecha(selectedFecha);
  }, [selectedFecha]);

  const handleInputChange = (matchId, team, value) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const handleSavePrediction = async () => {
    const partidosFecha = currentFecha?.partidos || [];
    const faltantes = partidosFecha.filter(({ id }) => {
      const p = predictions[id];
      return !p || p.home === undefined || p.away === undefined;
    });

    if (faltantes.length > 0) {
      setMensaje("⚠️ Faltan completar goles para algunos partidos.");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    const predictionsArray = partidosFecha.map(({ id }) => ({
      matchId: id,
      homeScore: Number(predictions[id].home),
      awayScore: Number(predictions[id].away),
    }));

    setLocalLoading(true);
    setMensaje("⏳ Enviando pronóstico...");

    try {
      await guardarPronosticos(predictionsArray);
      await getRankingPorFecha(selectedFecha);
      setMensaje("✅ Pronóstico enviado correctamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("❌ Error al enviar pronóstico");
    } finally {
      setLocalLoading(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const partidosFiltrados = currentFecha
    ? currentFecha.partidos.filter(
        (p) => p.home.name === equipoFavorito || p.away.name === equipoFavorito
      )
    : [];

  return (
    <div className="flex flex-row justify-between items-start space-x-6 ml-5 mr-5">
      <div className="w-1/2 bg-gray-800 rounded-lg pt-5 px-5">
        <h1 className="text-white text-3xl font-bold mb-5">
          PRONÓSTICOS DE PARTIDOS
        </h1>

        <div className="flex gap-2 mb-4">
          {matches.map(({ fecha }) => (
            <button
              key={fecha}
              onClick={() => setSelectedFecha(fecha)}
              className={`px-3 py-1 cursor-pointer rounded font-bold transition ${
                selectedFecha === fecha
                  ? "bg-green-500 text-black"
                  : "bg-gray-600 text-white hover:bg-gray-500"
              }`}
            >
              Fecha {fecha}
            </button>
          ))}
        </div>

        {currentFecha && (
          <>
            <div className="text-left text-green-400 font-bold mb-1">
              FECHA {currentFecha.fecha}
            </div>

            <table className="w-full text-center border-collapse mb-4">
              <thead>
                <tr className="bg-black text-green-500 border-2 border-black">
                  <th className="px-2 py-1">Día</th>
                  <th className="px-2 py-1">Local</th>
                  <th className="px-2 py-1">GL</th>
                  <th className="px-2 py-1">GV</th>
                  <th className="px-2 py-1">Visitante</th>
                </tr>
              </thead>

              <tbody>
                {partidosFiltrados.map(({ id, home, away, date }) => (
                  <tr key={id}>
                    <td className="border-2 border-gray-900 bg-white text-gray-900 font-bold pt-1 pb-1 pl-1 pr-1">
                      {date}
                    </td>
                    <td className="border-2 border-gray-900 bg-white text-gray-900 font-bold">
                      <div className="flex items-center justify-end gap-2 pr-1 pl-1">
                        <span>{home.name}</span>
                        <img className="h-8" src={home.logo} alt="Logo local" />
                      </div>
                    </td>
                    <td className="border-2 bg-sky-500 border-gray-900">
                      <input
                        type="number"
                        className="text-black w-full text-center py-1 border-none outline-none font-bold"
                        placeholder="0"
                        value={predictions[id]?.home || ""}
                        onChange={(e) =>
                          handleInputChange(id, "home", e.target.value)
                        }
                        onWheel={(e) => e.target.blur()}
                      />
                    </td>
                    <td className="border-2 bg-sky-500 border-gray-900">
                      <input
                        type="number"
                        className="text-black w-full text-center py-1 border-none outline-none font-bold"
                        placeholder="0"
                        value={predictions[id]?.away || ""}
                        onChange={(e) =>
                          handleInputChange(id, "away", e.target.value)
                        }
                        onWheel={(e) => e.target.blur()}
                      />
                    </td>
                    <td className="border-2 border-gray-900 bg-white text-gray-900 font-bold">
                      <div className="flex items-center justify-start gap-2 pr-1 pl-1">
                        <img
                          className="h-8"
                          src={away.logo}
                          alt="Logo visitante"
                        />
                        <span>{away.name}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {partidosFiltrados.length === 0 && (
              <p className="text-yellow-400 text-center font-bold">
                Tu equipo no juega en esta fecha
              </p>
            )}

            <div className="text-left py-2">
              <button
                className="bg-green-500 text-black font-bold px-4 py-1 rounded shadow hover:bg-green-600 transition cursor-pointer"
                onClick={handleSavePrediction}
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PronosticoEquipoFav;
