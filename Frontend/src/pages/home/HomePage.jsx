import { useState, useEffect } from "react";
import PronosticoFixture from "../pronostico/PronosticoFixture";
import useUserStore from "../../store/usersStore";
import { useNavigate } from "react-router-dom";
import usePronosticoStore from "../../store/pronosticosStore";
import Banner from "../banner/Banner";
import Logo from "../../assets/3.png";

function HomePage() {
  const { user, logout, getAllUsers, getUsersWithPuntaje } = useUserStore();
  const { puntosObtenidos, pronosticos } = usePronosticoStore();
  const [usuario, setUsuario] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser)); // Convertir de string a objeto
    }
  }, []);

  useEffect(() => {
    getAllUsers();
    getUsersWithPuntaje();
  }, []);

  const handleLogout = () => {
    logout(); // Esto borra el estado del usuario en el store

    navigate("/login"); // Redirige a la página de login
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="w-full bg-black flex flex-col lg:flex-row justify-evenly items-center border-b border-green-500 pb-4 px-5 gap-4 lg:gap-0">
        <img
          className="h-40 sm:h-52 md:h-56 lg:h-58 object-contain"
          src={Logo}
          alt="Logo"
        />

        <div className="flex flex-col text-center lg:text-left lg:flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-2xl mb-2 font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-500 to-gray-100 drop-shadow-[0_0_10px_#22c55e]">
            VIVE EL JUEGO, SIENTE LA EMOCIÓN!!!
          </h1>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-2xl font-bold italic text-transparent bg-clip-text bg-gradient-to-b from-green-500 to-gray-100 drop-shadow-[0_0_10px_#22c55e]">
            PONÉ A PRUEBA TU PASIÓN...
          </h1>
        </div>

        <div className="flex flex-col items-center lg:items-start mt-2 lg:mt-0">
          <h1 className="font-bold text-lg sm:text-xl md:text-2xl text-center lg:text-left leading-tight">
            <span className="block neon-green">Bienvenido</span>
            <span className="block neon-green">
              {usuario ? usuario.nombre : "Invitado"}
            </span>
          </h1>

          {user ? (
            <button
              onClick={handleLogout}
              className="relative mt-2 text-green-500 font-bold text-base sm:text-lg md:text-xl cursor-pointer rounded group"
            >
              Cerrar sesión
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-green-500 transition-all duration-500 group-hover:w-full"></span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="relative mt-2 text-green-500 font-bold text-base sm:text-lg md:text-xl cursor-pointer rounded group"
            >
              Iniciar sesión para jugar
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-green-500 transition-all duration-500 group-hover:w-full"></span>
            </button>
          )}
        </div>
      </div>

      {/* Banner */}
      <Banner />

      {/* Fixture */}
      <div className="flex flex-col lg:flex-row gap-2 p-2">
        <div className="flex-1">
          <PronosticoFixture />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
