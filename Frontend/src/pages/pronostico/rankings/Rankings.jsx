import { useEffect, useState } from "react";
import useUserStore from "../../../store/usersStore";
import Logo from "../../../assets/Botintff.png";
import Logo2 from "../../../assets/botinoro.png";
import Logo3 from "../../../assets/botinbronce.png";
import Logo4 from "../../../assets/botinplatino.jpg";
import Logo5 from "../../../assets/3.png";

const Rankings = () => {
  const { usuarios, user, rankingFecha, getUsersWithPuntaje, rankingGeneral } =
    useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchTerm3, setSearchTerm3] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [currentPage3, setCurrentPage3] = useState(1);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const rowsPerPage = 11;
  const rowsPerPageGeneral = 8;

  /*------------RANKING GENERAL------------*/
  const sortedRankingGeneral = [...(rankingFecha || [])].sort(
    (a, b) => (b.sumaTotal || 0) - (a.sumaTotal || 0)
  );

  // Obtener lista de puntajes únicos por sumaTotal
  const uniqueScoresGeneral = [
    ...new Set(sortedRankingGeneral.map((u) => u.sumaTotal || 0)),
  ];

  // Mapa de premios por puntaje
  const scoreToAwardGeneral = {};

  uniqueScoresGeneral.forEach((score, index) => {
    if (index === 0) scoreToAwardGeneral[score] = Logo4; // Platino
    else if (index >= 1 && index <= 5)
      scoreToAwardGeneral[score] = Logo2; // Oro
    else if (index >= 6 && index <= 8)
      scoreToAwardGeneral[score] = Logo3; // Plata
    else if (index >= 9 && index <= 10)
      scoreToAwardGeneral[score] = Logo; // Bronce
    else scoreToAwardGeneral[score] = Logo; // por si hay más puntajes
  });

  // Ranking con premios asignados
  const rankedGeneralWithAwards = sortedRankingGeneral.map((usuario) => ({
    ...usuario,
    premio: scoreToAwardGeneral[usuario.sumaTotal || 0],
  }));

  // Filtro
  const filteredRankingGeneral = rankedGeneralWithAwards.filter((usuario) =>
    (usuario.nombre || usuario.user)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Paginado
  const totalPages = Math.ceil(
    filteredRankingGeneral.length / rowsPerPageGeneral
  );

  const paginatedRanking3 = filteredRankingGeneral.slice(
    (currentPage3 - 1) * rowsPerPageGeneral,
    currentPage3 * rowsPerPageGeneral
  );

  // ---------------- Ranking por Goleador ----------------
  // Ordenar por goles
  const sortedRankingGoleador = [...(rankingFecha || [])].sort(
    (a, b) => (b.golesTotales || 0) - (a.golesTotales || 0)
  );

  // Obtener lista de puntajes únicos ordenados
  const uniqueScores = [
    ...new Set(sortedRankingGoleador.map((u) => u.golesTotales || 0)),
  ];

  // Mapa para saber qué premio tiene cada puntaje
  const scoreToAward = {};

  uniqueScores.forEach((score, index) => {
    if (index === 0) scoreToAward[score] = Logo4; // PLATINO
    else if (index >= 1 && index <= 5)
      scoreToAward[score] = Logo2; // ORO (2°–6° puntaje)
    else if (index >= 6 && index <= 8)
      scoreToAward[score] = Logo3; // PLATA (7°–9° puntaje)
    else if (index >= 9 && index <= 10)
      scoreToAward[score] = Logo; // BRONCE (10°–11°)
    else scoreToAward[score] = Logo; // Por si hubiera más puntajes
  });

  // Añadir el premio correspondiente a cada usuario
  const rankedWithAwards = sortedRankingGoleador.map((usuario) => ({
    ...usuario,
    premio: scoreToAward[usuario.golesTotales || 0],
  }));

  // Filtro por búsqueda
  const filteredRankingGoleador = rankedWithAwards.filter((usuario) =>
    (usuario.nombre || usuario.user)
      .toLowerCase()
      .includes(searchTerm2.toLowerCase())
  );

  // Paginado
  const totalPagesGoleador = Math.ceil(
    filteredRankingGoleador.length / rowsPerPage
  );

  const paginatedRankingGoleador = filteredRankingGoleador.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /*---------RANKING POR PUNTAJE------------*/

  // Ordenar por puntajeTotal
  const sortedRankingCampeon = [...(rankingFecha || [])].sort(
    (a, b) => (b.puntajeTotal || 0) - (a.puntajeTotal || 0)
  );

  // Obtener todos los puntajes únicos
  const uniqueScoresCampeon = [
    ...new Set(sortedRankingCampeon.map((u) => u.puntajeTotal || 0)),
  ];

  // Crear mapa score → premio
  const scoreToAwardCampeon = {};

  uniqueScoresCampeon.forEach((score, index) => {
    if (index === 0) scoreToAwardCampeon[score] = Logo4; // Platino
    else if (index >= 1 && index <= 5)
      scoreToAwardCampeon[score] = Logo2; // Oro
    else if (index >= 6 && index <= 8)
      scoreToAwardCampeon[score] = Logo3; // Plata
    else if (index >= 9 && index <= 10)
      scoreToAwardCampeon[score] = Logo; // Bronce
    else scoreToAwardCampeon[score] = Logo; // Por si hay más
  });

  // Agregar premio a cada usuario
  const rankedCampeonWithAwards = sortedRankingCampeon.map((usuario) => ({
    ...usuario,
    premio: scoreToAwardCampeon[usuario.puntajeTotal || 0],
  }));

  // Filtrar por búsqueda
  const filteredRankingCampeon = rankedCampeonWithAwards.filter((usuario) =>
    (usuario.nombre || usuario.user)
      .toLowerCase()
      .includes(searchTerm3.toLowerCase())
  );

  // Paginado
  const totalPagesCampeon = Math.ceil(
    filteredRankingCampeon.length / rowsPerPage
  );

  const paginatedRankingCampeon = filteredRankingCampeon.slice(
    (currentPage2 - 1) * rowsPerPage,
    currentPage2 * rowsPerPage
  );

  return (
    <div className="flex flex-col md:flex-row flex-wrap justify-center items-start gap-6 mr-5 mt-10 md:mt-20">
      {/* Ranking Goleador */}
      <div className="md:w-1/2 lg:w-xl p-4 w-full bg-black rounded-xl pt-5 px-5 border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
        <h2 className="text-white text-2xl font-bold mb-2 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
            APAXIONADO GOLEADOR DE LA COPA
          </span>
        </h2>
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
              <h2 className="text-2xl font-bold mb-4 text-green-400 text-center">
                Reglamento del Juego
              </h2>
              <p className="text-gray-200 text-justify">
                Es la suma obtenida de GOLES A FAVOR por el APAXIONADO en la
                copa. Los APAXIONADOS entre las primeras 11 posiciones
                conquistaran los ARCOS a favor por definición de goles a favor
                <br />
                <br />• ARCO DE PLATINO lo conquistara el/los APAXIONADO/S
                goleador en la 1era posición
                <br />• ARCO DE ORO lo conquistara el/los APAXIONADO/S goleador
                desde la 2da a la 6ta posición inclusive
                <br />• ARCO DE PLATA lo conquistara el/los APAXIONADO/S
                goleador desde la 7ma a la 9na posición inclusive
                <br />• ARCO DE BRONCE lo conquistara el/los APAXIONADO/S
                goleador de la 10ma a la 11era posición inclusive
                <br />
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
        <input
          type="text"
          placeholder="Buscar apaxionado..."
          value={searchTerm2}
          onChange={(e) => {
            setSearchTerm2(e.target.value);
            setCurrentPage(1); // 👈 resetear página cuando se busca
          }}
          className="w-full md:w-1/2 text-white px-3 py-2 mb-4 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-black border-2">
              <th className="text-xl text-green-500 bg-black px-4 py-2">
                Apaxionado
              </th>
              <th className="text-green-500 bg-black px-4 py-2">Premio</th>
              <th className="text-green-500 bg-black px-4 py-2">Goles</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRankingGoleador.map((usuario) => {
              const realIndex = sortedRankingGoleador.findIndex(
                (u) => u.id === usuario.id
              );

              return (
                <tr key={usuario.id} className="border-black border-2">
                  <td className="text-center text-black px-4 py-2 bg-white font-bold">
                    {usuario.nombre || usuario.user}
                  </td>
                  <td className="text-center bg-white px-4 py-2">
                    <img
                      src={usuario.premio}
                      alt="Premio"
                      className="w-8 h-8 mx-auto shadow-md"
                    />
                  </td>

                  <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                    {usuario.golesTotales || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 cursor-pointer disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-white px-2">
            Página {currentPage} de {totalPagesGoleador}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPagesGoleador))
            }
            disabled={currentPage === totalPagesGoleador}
            className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 disabled:opacity-50 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Ranking General */}
      <div className="w-full md:w-1/2 lg:w-xl p-4 bg-black rounded-xl pt-5 px-5 border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
        <h2 className="text-white text-2xl font-bold mb-2 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
            RANKING GENERAL
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
              <h2 className="text-2xl font-bold mb-4 text-green-400 text-center">
                Reglamento del Juego
              </h2>
              <p className="text-gray-200 text-justify">
                Es la suma obtenida de PUNTOS + GOLES A FAVOR por el APAXIONADO
                en la copa. Los APAXIONADOS entre las primeras 4 posiciones
                conquistaran los brazalete por definición de (PTS + G.F)
                <br />
                <br />• BRAZALETE DE PLATINO lo conquistara el/los APAXIONADO/S
                en la 1era posición
                <br />• BRAZALETE DE ORO lo conquistara el/los APAXIONADO/S en
                la 2da posición
                <br />• BRAZALETE DE PLATA lo conquistara el/los APAXIONADO/S en
                la 3ra posición
                <br />• BRAZALETE DE BRONCE lo conquistara el/los APAXIONADO/S
                en la 4ra posición
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
        <input
          type="text"
          placeholder="Buscar apaxionado..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // 👈 resetear página cuando se busca
          }}
          className="w-full md:w-1/2 text-white px-3 py-2 mb-4 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-black border-2">
              <th className="text-xl  text-green-500 bg-black px-4 py-2">
                Apaxionado
              </th>
              <th className="  text-green-500 bg-black px-4 py-2">Premio</th>
              <th className="  text-green-500 bg-black px-4 py-2">
                Goles + Puntos
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRanking3?.length > 0 ? (
              paginatedRanking3
                .slice()
                .sort((a, b) => (b.sumaTotal || 0) - (a.sumaTotal || 0))
                .map((usuario) => (
                  <tr key={usuario.id} className="border-black border-2">
                    <td className="text-black text-center font-bold px-4 py-2 bg-white">
                      {usuario.nombre || usuario.user}
                    </td>
                    <td className="text-center bg-white px-4 py-2">
                      <img
                        src={usuario.premio}
                        alt="Premio"
                        className="w-8 h-8 mx-auto shadow-md"
                      />
                    </td>
                    <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                      {usuario.sumaTotal || 0}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center p-2 text-white">
                  No hay datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage3((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage3 === 1}
            className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 cursor-pointer disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-white px-2">
            Página {currentPage3} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage3((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage3 === totalPages}
            className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 disabled:opacity-50 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Apaxionado Campeón */}
      <div className=" md:w-1/2 lg:w-xl p-4 w-full bg-black rounded-xl pt-5 px-5 border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff]">
        <h2 className="text-white text-2xl font-bold mb-2 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
            APAXIONADO CAMPEÓN DE LA COPA
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
              <h2 className="text-2xl font-bold mb-4 text-green-400 text-center">
                Reglamento del Juego
              </h2>
              <p className="text-gray-200 text-justify">
                Es la suma obtenida de PUNTOS por el APAXIONADO en la copa. Los
                APAXIONADOS entre las primeras 11 posiciones conquistaran los
                COPA por definición de puntos a favor
                <br />
                <br />• COPA DE PLATINO lo conquistara el/los APAXIONADO/S
                campeón en la 1era posición
                <br />• COPA DE ORO lo conquistara el/los APAXIONADO/S campeón
                desde la 2era a la 6ta posición inclusive
                <br />• COPA DE PLATA lo conquistara el/los APAXIONADO/S campeón
                desde la 7ma a la 9na posición inclusive
                <br />• COPA DE BRONCE lo conquistara el/los APAXIONADO/S
                campeón desde la 10ma a la 11era posición inclusive
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
        <input
          type="text"
          placeholder="Buscar apaxionado..."
          value={searchTerm3}
          onChange={(e) => {
            setSearchTerm3(e.target.value);
            setCurrentPage(1); // 👈 resetear página cuando se busca
          }}
          className="w-full md:w-1/2 text-white px-3 py-2 mb-4 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-black border-2">
              <th className="text-xl text-green-500 bg-black px-4 py-2">
                Apaxionado
              </th>
              <th className="text-green-500 bg-black px-4 py-2">Premio</th>
              <th className="text-green-500 bg-black px-4 py-2">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRankingCampeon.length > 0 ? (
              paginatedRankingCampeon.map((usuario) => (
                <tr key={usuario.id} className="border-black border-2">
                  <td className="text-black text-center font-bold px-4 py-2 bg-white">
                    {usuario.nombre || usuario.user}
                  </td>
                  <td className="text-center bg-white px-4 py-2">
                    <img
                      src={usuario.premio}
                      alt="Premio"
                      className="w-8 h-8 mx-auto shadow-md"
                    />
                  </td>
                  <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                    {usuario.puntajeTotal || 0}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center p-2 text-white">
                  No hay datos para esta fecha.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage2((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage2 === 1}
            className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 cursor-pointer disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-white px-2">
            Página {currentPage2} de {totalPagesCampeon}
          </span>
          <button
            onClick={() =>
              setCurrentPage2((prev) => Math.min(prev + 1, totalPagesCampeon))
            }
            disabled={currentPage2 === totalPagesCampeon}
            className="px-3 py-1 bg-green-600 font-bold rounded hover:bg-green-500 disabled:opacity-50 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rankings;
