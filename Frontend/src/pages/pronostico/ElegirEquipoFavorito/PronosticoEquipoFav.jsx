import React, { useEffect, useState } from "react";
import usePronosticoStore from "../../../store/pronosticosStore";
import useUserStore from "../../../store/usersStore";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Logo from "../../../assets/Botintff.png";
import Logo2 from "../../../assets/botinoro.png";
import Logo3 from "../../../assets/botinbronce.png";
import Logo4 from "../../../assets/botinplatino.jpg";

const PronosticoEquipoFav = () => {
  const {
    matches,
    fetchMatchesFavorito,
    guardarPronosticosFavorito,
    guardarPronosticosFavoritoGoleador,
    actualizarPronosticosFavoritoGoleador,
    fetchPronosticosFavoritosByFecha,
    fetchPronosticosFavoritosGoleadorByFecha,
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
  const pronosticos = usePronosticoStore((state) => state.pronosticos);
  const pronosticosGoleador = usePronosticoStore(
    (state) => state.pronosticosGoleador
  );
  const [predictions, setPredictions] = useState({});
  const [predictionsGoleador, setPredictionsGoleador] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const successMessageFavorito = usePronosticoStore(
    (state) => state.successMessageFavorito
  );
  const successMessageGoleador = usePronosticoStore(
    (state) => state.successMessageGoleador
  );
  const rowsPerPage = 11;

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

  // 🏆 ORDENAR ANTES DE PAGINAR
  const sortedRanking = [...filteredRanking].sort(
    (a, b) => (b.puntajeTotal || 0) - (a.puntajeTotal || 0)
  );

  const sortedRanking2 = [...filteredRanking2].sort(
    (a, b) => (b.golesTotales || 0) - (a.golesTotales || 0)
  );

  // 📄 PAGINAR DESPUÉS DE ORDENAR
  const paginatedRanking = sortedRanking.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const paginatedRanking2 = sortedRanking2.slice(
    (currentPage2 - 1) * rowsPerPage,
    currentPage2 * rowsPerPage
  );

  // 🔢 Total de páginas
  const totalPages = Math.ceil(sortedRanking.length / rowsPerPage) || 1;
  const totalPages2 = Math.ceil(sortedRanking2.length / rowsPerPage) || 1;

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
          // ✅ Usamos golesAcertados en lugar de goles
          return (
            !p || p.golesAcertados === "" || p.golesAcertados === undefined
          );
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
        golesAcertados: Number(predictionsGoleador[id].golesAcertados), // ✅ coincide con el modelo
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

  const partidoFavorito = currentFecha?.partidos.find(
    (p) =>
      p.home.name === user.equipoFavorito || p.away.name === user.equipoFavorito
  );

  const partidoFavoritoGoleador = currentFecha?.partidos.find(
    (p) =>
      p.home.name === user.equipoFavoritoGoleador ||
      p.away.name === user.equipoFavoritoGoleador
  );

  const getLogoEquipoFavorito = (equipo, matches) => {
    for (let fecha of matches) {
      const partido = fecha.partidos.find(
        (p) => p.home.name === equipo || p.away.name === equipo
      );
      if (partido) {
        return partido.home.name === equipo
          ? partido.home.logo
          : partido.away.logo;
      }
    }
    return ""; // si no se encuentra
  };

  const getLogoEquipoFavoritoGoleador = (equipo, matches) => {
    for (let fecha of matches) {
      const partido = fecha.partidos.find(
        (p) => p.home.name === equipo || p.away.name === equipo
      );
      if (partido) {
        return partido.home.name === equipo
          ? partido.home.logo
          : partido.away.logo;
      }
    }
    return ""; // si no se encuentra
  };

  useEffect(() => {
    if (!selectedFecha) return;
    fetchPronosticosFavoritosByFecha(selectedFecha); // carga del backend
  }, [selectedFecha]);

  useEffect(() => {
    if (!selectedFechaGoleador) return;
    fetchPronosticosFavoritosGoleadorByFecha(selectedFechaGoleador); // carga del backend
  }, [selectedFechaGoleador]);

  useEffect(() => {
    if (pronosticos && Object.keys(pronosticos).length > 0) {
      setPredictions(pronosticos);
    }
  }, [pronosticos]);

  useEffect(() => {
    if (pronosticosGoleador && Object.keys(pronosticosGoleador).length > 0) {
      setPredictionsGoleador(pronosticosGoleador);
    }
  }, [pronosticosGoleador]);

  const fechaFinal = matches.find((fecha) =>
    fecha.partidos.some((p) => p.penales)
  );
  const partidosFechaFinal = fechaFinal?.partidos || [];

  const getEquipoCampeon = (partidos = []) => {
    const final = partidos.find((p) => p.penales);
    if (!final) return null;
    const { home, away, penales } = final;
    if (penales.home > penales.away) return home.name;
    if (penales.away > penales.home) return away.name;
    return null;
  };

  const equipoCampeon = getEquipoCampeon(partidosFechaFinal);

  const usuariosConEquipoCampeon = currentFechaRanking
    .filter((u) => u.equipoFavorito === equipoCampeon)
    .sort((a, b) => (b.puntos || 0) - (a.puntos || 0));

  const usuariosConEquipoGoleador = currentFechaRanking
    .filter((u) => u.equipoFavoritoGoleador === equipoCampeon)
    .sort((a, b) => (b.golesAcertados || 0) - (a.golesAcertados || 0));

  console.log(paginatedRanking2);

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
              <div>
                <button
                  className="bg-green-500 mb-5 ml-2  font-bold cursor-pointer py-1 px-2 rounded-md"
                  onClick={() => setOpen(true)}
                >
                  Reglamento
                </button>
              </div>

              {open && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                  {/* Contenido del modal */}
                  <div className="bg-gray-900 text-white rounded-xl p-6 max-w-lg w-11/12 shadow-2xl border border-green-500">
                    <h2 className="text-2xl font-bold mb-4 text-green-400 text-center">
                      Reglamento del Juego
                    </h2>
                    <p className="text-gray-200 text-justify">
                      Aquí podés incluir el reglamento del torneo o tus reglas
                      personalizadas. Por ejemplo:
                      <br />
                      <br />• 3 puntos por acierto exacto.
                      <br />• 1 punto por acertar ganador o empate.
                      <br />• 0 puntos si no acierta.
                      <br />
                      <br />
                      Recordá que los pronósticos deben hacerse antes del inicio
                      del partido.
                    </p>

                    {/* Botón para cerrar */}
                    <div className="flex justify-center mt-6">
                      <button
                        className="bg-green-500 cursor-pointer hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition"
                        onClick={() => setOpen(false)}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}

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

                          {/* Contenedor principal horizontal */}
                          <div className="flex items-start justify-between gap-6">
                            {/* Local */}
                            <div className="flex flex-col items-center flex-1">
                              <img
                                className="h-10 mb-1"
                                src={home.logo}
                                alt="Logo local"
                              />
                              <span className="font-bold text-gray-900 mb-2 text-center">
                                {home.name}
                              </span>
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
                            </div>

                            {/* VS */}
                            <div className="flex items-center justify-center">
                              <span className="font-bold text-gray-800">
                                VS
                              </span>
                            </div>

                            {/* Visitante */}
                            <div className="flex flex-col items-center flex-1">
                              <img
                                className="h-10 mb-1"
                                src={away.logo}
                                alt="Logo visitante"
                              />
                              <span className="font-bold text-gray-900 mb-2 text-center">
                                {away.name}
                              </span>
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

            <div className="w-full bg-black rounded-xl pt-5 px-5 border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
              {currentFechaGoleador && (
                <>
                  <div className="text-white flex flex-col sm:flex-row items-center mb-2  pt-2 pb-2 px-4 sm:w-120 rounded-xl">
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
                                    value={
                                      predictionsGoleador[id]?.golesAcertados ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleInputChangeGoleador(
                                        id,
                                        "golesAcertados",
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
                                    value={
                                      predictionsGoleador[id]?.golesAcertados ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleInputChangeGoleador(
                                        id,
                                        "golesAcertados",
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

                            {/* Fila principal: logos e input */}
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

                              {/* Input goles */}
                              {esLocal || esVisitante ? (
                                <input
                                  type="number"
                                  className="text-black w-12 text-center py-1 border-2 border-gray-900 rounded font-bold"
                                  placeholder="0"
                                  value={
                                    predictionsGoleador[id]?.golesAcertados ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleInputChangeGoleador(
                                      id,
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
                                  value=""
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

                  <div className="text-left py-2 mb-4">
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

          <div className="flex flex-col md:flex-row justify-center gap-5 ">
            {/* Ranking x Fecha */}
            <div className="lg:w-md md:w-1/2 p-4 w-full bg-black rounded-xl border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
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
                    className="w-full md:w-1/2 text-white font-semibold px-3 py-2 mb-4 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />

                  <div className="overflow-x-auto max-w-full sm:overflow-visible">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-black border-2">
                          <th className="text-xl text-green-500 bg-black px-4 py-2">
                            Apaxionado
                          </th>
                          <th className="text-transparent bg-clip-text text-xl bg-gradient-to-b from-gray-800 to-gray-100 px-4 py-2">
                            Escudo
                          </th>
                          <th className="text-green-500 bg-black px-4 py-2">
                            Puntos
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRanking.map((usuario) => {
                          let premio;

                          // Solo mostrar premios en la FECHA 18
                          if (paginatedRanking[0]?.fecha === 18) {
                            if (
                              equipoCampeon &&
                              usuario.equipoFavorito === equipoCampeon
                            ) {
                              // Obtenemos todos los puntajes ordenados de mayor a menor (sin duplicados)
                              const puntajesUnicos = [
                                ...new Set(
                                  filteredRanking
                                    .map((u) => u.puntajeTotal || 0)
                                    .sort((a, b) => b - a)
                                ),
                              ];

                              // Buscamos el "rango" del puntaje del usuario
                              const rankIndex = puntajesUnicos.indexOf(
                                usuario.puntajeTotal || 0
                              );

                              // Asignamos premios según el rango de puntaje
                              if (rankIndex === 0) {
                                // 🥇 Máximo puntaje (pueden ser varios usuarios)
                                premio = (
                                  <img
                                    className="h-8 mx-auto"
                                    src={Logo4}
                                    alt="Botín Platino"
                                  />
                                );
                              } else if (rankIndex >= 1 && rankIndex <= 5) {
                                // 🥈 Segundo al sexto mejor puntaje
                                premio = (
                                  <img
                                    className="h-8 mx-auto"
                                    src={Logo2}
                                    alt="Botín Oro"
                                  />
                                );
                              } else if (rankIndex >= 6 && rankIndex <= 8) {
                                // 🥉 Séptimo al noveno mejor puntaje
                                premio = (
                                  <img
                                    className="h-8 mx-auto"
                                    src={Logo}
                                    alt="Botín TFF"
                                  />
                                );
                              } else if (rankIndex >= 9 && rankIndex <= 10) {
                                // 🎖️ Décimo al undécimo mejor puntaje
                                premio = (
                                  <img
                                    className="h-8 mx-auto"
                                    src={Logo3}
                                    alt="Botín Bronce"
                                  />
                                );
                              } else {
                                // Otros jugadores del equipo campeón
                                premio = (
                                  <span className="font-bold text-green-500">
                                    CAMPEÓN
                                  </span>
                                );
                              }
                            } else {
                              // 🚫 Usuario sin equipo campeón
                              premio = <span className="text-gray-400">-</span>;
                            }
                          } else {
                            // ❌ No es la fecha 18 → no mostrar premio
                            premio = <span className="text-gray-400">-</span>;
                          }

                          return (
                            <tr
                              key={usuario.id}
                              className="border-black border-2"
                            >
                              {/* Nombre y logo del equipo favorito */}
                              <td className="text-black px-4 py-2 bg-white">
                                <div className="flex items-center gap-2 justify-center">
                                  <span className="font-bold">
                                    {usuario.user}
                                  </span>
                                  {usuario.equipoFavorito && (
                                    <img
                                      src={getLogoEquipoFavorito(
                                        usuario.equipoFavorito,
                                        matches
                                      )}
                                      alt={usuario.equipoFavorito}
                                      className="h-6 w-6 object-contain"
                                    />
                                  )}
                                </div>
                              </td>

                              {/* Premio */}
                              <td className="text-black text-center font-bold px-4 py-2 bg-white">
                                {premio}
                              </td>

                              {/* Puntos */}
                              <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                                {usuario.puntajeTotal || 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className=" mt-4 border-2 bg-gray-900 border-green-500 rounded-lg py-2 text-xl text-center">
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
            <div className="lg:w-md md:w-1/2 p-4 bg-black rounded-xl border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
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
                    className="w-full md:w-1/2 text-white font-semibold px-3 py-2 mb-4 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
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
                        {paginatedRanking2.map((usuario) => {
                          let premio;

                          // ✅ Mostrar premios solo en la FECHA 18
                          if (paginatedRanking2[0]?.fecha === 18) {
                            // Verificamos si hay equipo campeón y si el usuario pertenece a ese equipo
                            if (
                              equipoCampeon &&
                              usuario.equipoFavoritoGoleador === equipoCampeon
                            ) {
                              // 🔢 Obtenemos todos los puntajes únicos (goles totales) de mayor a menor
                              const puntajesUnicos = [
                                ...new Set(
                                  filteredRanking2
                                    .map((u) => u.golesTotales || 0)
                                    .sort((a, b) => b - a)
                                ),
                              ];

                              // 📊 Buscamos el "rango" del puntaje del usuario
                              const rankIndex = puntajesUnicos.indexOf(
                                usuario.golesTotales || 0
                              );

                              // 🏆 Asignamos premios según el rango del puntaje
                              if (rankIndex === 0) {
                                // 🥇 Mejor puntaje → Botín Platino
                                premio = (
                                  <img
                                    className="h-8 mx-auto"
                                    src={Logo4}
                                    alt="Botín Platino"
                                  />
                                );
                              } else if (rankIndex >= 1 && rankIndex <= 5) {
                                // 🥈 Segundo al sexto mejor puntaje → Botín Oro
                                premio = (
                                  <img
                                    className="h-8 mx-auto"
                                    src={Logo2}
                                    alt="Botín Oro"
                                  />
                                );
                              } else if (rankIndex >= 6 && rankIndex <= 8) {
                                // 🥉 Séptimo al noveno → Botín TFF
                                premio = (
                                  <img
                                    className="h-8 mx-auto"
                                    src={Logo}
                                    alt="Botín TFF"
                                  />
                                );
                              } else if (rankIndex >= 9 && rankIndex <= 10) {
                                // 🎖️ Décimo al undécimo → Botín Bronce
                                premio = (
                                  <img
                                    className="h-8 mx-auto"
                                    src={Logo3}
                                    alt="Botín Bronce"
                                  />
                                );
                              } else {
                                // 🟢 Otros del equipo campeón → texto “GOLEADOR”
                                premio = (
                                  <span className="font-bold text-green-500">
                                    GOLEADOR
                                  </span>
                                );
                              }
                            } else {
                              // 🚫 Usuario sin equipo campeón
                              premio = <span className="text-gray-400">-</span>;
                            }
                          } else {
                            // ❌ No es la fecha 18 → sin premio
                            premio = <span className="text-gray-400">-</span>;
                          }

                          return (
                            <tr
                              key={usuario.id}
                              className="border-black border-2"
                            >
                              {/* Nombre y logo del equipo favorito */}
                              <td className="text-black px-4 py-2 bg-white">
                                <div className="flex items-center gap-2 justify-center">
                                  <span className="font-bold">
                                    {usuario.user}
                                  </span>
                                  {usuario.equipoFavoritoGoleador && (
                                    <img
                                      src={getLogoEquipoFavorito(
                                        usuario.equipoFavoritoGoleador,
                                        matches
                                      )}
                                      alt={usuario.equipoFavoritoGoleador}
                                      className="h-6 w-6 object-contain"
                                    />
                                  )}
                                </div>
                              </td>

                              {/* Premio */}
                              <td className="text-black text-center font-bold px-4 py-2 bg-white">
                                {premio}
                              </td>

                              {/* Goles Totales */}
                              <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                                {usuario.golesTotales || 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 border-2 border-green-500 bg-gray-900 rounded-lg py-2 text-xl text-center">
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
