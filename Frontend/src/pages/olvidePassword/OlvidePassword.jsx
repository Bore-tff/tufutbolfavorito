import React, { useState } from "react";
import { olvidePassword } from "../../api/auth"; // tu llamada al backend

const OlvidePassword = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await olvidePassword({ email });
      setMensaje(
        data.msg || "Revisa tu correo para reestablecer tu contraseña."
      );
      setError(false);
    } catch (err) {
      setMensaje(
        err.response?.data?.msg || "Error al enviar las instrucciones"
      );
      setError(true);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="block w-96">
        <h1 className="text-orange-500 font-bold text-5xl mb-5">
          Cambia tu contraseña
        </h1>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Cambia tu contraseña
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-md font-semibold text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Ingresa tu mail"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 cursor-pointer font-bold text-white py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Enviar Instrucciones
          </button>
        </form>
      </div>
    </div>
  );
};

export default OlvidePassword;
