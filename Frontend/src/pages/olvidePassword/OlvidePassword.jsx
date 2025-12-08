import React, { useState } from "react";
import { olvidePassword } from "../../api/auth";
import { Link } from "react-router-dom";
import Footer from "../footer/Footer";

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
    <>
      <div className="flex flex-col justify-center items-center h-150 bg-black">
        {/* TITULO EXTERNO */}
        <h1 className="text-green-500 font-bold text-4xl mb-6">
          TU FUTBOL FAVORITO
        </h1>

        {/* FORMULARIO */}
        <div className="max-w-sm bg-black border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff] text-green-600 mx-auto p-4  rounded-lg">
          {/* TITULO INTERNO */}
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            Ingresa tu email para continuar
          </h2>

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
              <input
                id="email"
                type="email"
                placeholder="Ingresa tu email"
                className="mt-1 w-full px-4 text-white bg-black border-green-500 focus:border-green-600 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 cursor-pointer font-bold text-black py-2 rounded-lg hover:bg-green-600 transition"
            >
              Enviar Instrucciones
            </button>
          </form>
          <p className="text-sm text-center text-white mt-4">
            Volve a{" "}
            <Link to="/login" className="text-green-500 hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OlvidePassword;
