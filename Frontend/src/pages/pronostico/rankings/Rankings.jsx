import React from "react";
import useUserStore from "../../../store/usersStore";

const Rankings = () => {
  const { usuarios, rankingFecha } = useUserStore();

  return (
    <div className="flex flex-row justify-between items-start space-x-6 ml-5 mr-5 mt-56">
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
            {rankingFecha?.length > 0 ? (
              rankingFecha
                .slice()
                .sort((a, b) => (b.golesFecha || 0) - (a.golesFecha || 0))
                .map((usuario) => (
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
            {rankingFecha?.length > 0 ? (
              rankingFecha
                .slice()
                .sort((a, b) => (b.puntajeTotal || 0) - (a.puntajeTotal || 0))
                .map((usuario) => (
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
                  No hay datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rankings;
