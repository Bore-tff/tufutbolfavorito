import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Registro() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <div className="mt-24">
      <h2 className="text-4xl text-white font-bold text-center mb-20">
        TU FUTBOL FAVORITO
      </h2>
      <div className="max-w-sm bg-gray-900 text-green-600 shadow-md mx-auto p-4 rounded-lg">
        <h2 className="text-xl text-white font-bold text-center mb-2">
          REGISTRATE
        </h2>
        <h2 className="text-xl text-white font-bold text-center mb-4">
          A TU FUTBOL FAVORITO
        </h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full p-2 border text-white border-gray-200 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          />
          <input
            type="text"
            placeholder="Nombre"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full p-2 border text-white border-gray-200 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full p-2 border text-white border-gray-200 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          />
          <input
            type="text"
            placeholder="Email"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full p-2 border text-white border-gray-200 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border text-white border-gray-200 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border text-white border-gray-200 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          />
          <button
            type="submit"
            className="w-full mt-5 p-2 bg-green-500 font-bold text-gray-900 rounded hover:bg-green-400 cursor-pointer"
          >
            Registrar
          </button>
        </form>
        {/* Link a la página de registro */}
        <p className="text-sm text-center text-white mt-4">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/" className="text-green-500 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;
