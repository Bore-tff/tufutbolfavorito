import React from "react";
import Logo from "../../assets/ahorasi.png";
import arcopro4 from "../../assets/arcopro4.png";
import copapro3 from "../../assets/copapro3.png";
import equipopro1 from "../../assets/equipopro1.png";
import escudopro2 from "../../assets/escudopro2.png";
import { motion } from "framer-motion";

function Banner() {
  return (
    <motion.div
      className="space-y-10 p-1"
      initial={{ x: -100, opacity: 0 }} // Empieza arriba y transparente
      animate={{ x: 0, opacity: 1 }} // Baja a su posición original y aparece
      transition={{ duration: 0.8, ease: "easeOut" }} // Suavidad
    >
      <div className="ml-7 py-4 px-6 flex flex-col items-start space-y-4">
        <span
          className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500 
    font-extrabold text-3xl 
    drop-shadow-[0_0_12px_rgba(80,180,255,0.8)] 
    font-['Inter']
    tracking-wide
    [text-rendering:optimizeLegibility]
    [-webkit-font-smoothing:antialiased]"
        >
          ¡BIENVENIDOS{" "}
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-50 
      drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          >
            APAXIONADOS!
          </span>{" "}
          SUMA A TU AMIGA/AMIGO FUTBOLERO Y EL QUE RAYE . . .
        </span>

        <div className="flex items-center flex-wrap text-lg md:text-xl font-semibold">
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500 
  font-extrabold text-3xl 
  
  font-['Inter'] flex items-center gap-3"
          >
            SUMÁ GOLES + PUNTOS Y SE EL CONQUISTADOR . . .
            <div className="flex items-center gap-2 ml-3">
              <img src={escudopro2} alt="Escudo" className="w-20 h-20" />
              <img src={equipopro1} alt="Equipo" className="w-20 h-20" />
              <img src={arcopro4} alt="Arco" className="w-20 h-20" />
              <img src={copapro3} alt="Copa" className="w-20 h-20" />
            </div>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default Banner;
