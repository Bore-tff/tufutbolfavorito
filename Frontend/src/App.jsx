import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/login/Login";
import HomePage from "./pages/home/HomePage";
import Registro from "./pages/registro/Registro";

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
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
