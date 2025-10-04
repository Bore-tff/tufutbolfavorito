import React from "react";
import Logo from "../../assets/ahorasi.png";
import { motion } from "framer-motion";

function Banner() {
  return (
    <motion.div
      className="space-y-10 p-1 max-h-[650px] overflow-y-auto"
      initial={{ x: -100, opacity: 0 }} // Empieza arriba y transparente
      animate={{ x: 0, opacity: 1 }} // Baja a su posición original y aparece
      transition={{ duration: 0.8, ease: "easeOut" }} // Suavidad
    >
      <div className="ml-7 py-4 px-6 flex flex-col items-start space-y-4">
        <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-700 to-gray-100 font-bold text-3xl">
          ¡BIENVENIDOS{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
            APAXIONADOS!
          </span>{" "}
          SUMA A TU AMIGA/AMIGO FUTBOLERO Y EL QUE RAYE . . .
        </span>

        <div className="flex items-center flex-wrap text-lg md:text-xl font-semibold ">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-700 to-gray-100 font-bold text-3xl mr-4">
            ELEGÍ
          </span>

          <img src={Logo} alt="Logo TFF" className="w-32 h-32 mx-4" />

          <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-700 to-gray-100 font-bold text-3xl">
            SUMA GOLES + PUNTOS Y SE EL CONQUISTADOR . . . BOTIN(TROFEOS
            ACORDATE BORE)
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default Banner;
