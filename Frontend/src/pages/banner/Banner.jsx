import React from "react";
import Logo from "../../assets/ahorasi.png";

function Banner() {
  return (
    <div className="ml-7 py-4 px-6 flex flex-col items-start space-y-4">
      <span className="text-blue-500 font-bold text-3xl">
        ¡BIENVENIDOS{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
          APAXIONADOS!
        </span>{" "}
        SUMA A TU AMIGA/AMIGO Y EL QUE RAYE . . .
      </span>

      <div className="flex items-center flex-wrap text-lg md:text-xl font-semibold text-blue-500">
        <span className="text-blue-500 font-bold text-3xl mr-4">ELEGÍ</span>

        <img src={Logo} alt="Logo TFF" className="w-32 h-32 mx-4" />

        <span className="text-blue-500 font-bold text-3xl">
          LOS{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
            APAXIONADOS
          </span>{" "}
          PRONOSTICAN LOS RESULTADOS X FECHA.
        </span>
      </div>

      <span className="text-blue-500 font-bold text-3xl">
        SUMA GOLES + PUNTOS Y SE EL CONQUISTADOR . . .
      </span>
    </div>
  );
}

export default Banner;
