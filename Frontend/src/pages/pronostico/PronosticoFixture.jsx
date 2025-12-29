import React, { useEffect, useState } from "react";
import usePronosticoStore from "../../store/pronosticosStore";
import useUserStore from "../../store/usersStore";

import Logo from "../../assets/Botintff.png";
import Logo2 from "../../assets/brazaletepro2.png";
import Logo3 from "../../assets/botinbronce.png";
import Logo4 from "../../assets/botinplatino.jpg";
import Logo5 from "../../assets/3.png";

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
    rankingsFavoritos,
    rankingsFavoritosGoleador,
    rankingFecha,
  } = useUserStore();
  const pronosticos = usePronosticoStore((state) => state.pronosticos);
  const [predictions, setPredictions] = useState({});
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
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

  const currentFechaRanking = [...rankingFecha]
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
      penalesHome: predictions[id].penalesHome
        ? Number(predictions[id].penalesHome)
        : null,
      penalesAway: predictions[id].penalesAway
        ? Number(predictions[id].penalesAway)
        : null,
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
          <div className="mx-auto lg:w-4xl md:w-full w-full bg-black rounded-xl pt-5 px-5 border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
            <h1 className="text-white text-2xl font-bold mb-5 text-center md:text-left">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
                FIXTURE
              </span>
            </h1>

            <div className="flex mb-5">
              <img className="h-15 object-contain" src={Logo5} alt="Logo" />
              <button
                className="bg-green-500 mb-5 mt-4  font-bold cursor-pointer py-1 px-2 rounded-md"
                onClick={() => setOpen(true)}
              >
                Reglamento
              </button>
            </div>

            {open && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                {/* Contenido del modal */}
                <div className="bg-gray-900 text-white rounded-xl p-6 max-w-lg w-11/12 shadow-2xl border border-green-500">
                  <h2 className="text-2xl font-bold mb-4 text-green-500 text-center">
                    Fixture
                  </h2>
                  <p className="text-gray-200 text-justify">
                    Los APAXIONADOS pronostican los partidos HASTA 30 MINUTOS
                    ANTES del comienzo del 1er partido de cada fecha para sumar
                    PUNTOS y GOLES.
                    <br />
                    <br />
                    Se toma el tiempo de 90 minutos + tiempo adicionado + tiempo
                    extra en caso que haya.
                    <br />
                    <br />
                    Son validos los goles desde el punto de penal para definir
                    una fase.
                    <br />
                    <br />
                    Si se suspende un partido de la fecha antes del inicio o
                    durante por lluvia o cualquier motivo, será nulo para la
                    fehca en juego.
                    <br />
                    <br />
                    Si será valido el partido suspendido para sumar GOLES o
                    PUNTOS en APAXIONADO GOLEADOR DE LA COPA, APAXIONADO CAMPEÓN
                    DE LA COPA y RANKING GENERAL DE LA COPA.
                    <br />
                    <br />
                    Si se juega dentro o en la ultima fecha del torneo.
                    <br />
                    Si surgue otra situación del partido o torneo TFF decidirá.
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
                          <div className="flex items-center w-full px-1">
                            {/* Apodo a la izquierda */}
                            <span className="flex-1 text-left font-semibold truncate">
                              {home.apodo}
                            </span>

                            {/* Logo + sigla juntos a la derecha */}
                            <div className="flex items-center gap-1">
                              <img
                                className="h-7 w-7 shrink-0"
                                src={home.logo}
                                alt="Logo local"
                              />
                              <span className="font-extrabold uppercase text-sm">
                                {home.name}
                              </span>
                            </div>
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
                          <div className="flex items-center w-full px-1">
                            {/* Logo + sigla juntos a la izquierda */}
                            <div className="flex items-center gap-1">
                              <span className="font-extrabold uppercase text-sm">
                                {away.name}
                              </span>
                              <img
                                className="h-7 w-7 shrink-0"
                                src={away.logo}
                                alt="Logo visitante"
                              />
                            </div>

                            {/* Nombre a la derecha */}
                            <span className="flex-1 text-right font-semibold truncate">
                              {away.apodo}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                      <h3 className="text-lg font-bold mb-2 text-green-500">
                        PENALES
                      </h3>
                      <p className="text-white mb-3">
                        Ingresá el pronostico de los penales de ambos de los
                        equipos antes del inicio de la fecha del partido que
                        consideres que va a ser empate.
                        <br />
                        8vos 4tos semifinal final
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

            <div className="flex mb-5">
              <img className="h-15 object-contain" src={Logo5} alt="Logo" />
              <button
                className="bg-green-500 mb-5 mt-4  font-bold cursor-pointer py-1 px-2 rounded-md"
                onClick={() => setOpen2(true)}
              >
                Reglamento
              </button>
            </div>

            {open2 && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                {/* Contenido del modal */}
                <div className="bg-gray-900 text-white rounded-xl p-6 max-w-lg w-11/12 shadow-2xl border border-green-500">
                  <h2 className="text-2xl font-bold mb-4 text-green-500 text-center">
                    Puntos
                  </h2>
                  <p className="text-gray-200 text-justify">
                    Es la suma obtenida de PUNTOS en el total de partidos por
                    fechas.
                    <br />
                    BRAZALETE TFF lo conquistara el/los APAXIONADO/S entre las
                    primeras 8 posiciones por definición de PUNTOS por fecha
                    <br />
                    <br />• Si aciertas equipo ganador de visitante sumas 3
                    PUNTOS.
                    <br />• Si aciertas equipo ganador de local sumas 2 PUNTOS.
                    <br />• Si aciertas empate entre ambos equipos sumas 1
                    PUNTO.
                    <br />
                    <br />
                    Se deben acertar los GOLES EXACTOS en la serie de penales de
                    ambos equipos para sumarlos como PUNTOS.
                    <br />
                  </p>

                  {/* Botón para cerrar */}
                  <div className="flex justify-center mt-6">
                    <button
                      className="bg-green-500 cursor-pointer hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition"
                      onClick={() => setOpen2(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                        <th className="text-transparent bg-clip-text text-xl bg-gradient-to-b from-gray-800 to-gray-100 px-4 py-2">
                          Brazalete
                        </th>
                        <th className="text-green-500 bg-black px-4 py-2">
                          Puntos
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRanking.map((usuario, index) => {
                        // Posición real dentro del ranking filtrado+ordenado
                        const pos = (currentPage - 1) * rowsPerPage + index + 1;

                        // Solo los primeros 8 tienen bota de oro
                        const premio = pos <= 8 ? Logo2 : null;

                        return (
                          <tr
                            key={usuario.id}
                            className="border-black border-2"
                          >
                            <td className="text-black text-center font-bold px-4 py-2 bg-white">
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
                              {premio && (
                                <img
                                  className="h-8 mx-auto"
                                  src={premio}
                                  alt="Bota de Oro"
                                />
                              )}
                            </td>

                            {/* Puntos */}
                            <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                              {usuario.puntos || 0}
                            </td>
                          </tr>
                        );
                      })}
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

            <div className="flex mb-5">
              <img className="h-15 object-contain" src={Logo5} alt="Logo" />
              <button
                className="bg-green-500 mb-5 mt-4  font-bold cursor-pointer py-1 px-2 rounded-md"
                onClick={() => setOpen3(true)}
              >
                Reglamento
              </button>
            </div>

            {open3 && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                {/* Contenido del modal */}
                <div className="bg-gray-900 text-white rounded-xl p-6 max-w-lg w-11/12 shadow-2xl border border-green-500">
                  <h2 className="text-2xl font-bold mb-4 text-green-500 text-center">
                    Goles
                  </h2>
                  <p className="text-gray-200 text-justify">
                    Es la suma obtenida de GOLES A FAVOR en el total de partidos
                    por fecha
                    <br />
                    BRAZALETE TFF lo conquistara el/los APAXIONADO/S entre las
                    primeras 8 posiciones por definición de GOLES A FAVOR por
                    fecha.
                    <br />
                    <br />
                    Sumas GOLES A FAVOR cuando aciertas los goles exactos de
                    cada equipo
                    <br />
                    <br />
                    Se deben acertar los GOLES EXACTOS en la serie de penales de
                    ambos equipos para sumarlos como GOLES A FAVOR.
                    <br />
                    <br />
                  </p>

                  {/* Botón para cerrar */}
                  <div className="flex justify-center mt-6">
                    <button
                      className="bg-green-500 cursor-pointer hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition"
                      onClick={() => setOpen3(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                        <th className="text-transparent bg-clip-text text-xl bg-gradient-to-b from-gray-800 to-gray-100 px-4 py-2">
                          Brazalete
                        </th>
                        <th className="text-green-500 bg-black px-4 py-2">
                          Goles
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRanking.map((usuario, index) => {
                        // Posición real dentro del ranking filtrado+ordenado
                        const pos = (currentPage - 1) * rowsPerPage + index + 1;

                        // Solo los primeros 8 tienen bota de oro
                        const premio = pos <= 8 ? Logo2 : null;

                        return (
                          <tr
                            key={usuario.id}
                            className="border-black border-2"
                          >
                            <td className="text-black text-center font-bold px-4 py-2 bg-white">
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
                              {premio && (
                                <img
                                  className="h-8 mx-auto"
                                  src={premio}
                                  alt="Bota de Oro"
                                />
                              )}
                            </td>

                            {/* Puntos */}
                            <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                              {usuario.golesFecha || 0}
                            </td>
                          </tr>
                        );
                      })}
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
      </div>
    </>
  );
};

export default PronosticoComponent;
