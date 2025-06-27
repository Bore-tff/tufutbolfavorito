import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login/Login";
import HomePage from "./pages/home/HomePage";
import ElegirEquipo from "./pages/elegirEquipo/ElegirEquipo";
import Registro from "./pages/registro/Registro";

function App() {
  return (
    <div>
      <BrowserRouter>
        <main className="">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/elegirEquipo" element={<ElegirEquipo />} />
            <Route path="/HomePage" element={<HomePage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
