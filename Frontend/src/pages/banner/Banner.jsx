import React from "react";
import Logo from "../../assets/ahorasi.png";
import arcopro4 from "../../assets/arcopro4.png";
import copapro3 from "../../assets/copapro3.png";
import equipopro1 from "../../assets/equipopro1.png";
import escudopro2 from "../../assets/escudopro2.png";
import blanco from "../../assets/brazaletepro2.png";
import { motion } from "framer-motion";

function Banner() {
  return (
    <motion.div
      className="space-y-10 p-1"
      initial={{ x: -100, opacity: 0 }} // Empieza arriba y transparente
      animate={{ x: 0, opacity: 1 }} // Baja a su posición original y aparece
      transition={{ duration: 0.8, ease: "easeOut" }} // Suavidad
    >
      <div className="ml-7 py-4 px-6 flex flex-col items-start space-y-6">
        {/* BLOQUE BIENVENIDA */}
        <span
          className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500 
    font-extrabold text-3xl 
    drop-shadow-[0_0_12px_rgba(80,180,255,0.8)] 
    font-['Inter']
    tracking-wide"
        >
          ¡BIENVENIDOS{" "}
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-50 
      drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          >
            APAXIONADOS!
          </span>
          <span className="block mt-2">
            SUMA A TU AMIGA/AMIGO FUTBOLERO Y EL QUE RAYE...
          </span>
        </span>

        {/* BLOQUE ELEGI */}
        <div
          className="
    text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500
    font-extrabold font-['Inter']
    flex flex-col lg:flex-row
    items-center
    justify-center
    gap-4 lg:gap-6
    text-center lg:text-left
    max-w-full
    px-4
  "
        >
          {/* ELEGI + LOGO */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-2xl sm:text-3xl lg:text-3xl">ELEGI</span>

            <img
              src={Logo}
              alt="Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32"
            />
          </div>

          {/* TEXTO + ICONOS */}
          <div
            className="
      flex flex-col lg:flex-row
      items-center
      gap-3 lg:gap-4
      max-w-8xl
      leading-tight
    "
          >
            <span className="text-2xl sm:text-3xl lg:text-3xl text-center lg:text-left">
              SUMÁ GOLES + PUNTOS Y SE EL CONQUISTADOR
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <img
                src={escudopro2}
                alt="Escudo"
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
              />
              <img
                src={equipopro1}
                alt="Equipo"
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
              />
              <img
                src={arcopro4}
                alt="Arco"
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
              />
              <img
                src={copapro3}
                alt="Copa"
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
              />
              <img
                src={blanco}
                alt="Brazalete"
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Banner;
