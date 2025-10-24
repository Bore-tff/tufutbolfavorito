import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/usersStore";

function Registro() {
  const { register, error, loading } = useUserStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    user: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(form);

    if (res?.msg) {
      // Si el backend devuelve un mensaje de éxito
      alert(res.msg);
      navigate("/login");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="block w-96">
        <h1 className=" font-bold text-5xl mb-5">Welcome To!</h1>
        <h1 className="text-orange-500 font-bold text-5xl">Hunting Arg</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            name="user"
            value={form.user}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-orange-500"
            placeholder="Nombre"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-orange-500"
            placeholder="tuemail@mail.com"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-orange-500"
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 font-bold cursor-pointer text-white py-2 rounded-lg transition"
        >
          {loading ? "Cargando..." : "Registrarse"}
        </button>

        <p className="text-sm text-center mt-4">
          Ya tienes una cuenta?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-orange-500 cursor-pointer hover:underline"
          >
            Iniciar Sesión
          </span>
        </p>
      </form>
    </div>
  );
}

export default Registro;
