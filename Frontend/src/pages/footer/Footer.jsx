import React from "react";
import Logo2 from "../../assets/sfd.png";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center">
        {/* Título de la página */}
        <img src={Logo2} alt="Logo TFF" className="" />

        {/* Mensaje o copyright */}
        <p className="text-gray-300 text-center">
          © {new Date().getFullYear()} TuFutbolFavorito. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
