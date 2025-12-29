import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../store/usersStore";
import Footer from "../footer/Footer";

function Registro() {
  const { register, error, loading } = useUserStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    user: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const res = await register(form);

    if (res?.msg) {
      alert(res.msg);
      navigate("/login");
    }
  };

  return (
    <>
      <div className="mt-24 ">
        <h2 className="text-4xl text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100 font-bold text-center mb-20">
          BIENVENIDO A TFF
        </h2>
        <div className="max-w-sm bg-black border-2 border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#ffffff] text-green-600 mx-auto p-4  rounded-lg">
          <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-100 font-bold text-center mb-2">
            REGISTRATE
          </h2>
          {error && (
            <p className="text-red-500 mb-2 mt-2 text-sm text-center">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              name="user"
              value={form.user}
              onChange={handleChange}
              className="w-full p-2 border text-white border-green-500 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border text-white border-green-500 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 border text-white border-green-500 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border text-white border-green-500 rounded outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              required
            />
            <button
              type="submit"
              className="w-full mt-5 p-2 bg-green-500 font-bold text-black rounded hover:bg-green-400 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Registrate"}
            </button>
          </form>
          {/* Link a la página de login */}
          <p className="text-sm text-center text-white mt-4">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-green-500 hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Registro;
