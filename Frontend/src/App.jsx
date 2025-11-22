import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

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
    </div>
  );
}

export default App;
