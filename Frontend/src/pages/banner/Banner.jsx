import React from "react";
import Logo from "../../assets/Logo1.png";

function Banner() {
  return (
    <div className="w-full flex justify-center">
      <div className="flex items-center mb-10 mt-5">
        <img className="h-32 mr-2" src={Logo} alt="Logo" />
        <h1 className="text-4xl text-green-600">
          VIVE EL JUEGO, SIENTE LA EMOCIÓN
        </h1>
      </div>
    </div>
  );
}

export default Banner;
