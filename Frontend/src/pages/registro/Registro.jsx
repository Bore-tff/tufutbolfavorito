import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import useUserStore from "../../store/usersStore";

function Registro() {
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const { register, loading, error } = useUserStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !usuario ||
      !nombre ||
      !apellido ||
      !email ||
      !password ||
      !confirmarPassword
    ) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmarPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      await register({ user: usuario, nombre, apellido, email, password });
      toast.success("Usuario registrado correctamente");
      navigate("/login");
    } catch (error) {
      // Este mensaje ya lo captura el store, pero podés mostrarlo igual
      toast.error("Error al registrar usuario");
    }
  };

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
        {error && (
          <p className="text-red-500 mb-2 mt-2 text-sm text-center">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border text-white border-gray-200 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className="w-full p-2 border text-white border-gray-200 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          />
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
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
          <Link to="/login" className="text-green-500 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;
