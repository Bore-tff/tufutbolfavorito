import { useEffect, useState } from "react";
import useUserStore from "../../../store/usersStore";

const Rankings = () => {
  const { usuarios, user, rankingFecha, getUsersWithPuntaje, rankingGeneral } =
    useUserStore();
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

  const totalPages = Math.ceil(sortedRanking.length / rowsPerPage);

  const paginatedRanking = sortedRanking.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const paginatedRanking2 = sortedRanking.slice(
    (currentPage2 - 1) * rowsPerPage,
    currentPage2 * rowsPerPage
  );

  const paginatedRanking3 = sortedRanking.slice(
    (currentPage3 - 1) * rowsPerPage,
    currentPage3 * rowsPerPage
  );

  console.log("usuarios ranking:", usuarios);
  console.log("ranking fechaaa:", rankingFecha);
  console.log("ranking General", rankingGeneral);

  return (
    <div className="flex flex-row justify-between items-start space-x-6 ml-5 mb-20 mr-5 mt-64">
      {/* Ranking Goleador */}
      <div className="w-1/3 p-4 rounded-lg shadow-lg bg-gray-800">
        <h2 className="text-white text-2xl font-bold mb-2 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
            APAXIONADO GOLEADOR DE LA COPA
          </span>
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-black border-2">
              <th className="text-xl  text-green-500 bg-black px-4 py-2">
                Apaxionado
              </th>
              <th className="  text-green-500 bg-black px-4 py-2">Pts</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRanking.length > 0 ? (
              paginatedRanking.map((usuario) => (
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
      </div>

      {/* Ranking General */}
      <div className="w-1/3 p-4 rounded-lg shadow-lg bg-gray-800">
        <h2 className="text-white text-2xl font-bold mb-2 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
            RANKING GENERAL (PTS + GOLES)
          </span>
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-black border-2">
              <th className="text-xl  text-green-500 bg-black px-4 py-2">
                Apaxionado
              </th>
              <th className="  text-green-500 bg-black px-4 py-2">Pts</th>
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
      <div className="w-1/3 p-4 rounded-lg shadow-lg bg-gray-800">
        <h2 className="text-white text-2xl font-bold mb-2 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
            APAXIONADO CAMPEÓN DE LA COPA
          </span>
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-black border-2">
              <th className="text-xl  text-green-500 bg-black px-4 py-2">
                Apaxionado
              </th>
              <th className="  text-green-500 bg-black px-4 py-2">Pts</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRanking2.length > 0 ? (
              paginatedRanking2.map((usuario) => (
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
            Página {currentPage2} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage2((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage2 === totalPages}
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
