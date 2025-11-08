import React, { useEffect, useState } from "react";
import usePronosticoStore from "../../store/pronosticosStore";
import useUserStore from "../../store/usersStore";
import Rankings from "./rankings/Rankings";
import Logo from "../../assets/Botintff.png";

import { toast } from "react-toastify";
import ElegirEquipo from "./ElegirEquipoFavorito/ElegirEquipo";

const PronosticoComponent = () => {
  const {
    matches,
    fetchMatches,
    guardarPronosticos,
    resultadoComparacion,
    actualizarPronosticos,
    fetchPronosticosByFecha,
    error,
    loading,
  } = usePronosticoStore();
  const {
    usuarios,
    user,
    getRankingPorFecha,
    getUsersWithPuntaje,
    rankingGeneral,
    rankingFecha,
  } = useUserStore();
  const pronosticos = usePronosticoStore((state) => state.pronosticos);
  const [predictions, setPredictions] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedFecha, setSelectedFecha] = useState(matches[0]?.fecha || 1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFechaRanking, setSelectedFechaRanking] = useState(
    matches[0]?.fecha || 1
  );
  const [mensaje, setMensaje] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const rowsPerPage = 8;

  const currentFecha = matches.find((m) => m.fecha === selectedFecha);
  const currentFechaRanking = rankingFecha
    .filter((r) => r.fecha === selectedFechaRanking)
    .sort((a, b) => (b.puntos || 0) - (a.puntos || 0));

  const successMessage = usePronosticoStore((state) => state.successMessage);

  useEffect(() => {
    // Ejecuta la carga inicial
    setCurrentPage(1);
    setCurrentPage2(1);
    fetchMatches();
    actualizarPronosticos();
    getUsersWithPuntaje();
    getRankingPorFecha(selectedFechaRanking);
  }, [selectedFechaRanking]);

  const handleInputChange = (matchId, team, value) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const sortedRanking = [...(rankingFecha || [])].sort(
    (a, b) => (b.puntos || 0) - (a.puntos || 0)
  );

  const filteredRanking =
    currentFechaRanking?.filter((usuario) =>
      usuario.user.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const paginatedRanking = filteredRanking.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const puntosFecha =
    paginatedRanking.find((u) => u.id === user?.id)?.puntos || 0;

  const golesFecha =
    paginatedRanking.find((u) => u.id === user?.id)?.golesFecha || 0;

  const paginatedRanking2 = filteredRanking.slice(
    (currentPage2 - 1) * rowsPerPage,
    currentPage2 * rowsPerPage
  );

  const totalPages = Math.ceil(filteredRanking.length / rowsPerPage) || 1;

  const handleSavePrediction = async () => {
    const partidosFecha = currentFecha?.partidos || [];
    const faltantes = partidosFecha.filter(({ id }) => {
      const p = predictions[id];
      return !p || p.home === undefined || p.away === undefined;
    });

    if (faltantes.length > 0) {
      toast.warn("⚠️ Faltan completar goles para algunos partidos.");
      //setTimeout(() => setMensaje(""), 3000);
      return;
    }

    const predictionsArray = partidosFecha.map(({ id }) => ({
      matchId: id,
      homeScore: Number(predictions[id].home),
      awayScore: Number(predictions[id].away),
    }));

    //setLocalLoading(true);
    //setMensaje("⏳ Enviando pronóstico...");

    try {
      await guardarPronosticos(predictionsArray);
      await getRankingPorFecha(selectedFecha);
      toast.success("✅ Pronóstico enviado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al enviar pronóstico");
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const matchesFixture = matches
    .map((fecha) => {
      // Retornar fecha + fase + partidos filtrados
      return {
        ...fecha,
        partidos: matches,
        // si tu JSON tiene fecha como número o fase como texto
        label: fecha.fase ? fecha.fase : `Fecha ${fecha.fecha}`,
      };
    })
    .filter(Boolean);

  // Usar rankingFecha y rankingGeneral directamente
  const puntajesFechaActual = rankingFecha || [];
  const puntajesAcumulados = rankingGeneral || [];

  // Para mostrar los puntajes del usuario actual (primera tabla)
  const puntajesUsuarioActual = user; // Asumiendo que tienes esa estructura
  useEffect(() => {
    if (!selectedFecha) return;
    fetchPronosticosByFecha(selectedFecha); // carga del backend
  }, [selectedFecha]);

  useEffect(() => {
    if (pronosticos && Object.keys(pronosticos).length > 0) {
      setPredictions(pronosticos);
    }
  }, [pronosticos]);

  return (
    <>
      <ElegirEquipo />

      <div className="space-y-10 p-4  ">
        <div className="bg-gray-800 rounded-xl font-bold text-xl sm:text-2xl md:text-3xl text-center w-auto max-w-md md:max-w-4xl px-4 sm:px-6 md:px-8 mx-auto">
          <h1 className="text-green-500 py-2">Modo Copa</h1>
        </div>
        {mensaje && (
          <div className="text-center text-white font-bold bg-black p-2 rounded">
            {mensaje}
          </div>
        )}
        {successMessage && (
          <p className="text-green-400 text-center">{successMessage}</p>
        )}

        {/* Resultados comparación */}
        {resultadoComparacion?.map((resultado, index) => (
          <div
            key={index}
            style={{ color: resultado.acertado ? "green" : "red" }}
          >
            <p>
              Partido {index + 1}:{" "}
              {resultado.acertado ? "✅ Acertaste" : "❌ Fallaste"}
            </p>
            <p>
              Pronóstico: {resultado.pronostico.homeScore} -{" "}
              {resultado.pronostico.awayScore}
            </p>
            <p>
              Resultado Real: {resultado.resultadoReal.homeScore} -{" "}
              {resultado.resultadoReal.awayScore}
            </p>
          </div>
        ))}

        {/* Primer container horizontal */}
        <div className=" px-4 md:px-20">
          {/* Contenedor principal */}
          <div className="mx-auto lg:w-3xl md:w-full w-full bg-black rounded-xl pt-5 px-5 border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
            <h1 className="text-white text-2xl font-bold mb-5 text-center md:text-left">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
                FIXTURE
              </span>
            </h1>

            {/* Selector de Fechas */}
            <div className="w-full overflow-x-auto px-2 mb-4 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
              <div className="flex gap-2 flex-nowrap mb-2">
                {matchesFixture.map(({ fecha, label }) => (
                  <button
                    key={fecha ?? label}
                    onClick={() => setSelectedFecha(fecha)}
                    className={`flex-shrink-0 px-3 py-1 cursor-pointer rounded font-bold transition ${
                      selectedFecha === fecha
                        ? "bg-green-500 text-black"
                        : "bg-gray-600 text-white hover:bg-gray-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mostrar solo la fecha actual */}
            {currentFecha && (
              <>
                {/* Tabla Desktop */}
                <table className="hidden md:table w-full text-center border-collapse mb-4">
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
                    {currentFecha.partidos.map(({ id, home, away, date }) => (
                      <tr key={id}>
                        <td className="border-2 border-gray-900 w-54 bg-white text-gray-900 font-bold pt-1 pb-1 pl-1 pr-1">
                          {date}
                        </td>
                        <td className="border-2 border-gray-900 bg-white text-gray-900 font-bold">
                          <div className="flex items-center justify-end gap-2 pr-1 pl-1">
                            <span>{home.name}</span>
                            <img
                              className="h-8"
                              src={home.logo}
                              alt="Logo local"
                            />
                          </div>
                        </td>
                        <td className="border-2 bg-sky-500 border-gray-900">
                          <input
                            type="number"
                            className="text-black w-10 text-center py-1 border-none outline-none font-bold"
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
                            className="text-black w-10 text-center py-1 border-none outline-none font-bold"
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

                {/* Cards Mobile */}
                <div className="md:hidden flex flex-col gap-3 mb-4">
                  {currentFecha.partidos.map(({ id, home, away, date }) => (
                    <div
                      key={id}
                      className="bg-white border-2 border-gray-900 rounded-lg p-3 shadow-md"
                    >
                      {/* Fecha arriba */}
                      <div className="text-gray-900 font-bold mb-2 text-center">
                        {date}
                      </div>

                      {/* Local vs Visitante */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Local */}
                        <div className="flex flex-col items-center gap-2">
                          <span className="font-bold">{home.name}</span>
                          <img
                            className="h-8"
                            src={home.logo}
                            alt="Logo local"
                          />
                        </div>

                        {/* Goles Local */}
                        <input
                          type="number"
                          className="text-black w-12 text-center py-1 border-2 border-gray-900 rounded font-bold"
                          placeholder="0"
                          value={predictions[id]?.home || ""}
                          onChange={(e) =>
                            handleInputChange(id, "home", e.target.value)
                          }
                          onWheel={(e) => e.target.blur()}
                        />

                        {/* VS */}
                        <span className="font-bold text-gray-700">vs</span>

                        {/* Goles Visitante */}
                        <input
                          type="number"
                          className="text-black w-12 text-center py-1 border-2 border-gray-900 rounded font-bold"
                          placeholder="0"
                          value={predictions[id]?.away || ""}
                          onChange={(e) =>
                            handleInputChange(id, "away", e.target.value)
                          }
                          onWheel={(e) => e.target.blur()}
                        />

                        {/* Visitante */}
                        <div className="flex flex-col items-center gap-2">
                          <img
                            className="h-8"
                            src={away.logo}
                            alt="Logo visitante"
                          />
                          <span className="font-bold">{away.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botón Enviar */}
                <div className="text-left py-2 mb-4">
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

        <div className="flex flex-col md:flex-row justify-center gap-5 px-4">
          {/* Ranking x Fecha */}
          <div className="lg:w-md md:w-1/2 p-4 w-full bg-black rounded-xl border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
            <h2 className="text-white text-2xl font-bold mb-2 text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
                RANKING X FECHA
              </span>
            </h2>

            {/* Selector de Fechas */}
            <div className="w-full overflow-x-auto px-2 mb-4 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
              <div className="flex space-x-2 flex-nowrap">
                {matchesFixture.map(({ fecha, label }) => (
                  <button
                    key={fecha ?? label}
                    onClick={() => setSelectedFechaRanking(fecha)}
                    className={`flex-shrink-0 px-4 py-1 rounded font-bold transition cursor-pointer mb-4 ${
                      selectedFechaRanking === fecha
                        ? "bg-green-500 text-black"
                        : "bg-gray-600 text-white hover:bg-gray-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {currentFechaRanking && (
              <>
                <input
                  type="text"
                  placeholder="Buscar apaxionado..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-1/2 text-white px-3 py-2 mb-4 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <div className="overflow-x-auto max-w-full sm:overflow-visible">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-black border-2">
                        <th className="text-xl text-green-500 bg-black px-4 py-2">
                          Apaxionado
                        </th>
                        <th className="text-green-500 bg-black px-4 py-2">
                          Premio
                        </th>
                        <th className="text-green-500 bg-black px-4 py-2">
                          Puntos
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRanking.map((usuario) => (
                        <tr key={usuario.id} className="border-black border-2">
                          <td className="text-black text-center font-bold px-4 py-2 bg-white">
                            {usuario.user}
                          </td>
                          <td className="text-black text-center font-bold px-4 py-2 bg-white">
                            <img
                              className="h-8 mx-auto"
                              src={Logo}
                              alt="Logo"
                            />
                          </td>
                          <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                            {usuario.puntos || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 border-2 bg-gray-900 border-green-500 rounded-lg py-2 text-xl text-center">
                  <p className="font-bold text-green-500">
                    Tus puntos en la fecha {selectedFechaRanking} son{" "}
                    {puntosFecha}
                  </p>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 cursor-pointer disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-white px-2">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 disabled:opacity-50 cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Ranking x Goles */}
          <div className="lg:w-md md:w-1/2 p-4 w-full bg-black rounded-xl  border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
            <h2 className="text-white text-2xl font-bold mb-2 text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
                RANKING X FECHA
              </span>
            </h2>

            {/* Selector de Fechas */}
            <div className="w-full overflow-x-auto px-2 mb-4 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
              <div className="flex space-x-2 flex-nowrap">
                {matchesFixture.map(({ fecha, label }) => (
                  <button
                    key={fecha ?? label}
                    onClick={() => setSelectedFechaRanking(fecha)}
                    className={`flex-shrink-0 px-4 py-1 rounded font-bold transition cursor-pointer mb-4 ${
                      selectedFechaRanking === fecha
                        ? "bg-green-500 text-black"
                        : "bg-gray-600 text-white hover:bg-gray-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {currentFechaRanking && (
              <>
                <input
                  type="text"
                  placeholder="Buscar apaxionado..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-1/2 text-white px-3 py-2 mb-4 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <div className="overflow-x-auto max-w-full sm:overflow-visible">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-black border-2">
                        <th className="text-xl text-green-500 bg-black px-4 py-2">
                          Apaxionado
                        </th>
                        <th className="text-green-500 bg-black px-4 py-2">
                          Premio
                        </th>
                        <th className="text-green-500 bg-black px-4 py-2">
                          Goles
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...paginatedRanking]
                        .sort(
                          (a, b) => (b.golesFecha || 0) - (a.golesFecha || 0)
                        )
                        .map((usuario) => (
                          <tr
                            key={usuario.id}
                            className="border-black border-2"
                          >
                            <td className="text-black text-center font-bold px-4 py-2 bg-white">
                              {usuario.user}
                            </td>
                            <td className="text-black text-center font-bold px-4 py-2 bg-white">
                              <img className="h-8" src={Logo} alt="Logo" />
                            </td>
                            <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                              {usuario.golesFecha || 0}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 border-2 bg-gray-900 border-green-500 rounded-lg py-2 px-1 text-xl text-center">
                  <p className="font-bold text-green-500">
                    Tus goles en la fecha {selectedFechaRanking} son{" "}
                    {golesFecha}
                  </p>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 cursor-pointer disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-white px-2">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 disabled:opacity-50 cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Segundo container horizontal */}
        <Rankings />
      </div>
    </>
  );
};

export default PronosticoComponent;
