import { useState } from "react";
import useUserStore from "../../store/usersStore";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../footer/Footer";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, user, loading, error } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const success = await login(usuario, password);

      if (success) {
        toast.success("Inicio de sesión exitoso");
        navigate("/");
      } else {
        toast.error("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      toast.error("Error al iniciar sesión, intenta nuevamente");
      console.error("Error en login:", error);
    }
  };

  return (
    <>
      <div className="mt-24 h-130">
        <h2 className="text-4xl text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100 font-bold text-center mb-20">
          BIENVENIDO A TFF
        </h2>
        <div className="max-w-sm bg-black border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff] text-green-600 mx-auto p-4  rounded-lg">
          <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100 font-bold text-center mb-2">
            INICIA SESIÓN
          </h2>
          {error && (
            <p className="text-red-500 mb-2 mt-2 text-sm text-center">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full p-2 border text-white border-green-500 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border text-white border-green-500 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              required
            />
            <button
              type="submit"
              className="w-full mt-5 p-2 bg-green-500 font-bold text-black rounded hover:bg-green-400 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Ingresa"}
            </button>
          </form>
          {/* Link a la página de registro */}
          <p className="text-sm text-center text-white mt-4">
            ¿No tienes una cuenta?{" "}
            <Link to="/registro" className="text-green-500 hover:underline">
              Regístrate
            </Link>
          </p>
          <p className="text-sm text-center text-white mt-3">
            ¿Olvidaste la contraseña?{" "}
            <Link
              to="/forgot-password"
              className="text-green-500 hover:underline"
            >
              Recuperala
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
