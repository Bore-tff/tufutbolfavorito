import React from "react";
import Logo from "../../assets/3.png";

function Banner() {
  return (
    <div className="ml-7 py-4 px-6 flex justify-center">
      <div className="flex items-center flex-wrap text-lg md:text-xl font-semibold text-blue-500 text-center">
        <span className="mr-2 text-white font-bold text-3xl">ELEGÍ</span>

        <img src={Logo} alt="Logo TFF" className="w-45 h-40 mx-2" />

        <span className="mr-2 text-white text-3xl">LOS</span>
        <span className="mr-2 text-white text-3xl font-extrabold">
          APAXIONADOS
        </span>
        <span className="mr-2 text-3xl">
          PRONOSTICAN LOS RESULTADOS X FECHA.
        </span>
        <span className="text-blue-500 text-3xl">
          SUMA GOLES + PUNTOS PARA SER EL CONQUISTADOR...
        </span>
      </div>
    </div>
  );
}

export default Banner;
