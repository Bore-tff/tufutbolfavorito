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
    <div>
      <div className="w-full mt-4 flex justify-evenly items-center border-b border-green-500 pb-4 px-5">
        <img className="h-58" src={Logo} alt="Logo" />
        <div className="flex flex-col">
          <h1 className="text-6xl mb-4 font-bold text-green-600 ">
            VIVE EL JUEGO, SIENTE LA EMOCIÓN!!!
          </h1>
          <h1 className="text-5xl font-bold italic text-green-600 text-right float-text">
            PONÉ A PRUEBA TU PASIÓN...
          </h1>
        </div>
        <div className="flex flex-col items-start relative top-15 pr-10">
          <h1 className="font-bold text-xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100">
              Bienvenido Apaxionado {usuario ? usuario.nombre : "Invitado"}
            </span>
          </h1>

          {user ? (
            <button
              onClick={handleLogout}
              className="text-green-500 font-bold text-xl cursor-pointer rounded transition"
            >
              Cerrar sesión
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="text-green-500 text-xl font-bold cursor-pointer rounded transition hover:underline"
            >
              Iniciar sesión para jugar
            </button>
          )}
        </div>
      </div>
      <Banner />
      <div className="flex gap-4 p-4">
        <div className="flex-1 space-y-4">
          <PronosticoFixture />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
