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
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
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
              <label
                htmlFor="password"
                className="block text-md font-semibold text-gray-700"
              >
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="Nueva contraseña"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 cursor-pointer font-bold text-white py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Guardar contraseña
            </button>
          </form>
        )}

        {passwordModificado && (
          <p className="mt-4 text-center font-semibold text-gray-700">
            Tu contraseña fue cambiada{" "}
            <Link
              to="/login"
              className="text-orange-500 font-semibold hover:underline"
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
