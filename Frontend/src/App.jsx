import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Logo2 from "../src/assets/sfd.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/login/Login";
import HomePage from "./pages/home/HomePage";
import Registro from "./pages/registro/Registro";
import ConfirmarPage from "./pages/confirmado/ConfirmarPage";
import OlvidePassword from "./pages/OlvidePassword/OlvidePassword";
import NuevoPassword from "./pages/nuevoPassword/NuevoPassword";

function App() {
  return (
    <div>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <main className="">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/confirm/:token" element={<ConfirmarPage />} />
            <Route path="/forgot-password" element={<OlvidePassword />} />
            <Route path="/forgot-password/:token" element={<NuevoPassword />} />
          </Routes>
        </main>
      </BrowserRouter>
      <footer className="bg-gray-800 text-white mt-10">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center">
          {/* Título de la página */}
          <img src={Logo2} alt="Logo TFF" className="" />

          {/* Mensaje o copyright */}
          <p className="text-gray-300 text-center">
            © {new Date().getFullYear()} TuFutbolFavorito. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
