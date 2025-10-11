import React, { useEffect, useState } from "react";
import usePronosticoStore from "../../../store/pronosticosStore";
import useUserStore from "../../../store/usersStore";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Logo from "../../../assets/Botintff.png";

const PronosticoEquipoFav = () => {
  const {
    matches,
    fetchMatchesFavorito,
    guardarPronosticosFavorito,
    guardarPronosticosFavoritoGoleador,
    actualizarPronosticosFavoritoGoleador,
    resultadoComparacion,
    actualizarPronosticos,
    error,
    loading,
  } = usePronosticoStore();

  const {
    usuarios,
    user,
    equipoFavorito,
    equipoFavoritoGoleador,
    getRankingPorFechaFavoritos,
    getRankingPorFechaFavoritosGoleador,
    getUsersWithPuntaje,
    rankingGeneral,
    rankingsFavoritos,
    rankingsFavoritosGoleador,
  } = useUserStore();

  const [predictions, setPredictions] = useState({});
  const [predictionsGoleador, setPredictionsGoleador] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const successMessageFavorito = usePronosticoStore(
    (state) => state.successMessageFavorito
  );
  const successMessageGoleador = usePronosticoStore(
    (state) => state.successMessageGoleador
  );
  const rowsPerPage = 5;

  console.log(user);

  // Filtrar partidos por equipo favorito
  const matchesFavorito = matches
    .map((fecha) => {
      // Filtrar solo los partidos donde participa el equipo favorito
      const partidosFiltrados = fecha.partidos.filter(
        (partido) =>
          partido.home.name === equipoFavorito ||
          partido.away.name === equipoFavorito
      );

      if (partidosFiltrados.length === 0) return null;

      // Retornar fecha + fase + partidos filtrados
      return {
        ...fecha,
        partidos: partidosFiltrados,
        // si tu JSON tiene fecha como número o fase como texto
        label: fecha.fase ? fecha.fase : `Fecha ${fecha.fecha}`,
      };
    })
    .filter(Boolean);

  const matchesFavoritoGoleador = matches
    .map((fecha) => {
      const partidosFiltrados = fecha.partidos.filter(
        (partido) =>
          partido.home.name === equipoFavoritoGoleador ||
          partido.away.name === equipoFavoritoGoleador
      );
      return partidosFiltrados.length > 0
        ? { ...fecha, partidos: partidosFiltrados }
        : null;
    })
    .filter(Boolean);

  const [selectedFecha, setSelectedFecha] = useState(
    matchesFavorito[0]?.fecha || 1
  );
  const [selectedFechaRanking, setSelectedFechaRanking] = useState(
    matches[0]?.fecha || 1
  );
  const [selectedFechaGoleador, setSelectedFechaGoleador] = useState(
    matchesFavoritoGoleador[0]?.fecha || 1
  );

  const currentFecha = matchesFavorito.find((m) => m.fecha === selectedFecha);
  useEffect(() => {
    if (currentFecha && Object.keys(predictions).length === 0) {
      const initialPredictions = {};
      currentFecha.partidos.forEach(({ id }) => {
        initialPredictions[id] = {
          home: "",
          away: "",
          penalesHome: "",
          penalesAway: "",
        };
      });
      setPredictions(initialPredictions);
    }
  }, [currentFecha]);
  const currentFechaRanking = rankingsFavoritos
    .filter((r) => r.fecha === selectedFechaRanking)
    .sort((a, b) => (b.puntos || 0) - (a.puntos || 0));

  const currentFechaRankingGoleador = rankingsFavoritosGoleador
    .filter((r) => r.fecha === selectedFechaRanking)
    .sort((a, b) => (b.puntos || 0) - (a.puntos || 0));

  const currentFechaGoleador = matchesFavoritoGoleador.find(
    (m) => m.fecha === selectedFechaGoleador
  );

  // 🔹 Carga inicial al montar
  useEffect(() => {
    fetchMatchesFavorito();
    actualizarPronosticos();
    getUsersWithPuntaje();
    actualizarPronosticosFavoritoGoleador();
  }, []);

  // 🔹 Actualización ranking al cambiar fecha
  useEffect(() => {
    getRankingPorFechaFavoritos(selectedFechaRanking);
    setPredictions({}); // Limpiar inputs al cambiar de fecha
    setCurrentPage(1);
  }, [selectedFechaRanking]);

  useEffect(() => {
    getRankingPorFechaFavoritosGoleador(selectedFechaRanking);
    setPredictionsGoleador({}); // Limpiar inputs al cambiar de fecha
    setCurrentPage2(1);
  }, [selectedFechaRanking]);

  const handleInputChange = (matchId, team, value) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [team]: value },
    }));
  };

  const handleInputChangeGoleador = (matchId, team, value) => {
    setPredictionsGoleador((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [team]: value },
    }));
  };

  const sortedRankingGoleador = [...(rankingsFavoritosGoleador || [])].sort(
    (a, b) => (b.golesAcertados || 0) - (a.golesAcertados || 0)
  );

  const usuarioEnRanking = currentFechaRanking.find((u) => u.id === user?.id);

  // Si lo encuentra, mostrar sus puntos, si no 0
  const puntosFecha = usuarioEnRanking?.puntos || 0;

  const usuarioEnRankingGoleador = currentFechaRankingGoleador.find(
    (u) => u.id === user?.id
  );

  // Si lo encuentra, mostrar sus puntos, si no 0
  const golesFecha = usuarioEnRankingGoleador?.golesAcertados || 0;

  const filteredRanking =
    currentFechaRanking?.filter((usuario) =>
      usuario.user.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const filteredRanking2 =
    currentFechaRankingGoleador?.filter((usuario) =>
      usuario.user.toLowerCase().includes(searchTerm2.toLowerCase())
    ) || [];

  const paginatedRanking = filteredRanking.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const sortedRanking2 = filteredRanking2.sort(
    (a, b) => (b.golesAcertados || 0) - (a.golesAcertados || 0)
  );

  const paginatedRanking2 = sortedRanking2.slice(
    (currentPage2 - 1) * rowsPerPage,
    currentPage2 * rowsPerPage
  );

  const totalPages = Math.ceil(filteredRanking.length / rowsPerPage) || 1;

  const totalPages2 = Math.ceil(filteredRanking2.length / rowsPerPage) || 1;

  // 🔹 Guardar pronóstico equipo favorito
  const handleSavePrediction = async () => {
    const partidosFecha = currentFecha?.partidos || [];

    const faltantes = partidosFecha.filter(({ id }) => {
      const p = predictions[id];
      return !p || p.home === "" || p.away === "";
    });

    if (faltantes.length > 0) {
      toast.warn("⚠️ Faltan completar goles este pronóstico.");
      //setTimeout(() => setMensaje(""), 3000);
      return;
    }

    const predictionsArray = partidosFecha.map(({ id }) => ({
      matchId: id,
      homeScore: Number(predictions[id].home),
      awayScore: Number(predictions[id].away),
      penalesHome: predictions[id].penalesHome
        ? Number(predictions[id].penalesHome)
        : null,
      penalesAway: predictions[id].penalesAway
        ? Number(predictions[id].penalesAway)
        : null,
    }));

    //setMensaje("⏳ Enviando pronóstico...");
    try {
      await guardarPronosticosFavorito(predictionsArray);
      await getRankingPorFechaFavoritos(selectedFecha);
      toast.success("✅ Pronóstico enviado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al enviar pronóstico");
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  // 🔹 Guardar pronóstico equipo goleador
  const handleSavePredictionGoleador = async () => {
    const partidosFechaGoleador = currentFechaGoleador?.partidos || [];

    const faltantesGoleador = partidosFechaGoleador.filter(
      ({ id, home, away }) => {
        const esLocal = home.name === equipoFavoritoGoleador;
        const esVisitante = away.name === equipoFavoritoGoleador;

        if (esLocal || esVisitante) {
          const p = predictionsGoleador[id];
          return !p || p.goles === "" || p.goles === undefined;
        }
        return false;
      }
    );

    if (faltantesGoleador.length > 0) {
      toast.warn("⚠️ Faltan completar goles para este pronóstico.");
      //setTimeout(() => setMensaje(""), 3000);
      return;
    }

    const predictionsArray2 = partidosFechaGoleador
      .filter(
        ({ home, away }) =>
          home.name === equipoFavoritoGoleador ||
          away.name === equipoFavoritoGoleador
      )
      .map(({ id }) => ({
        matchId: id,
        goles: Number(predictionsGoleador[id].goles),
      }));

    //setMensaje("⏳ Enviando pronóstico...");
    try {
      await guardarPronosticosFavoritoGoleador(predictionsArray2);
      await getRankingPorFechaFavoritosGoleador(selectedFechaGoleador);
      toast.success("✅ Pronóstico enviado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al enviar pronóstico");
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  // Usar rankingFecha y rankingGeneral directamente
  //const puntajesFechaActual = rankingFecha || [];
  const puntajesAcumulados = rankingGeneral || [];

  // Para mostrar los puntajes del usuario actual (primera tabla)
  const puntajesUsuarioActual = user; // Asumiendo que tienes esa estructura

  console.log("a veer", matchesFavorito);

  console.log(equipoFavorito);

  const partidoFavorito = currentFecha?.partidos.find(
    (p) =>
      p.home.name === user.equipoFavorito || p.away.name === user.equipoFavorito
  );

  const partidoFavoritoGoleador = currentFecha?.partidos.find(
    (p) =>
      p.home.name === user.equipoFavoritoGoleador ||
      p.away.name === user.equipoFavoritoGoleador
  );

  return (
    <>
      <motion.div
        className="space-y-10 p-4 "
        initial={{ y: -100, opacity: 0 }} // Empieza arriba y transparente
        animate={{ y: 0, opacity: 1 }} // Baja a su posición original y aparece
        transition={{ duration: 0.8, ease: "easeOut" }} // Suavidad
      >
        <div className="space-y-10 p-4 ">
          <div className="bg-gray-800 rounded-xl font-bold text-xl sm:text-2xl md:text-3xl text-center w-auto max-w-md md:max-w-4xl px-4 sm:px-6 md:px-8 mx-auto">
            <h1 className="text-green-500 py-2">Modo Favorito</h1>
          </div>
          {mensaje && (
            <div className="text-center text-white font-bold bg-black p-2 rounded">
              {mensaje}
            </div>
          )}
          {successMessageFavorito && (
            <p className="text-green-400 text-center">
              {successMessageFavorito}
            </p>
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
          <div className="mx-auto lg:w-4xl md:w-full">
            {/* Tabla de partidos */}
            <div className="w-full bg-black rounded-xl pt-5 px-5 border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
              <div className="text-white flex flex-col sm:flex-row items-center mb-2 bg-black pt-2 pb-2 px-4 sm:w-120 rounded-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
                    EQUIPO FAVORITO CAMPEON:
                  </span>
                </h2>
                {partidoFavorito && (
                  <img
                    className="h-16 sm:h-20 mt-2 sm:mt-0 sm:ml-5"
                    src={
                      partidoFavorito.home.name === user.equipoFavorito
                        ? partidoFavorito.home.logo
                        : partidoFavorito.away.logo
                    }
                    alt={user.equipoFavorito}
                  />
                )}
              </div>

              {/* Selector de Fechas */}
              <div className="w-full overflow-x-auto px-2 mb-4 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
                <div className="flex gap-2 flex-nowrap">
                  {matchesFavorito.map(({ fecha, label }) => (
                    <button
                      key={fecha ?? label} // usamos label si fecha es null
                      onClick={() => setSelectedFecha(fecha)}
                      className={`flex-shrink-0 px-3 py-1 cursor-pointer rounded font-bold transition mb-2 ${
                        selectedFecha === fecha
                          ? "bg-green-500 text-black"
                          : "bg-gray-600 text-white hover:bg-gray-500"
                      }`}
                    >
                      {label} {/* muestra "Fecha 14" o "Cuartos de Final" */}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mostrar solo la fecha actual */}
              {currentFecha && (
                <>
                  <div className="w-full">
                    {/* Tabla de pronósticos */}
                    <table className="w-full text-center border-collapse mb-4 hidden sm:table">
                      <thead>
                        <tr className="bg-black text-green-500 border-2 border-black text-base">
                          <th className="px-2 py-1">Día</th>
                          <th className="px-2 py-1">Local</th>
                          <th className="px-2 py-1">GL</th>
                          <th className="px-2 py-1">GV</th>
                          <th className="px-2 py-1">Visitante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentFecha.partidos.map(
                          ({ id, home, away, date }) => (
                            <tr key={id}>
                              <td className="border-2 border-gray-900 bg-white text-gray-900 font-bold px-1 py-1">
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
                                    handleInputChange(
                                      id,
                                      "home",
                                      e.target.value
                                    )
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
                                    handleInputChange(
                                      id,
                                      "away",
                                      e.target.value
                                    )
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
                          )
                        )}
                      </tbody>
                    </table>

                    {/* --- Sección de penales --- */}
                    {["Octavos", "Cuartos", "Semis", "Final"].includes(
                      currentFecha.fase
                    ) &&
                      currentFecha.partidos.some(
                        ({ id }) =>
                          predictions[id]?.home !== "" &&
                          predictions[id]?.away !== "" &&
                          predictions[id]?.home === predictions[id]?.away
                      ) && (
                        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                          <h3 className="text-lg font-bold mb-2 text-white">
                            Penales
                          </h3>
                          <p className="text-white mb-3">
                            Ingresá los resultados de penales solo si el partido
                            terminó empatado.
                          </p>

                          {currentFecha.partidos.map(({ id, home, away }) => {
                            const isEmpate =
                              predictions[id]?.home !== "" &&
                              predictions[id]?.away !== "" &&
                              predictions[id]?.home === predictions[id]?.away;

                            return (
                              isEmpate && (
                                <div
                                  key={id}
                                  className="flex gap-2 items-center mb-2"
                                >
                                  <span className="text-white">
                                    {home.name} vs {away.name}:
                                  </span>
                                  <input
                                    type="number"
                                    className="border-2 pl-2 bg-sky-500 border-gray-900 text-black w-12 text-center"
                                    placeholder="0"
                                    value={predictions[id]?.penalesHome || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        id,
                                        "penalesHome",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <span className="text-white">-</span>
                                  <input
                                    type="number"
                                    className="border-2 pl-2 bg-sky-500 border-gray-900 text-black w-12 text-center"
                                    placeholder="0"
                                    value={predictions[id]?.penalesAway || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        id,
                                        "penalesAway",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              )
                            );
                          })}
                        </div>
                      )}

                    {/* Cards solo visibles en móviles */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      {currentFecha.partidos.map(({ id, home, away, date }) => (
                        <div
                          key={id}
                          className="bg-white border-2 border-gray-900 rounded-lg p-3 shadow-md"
                        >
                          {/* Fecha arriba */}
                          <div className="text-gray-900 font-bold mb-2 text-center">
                            {date}
                          </div>

                          {/* Fila principal: logos e inputs */}
                          <div className="flex items-center justify-between gap-2">
                            {/* Local */}
                            <div className="flex items-center gap-2">
                              <img
                                className="h-8"
                                src={home.logo}
                                alt="Logo local"
                              />
                              <span className="font-bold">{home.name}</span>
                            </div>

                            {/* Input local */}
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

                            {/* Input visitante */}
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
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{away.name}</span>
                              <img
                                className="h-8"
                                src={away.logo}
                                alt="Logo visitante"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

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

            <div className="mt-10">
              {mensaje && (
                <div className="text-center text-white font-bold bg-black p-2 rounded">
                  {mensaje}
                </div>
              )}
              {successMessageGoleador && (
                <p className="text-green-400 text-center">
                  {successMessageGoleador}
                </p>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl mt-10 px-5 pt-5">
              {currentFechaGoleador && (
                <>
                  <div className="text-white flex flex-col sm:flex-row items-center mb-2 bg-gray-800 pt-2 pb-2 px-4 sm:w-120 rounded-xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
                      <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
                        EQUIPO FAVORITO GOLEADOR:
                      </span>
                    </h2>
                    {partidoFavoritoGoleador && (
                      <img
                        className="h-16 sm:h-20 mt-2 sm:mt-0 sm:ml-5"
                        src={
                          partidoFavoritoGoleador.home.name ===
                          user.equipoFavoritoGoleador
                            ? partidoFavoritoGoleador.home.logo
                            : partidoFavoritoGoleador.away.logo
                        }
                        alt={user.equipoFavoritoGoleador}
                      />
                    )}
                  </div>
                  <div className="w-full overflow-x-auto px-2 mb-4 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
                    <div className="flex gap-2 flex-nowrap">
                      {matchesFavorito.map(({ fecha, label }) => (
                        <button
                          key={fecha ?? label}
                          onClick={() => setSelectedFechaGoleador(fecha)}
                          className={`flex-shrink-0 px-3 py-1 cursor-pointer rounded font-bold transition mb-2 ${
                            selectedFechaGoleador === fecha
                              ? "bg-green-500 text-black"
                              : "bg-gray-600 text-white hover:bg-gray-500"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
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
                      {currentFechaGoleador.partidos.map(
                        ({ id, home, away, date }) => {
                          const esLocal = home.name === equipoFavoritoGoleador;
                          const esVisitante =
                            away.name === equipoFavoritoGoleador;

                          return (
                            <tr key={id}>
                              <td className="border-2 border-gray-900 bg-white text-gray-900 font-bold pt-1 pb-1 pl-1 pr-1">
                                {date}
                              </td>

                              {/* Equipo Local */}
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

                              {/* Goles Local */}
                              <td className="border-2 bg-sky-500 border-gray-900">
                                {esLocal ? (
                                  <input
                                    type="number"
                                    className="text-black w-10 text-center py-1 border-none outline-none font-bold"
                                    placeholder="0"
                                    value={predictionsGoleador[id]?.goles || ""}
                                    onChange={(e) =>
                                      handleInputChangeGoleador(
                                        id,
                                        "goles",
                                        e.target.value
                                      )
                                    }
                                    onWheel={(e) => e.target.blur()}
                                  />
                                ) : (
                                  <input
                                    type="number"
                                    className="text-black w-10 text-center py-1 border-none outline-none font-bold"
                                    placeholder="-"
                                    disabled
                                  />
                                )}
                              </td>

                              {/* Goles Visitante */}
                              <td className="border-2 bg-sky-500 border-gray-900">
                                {esVisitante ? (
                                  <input
                                    type="number"
                                    className="text-black w-10 text-center py-1 border-none outline-none font-bold"
                                    placeholder="0"
                                    value={predictionsGoleador[id]?.goles || ""}
                                    onChange={(e) =>
                                      handleInputChangeGoleador(
                                        id,
                                        "goles",
                                        e.target.value
                                      )
                                    }
                                    onWheel={(e) => e.target.blur()}
                                  />
                                ) : (
                                  <input
                                    type="number"
                                    className="text-black w-10 text-center py-1 border-none outline-none font-bold"
                                    placeholder="-"
                                    disabled
                                  />
                                )}
                              </td>

                              {/* Equipo Visitante */}
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
                          );
                        }
                      )}
                    </tbody>
                  </table>

                  {/* 📌 Versión Card (solo en mobile) */}
                  <div className="flex flex-col gap-3 sm:hidden">
                    {currentFechaGoleador.partidos.map(
                      ({ id, home, away, date }) => {
                        const esLocal = home.name === equipoFavoritoGoleador;
                        const esVisitante =
                          away.name === equipoFavoritoGoleador;

                        return (
                          <div
                            key={id}
                            className="bg-white border-2 border-gray-900 rounded-lg p-3 shadow-md"
                          >
                            {/* Fecha arriba */}
                            <div className="text-gray-900 font-bold mb-2 text-center">
                              {date}
                            </div>

                            {/* Fila principal: logos e inputs */}
                            <div className="flex items-center justify-between gap-2">
                              {/* Local */}
                              <div className="flex items-center gap-2">
                                <img
                                  className="h-8"
                                  src={home.logo}
                                  alt="Logo local"
                                />
                                <span className="font-bold">{home.name}</span>
                              </div>

                              {/* Input local */}
                              {esLocal ? (
                                <input
                                  type="number"
                                  className="text-black w-12 text-center py-1 border-2 border-gray-900 rounded font-bold"
                                  placeholder="0"
                                  value={predictionsGoleador[id]?.home || ""}
                                  onChange={(e) =>
                                    handleInputChangeGoleador(
                                      id,
                                      "home",
                                      e.target.value
                                    )
                                  }
                                  onWheel={(e) => e.target.blur()}
                                />
                              ) : (
                                <input
                                  type="number"
                                  className="text-black w-12 text-center py-1 border-2 border-gray-300 rounded font-bold bg-gray-100"
                                  placeholder="-"
                                  value={predictionsGoleador[id]?.home || ""}
                                  disabled
                                />
                              )}

                              {/* Input visitante */}
                              {esVisitante ? (
                                <input
                                  type="number"
                                  className="text-black w-12 text-center py-1 border-2 border-gray-900 rounded font-bold"
                                  placeholder="0"
                                  value={predictionsGoleador[id]?.away || ""}
                                  onChange={(e) =>
                                    handleInputChangeGoleador(
                                      id,
                                      "away",
                                      e.target.value
                                    )
                                  }
                                  onWheel={(e) => e.target.blur()}
                                />
                              ) : (
                                <input
                                  type="number"
                                  className="text-black w-12 text-center py-1 border-2 border-gray-300 rounded font-bold bg-gray-100"
                                  placeholder="-"
                                  value={predictionsGoleador[id]?.away || ""}
                                  disabled
                                />
                              )}

                              {/* Visitante */}
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{away.name}</span>
                                <img
                                  className="h-8"
                                  src={away.logo}
                                  alt="Logo visitante"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="text-left py-2">
                    <button
                      className="bg-green-500 text-black font-bold px-4 py-1 rounded shadow hover:bg-green-600 transition cursor-pointer"
                      onClick={handleSavePredictionGoleador}
                    >
                      Enviar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-5">
            {/* Ranking x Fecha */}
            <div className="lg:w-md md:w-1/2 p-4 rounded-lg shadow-lg bg-gray-800">
              <h2 className="text-white text-2xl font-bold mb-2 text-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
                  APAXIONADO CAMPEON
                </span>
              </h2>

              <div className="w-full overflow-x-auto px-2 mb-4 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
                <div className="flex space-x-2 flex-nowrap">
                  {matchesFavorito.map(({ fecha, label }) => (
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
                      setCurrentPage(1); // 👈 resetear a página 1 al buscar
                    }}
                    className="w-full md:w-1/2 text-green-500 px-3 py-2 mb-4 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
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
                          Pts
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
                            <img className="h-8" src={Logo} alt="Logo" />
                          </td>
                          <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                            {usuario.puntajeTotal || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className=" mt-4 border-2 border-green-500 rounded-lg py-2 text-xl text-center">
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
            <div className="lg:w-md md:w-1/2 p-4 rounded-lg shadow-lg bg-gray-800">
              <h2 className="text-white text-2xl font-bold mb-2 text-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
                  APAXIONADO GOLEADOR
                </span>
              </h2>

              <div className="w-full overflow-x-auto px-2 mb-4 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
                <div className="flex space-x-2 flex-nowrap">
                  {matchesFavorito.map(({ fecha, label }) => (
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
                    value={searchTerm2}
                    onChange={(e) => {
                      setSearchTerm2(e.target.value);
                      setCurrentPage(1); // 👈 resetear a página 1 al buscar
                    }}
                    className="w-full md:w-1/2 text-green-500 px-3 py-2 mb-4 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
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
                      {paginatedRanking2.map((usuario) => (
                        <tr key={usuario.id} className="border-black border-2">
                          <td className="text-black text-center font-bold px-4 py-2 bg-white">
                            {usuario.user}
                          </td>
                          <td className="text-black text-center font-bold px-4 py-2 bg-white">
                            <img className="h-8" src={Logo} alt="Logo" />
                          </td>
                          <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                            {usuario.golesTotales || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 border-2 border-green-500 rounded-lg py-2 text-xl text-center">
                    <p className="font-bold text-green-500">
                      Tus goles en la fecha {selectedFechaRanking} son{" "}
                      {golesFecha}
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      onClick={() =>
                        setCurrentPage2((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage2 === 1}
                      className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 cursor-pointer disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="text-white px-2">
                      Página {currentPage2} de {totalPages2}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage2((prev) =>
                          Math.min(prev + 1, totalPages2)
                        )
                      }
                      disabled={currentPage2 === totalPages2}
                      className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 disabled:opacity-50 cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PronosticoEquipoFav;
