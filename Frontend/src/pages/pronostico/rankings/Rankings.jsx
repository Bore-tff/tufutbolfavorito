import { useState } from "react";
import useUserStore from "../../../store/usersStore";

const Rankings = () => {
  const { usuarios, user, rankingFecha } = useUserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const rowsPerPage = 5;

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

  return (
    <div className="flex flex-row justify-between items-start space-x-6 ml-5 mr-5 mt-64">
      {/* Ranking Goleador */}
      <div className="w-1/3 p-4 rounded-lg shadow-lg bg-gray-800">
        <h2 className="text-white text-3xl font-bold mb-2 text-center">
          APAXIONADO GOLEADOR DEL TORNEO
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-black border-2">
              <th className="  text-green-500 bg-black px-4 py-2">Usuario</th>
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
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 cursor-pointer disabled:opacity-50"
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
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
        {rankingFecha?.length > 0 ? (
          rankingFecha
            .filter((u) => u.id === user.id)
            .map((usuario) => (
              <h1 className=" text-green-500 text-xl py-2 font-bold">
                Mi Puntaje: {usuario.golesTotales || 0}
              </h1>
            ))
        ) : (
          <h1 colSpan={2} className="text-center p-2 text-white">
            No hay datos.
          </h1>
        )}
      </div>

      {/* Ranking General */}
      <div className="w-1/3 p-4 rounded-lg shadow-lg bg-gray-800">
        <h2 className="text-white text-3xl font-bold mb-2 text-center">
          RANKING GENERAL
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-black border-2">
              <th className="  text-green-500 bg-black px-4 py-2">Usuario</th>
              <th className="  text-green-500 bg-black px-4 py-2">Pts</th>
            </tr>
          </thead>
          <tbody>
            {usuarios?.length > 0 ? (
              usuarios
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
        {usuarios?.length > 0 ? (
          usuarios
            .filter((u) => u.id === user.id)
            .map((usuario) => (
              <tr key={usuario.id}>
                <td
                  colSpan={2}
                  className="text-center text-green-500 px-4 py-2 text-xl  font-bold"
                >
                  Mi Puntaje Total: {usuario.sumaTotal || 0}
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
      </div>

      {/* Apaxionado Campeón */}
      <div className="w-1/3 p-4 rounded-lg shadow-lg bg-gray-800">
        <h2 className="text-white text-3xl font-bold mb-2 text-center">
          APAXIONADO CAMPEÓN
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-black border-2">
              <th className="  text-green-500 bg-black px-4 py-2">Usuario</th>
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
            onClick={() => setCurrentPage2((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage2 === 1}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 cursor-pointer disabled:opacity-50"
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
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
        {rankingFecha?.length > 0 ? (
          rankingFecha
            .filter((u) => u.id === user.id)
            .map((usuario) => (
              <h1 className=" text-green-500 text-xl py-2 font-bold">
                Mi Puntaje: {usuario.puntajeTotal || 0}
              </h1>
            ))
        ) : (
          <h1 colSpan={2} className="text-center p-2 text-white">
            No hay datos.
          </h1>
        )}
      </div>
    </div>
  );
};

export default Rankings;
