import { useEffect, useState } from "react";
import useUserStore from "../../../store/usersStore";

const Rankings = () => {
  const { usuarios, user, rankingFecha, getUsersWithPuntaje, rankingGeneral } =
    useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchTerm3, setSearchTerm3] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [currentPage3, setCurrentPage3] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    getUsersWithPuntaje();
  }, []);

  const sortedRanking = [...(rankingFecha || [])].sort(
    (a, b) => (b.puntos || 0) - (a.puntos || 0)
  );

  const filteredRankingGeneral = sortedRanking
    .slice()
    .sort((a, b) => (b.sumaTotal || 0) - (a.sumaTotal || 0))
    .filter((usuario) =>
      (usuario.nombre || usuario.user)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredRankingGeneral.length / rowsPerPage);

  const paginatedRanking3 = filteredRankingGeneral.slice(
    (currentPage3 - 1) * rowsPerPage,
    currentPage3 * rowsPerPage
  );

  // ---------------- Ranking por Goleador ----------------
  const sortedRankingGoleador = [...(rankingFecha || [])].sort(
    (a, b) => (b.golesTotales || 0) - (a.golesTotales || 0)
  );

  const filteredRankingGoleador = sortedRankingGoleador.filter((usuario) =>
    (usuario.nombre || usuario.user)
      .toLowerCase()
      .includes(searchTerm2.toLowerCase())
  );

  const totalPagesGoleador = Math.ceil(
    filteredRankingGoleador.length / rowsPerPage
  );

  const paginatedRankingGoleador = filteredRankingGoleador.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ---------------- Ranking Campeón ----------------
  const sortedRankingCampeon = [...(rankingFecha || [])].sort(
    (a, b) => (b.puntajeTotal || 0) - (a.puntajeTotal || 0)
  );

  const filteredRankingCampeon = sortedRankingCampeon.filter((usuario) =>
    (usuario.nombre || usuario.user)
      .toLowerCase()
      .includes(searchTerm3.toLowerCase())
  );

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
              <th className="text-green-500 bg-black px-4 py-2">Goles</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRankingGoleador.length > 0 ? (
              paginatedRankingGoleador.map((usuario) => (
                <tr key={usuario.id} className="border-black border-2">
                  <td className="text-black text-center font-bold px-4 py-2 bg-white">
                    {usuario.nombre || usuario.user}
                  </td>
                  <td className="text-center text-black px-4 py-2 bg-sky-500 font-bold">
                    {usuario.golesTotales || 0}
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
