import React from "react";
import Logo from "../../assets/ahorasi.png";

function Banner() {
  return (
    <div className="ml-7 py-4 px-6 flex flex-col items-start space-y-4">
      <span className="text-blue-500 text-3xl">
        ¡BIENVENIDOS APAXIONADOS! SUMA A TU AMIGA/AMIGO Y EL QUE RAYE
      </span>

      <div className="flex items-center flex-wrap text-lg md:text-xl font-semibold text-blue-500">
        <span className="text-white font-bold text-3xl mr-4">ELEGÍ</span>

        <img src={Logo} alt="Logo TFF" className="w-32 h-32 mx-4" />

        <span className="text-white text-3xl">
          LOS <span className="font-extrabold">APAXIONADOS</span> PRONOSTICAN
          LOS RESULTADOS X FECHA.
        </span>
      </div>

      <span className="text-blue-500 text-3xl">
        SUMA GOLES + PUNTOS Y SE EL CONQUISTADOR...
      </span>
    </div>
  );
}

export default Banner;
