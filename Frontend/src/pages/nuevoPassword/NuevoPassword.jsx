import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { comprobarToken, nuevoPassword } from "../../api/auth";

const NuevoPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);
  const [passwordModificado, setPasswordModificado] = useState(false);

  // Validar token apenas carga el componente
  useEffect(() => {
    const validarToken = async () => {
      try {
        const { data } = await comprobarToken(token);
        setMensaje(data.msg);
        setTokenValido(true);
      } catch (err) {
        setError(true);
        setMensaje(err.response?.data?.msg || "Token inválido");
      }
    };
    validarToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError(true);
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const { data } = await nuevoPassword(token, { password });
      setMensaje(data.msg);
      setError(false);
      setPasswordModificado(true);
    } catch (err) {
      setError(true);
      setMensaje(err.response?.data?.msg || "Error al cambiar la contraseña");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black">
      <h1 className="text-green-500 font-bold text-4xl mb-6">
        TU FUTBOL FAVORITO
      </h1>
      <div className="bg-black border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff] text-green-600 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-green-500">
          Cambiar contraseña
        </h1>

        {mensaje && (
          <p
            className={`mb-4 text-center font-medium ${
              error ? "text-red-600" : "text-green-600"
            }`}
          >
            {mensaje}
          </p>
        )}

        {tokenValido && !passwordModificado && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="password"
                type="password"
                placeholder="Nueva contraseña"
                className="mt-1 w-full px-4 py-2 border text-white bg-black border-green-500 focus:border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 cursor-pointer font-bold text-black py-2 rounded-lg hover:bg-green-600 transition"
            >
              Guardar contraseña
            </button>
          </form>
        )}

        {passwordModificado && (
          <p className="mt-4 text-center font-semibold text-white">
            Tu contraseña fue cambiada{" "}
            <Link
              to="/login"
              className="text-green-500 font-semibold hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default NuevoPassword;
