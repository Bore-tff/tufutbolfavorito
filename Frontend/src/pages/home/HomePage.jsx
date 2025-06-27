import { useState, useEffect } from "react";
import PronosticoFixture from "../PronosticoFixture";
import useUserStore from "../../store/usersStore";
import { useNavigate } from "react-router-dom";
import usePronosticoStore from "../../store/pronosticosStore";
import Banner from "../banner/Banner";
import Logo from "../../assets/Logo1.png";

function HomePage() {
  const { user, logout, getAllUsers, getUsersWithPuntaje } = useUserStore();
  const { puntosObtenidos, pronosticos } = usePronosticoStore();
  const [usuario, setUsuario] = useState(null);
  console.log(user);
  console.log("puntos", pronosticos);

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

  console.log(getUsersWithPuntaje);

  const handleLogout = () => {
    logout(); // Esto borra el estado del usuario en el store
    console.log("Sesión cerrada correctamente");
    navigate("/"); // Redirige a la página de login
  };

  return (
    <div>
      <div className="w-full mt-4 flex justify-between items-center border-b border-white pb-4 px-5">
        <img className="h-10" src={Logo} alt="Logo" />
        <div className="flex items-center gap-5">
          <h1 className="font-bold text-white">
            Bienvenido Apaxionado {usuario ? usuario.nombre : "Invitado"}
          </h1>
          {user && (
            <button
              onClick={handleLogout}
              className="text-green-500 font-bold cursor-pointer rounded transition"
            >
              Cerrar sesión
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
