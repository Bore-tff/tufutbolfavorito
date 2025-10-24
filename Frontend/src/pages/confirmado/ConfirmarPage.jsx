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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-2xl shadow-md text-center max-w-xl">
        <p className=" text-gray-700">
          Felicitaciones, tu cuenta esta confirmada. Para Iniciar Sesión poder
          hacer click acá 👉{" "}
          <Link
            to="/login"
            className="text-orange-500 font-semibold hover:underline"
          >
            Iniciar Sesion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ConfirmarPage;
