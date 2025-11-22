import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { confirmarCuenta } from "../../api/auth";

const ConfirmarPage = () => {
  const { token } = useParams();

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const confirmar = async () => {
      try {
        const { data } = await confirmarCuenta(token);
        setMensaje(data.msg || "Tu cuenta ha sido confirmada correctamente.");
        setError(false);
      } catch (err) {
        setError(true);
        setMensaje(err.response?.data?.msg || "Error al confirmar la cuenta");
      }
    };

    confirmar();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <h1 className="text-green-500 font-bold text-4xl mb-6">
        TU FUTBOL FAVORITO
      </h1>
      <div className="bg-black border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff] text-green-600 p-6 rounded-2xl  text-center max-w-xl">
        <p className=" text-white">
          Felicitaciones, tu cuenta esta confirmada. Para Iniciar Sesión poder
          hacer click acá 👉{" "}
          <Link
            to="/login"
            className="text-green-500 font-semibold hover:underline"
          >
            Iniciar Sesion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ConfirmarPage;
