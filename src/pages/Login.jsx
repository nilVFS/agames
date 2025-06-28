// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./auth.css";
// Login.jsx
import useAuth from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      import("../../firebase").then(({ auth }) => {
        signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            navigate("/games");
          })
          .catch((err) => {
            setError("Неверный логин или пароль");
          });
      });
    } catch (err) {
      setError("Ошибка входа");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Вход</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" className="auth-button">Войти</button>
          <p className="auth-switch">
            Нет аккаунта? <a href="/register">Зарегистрируйтесь</a>
          </p>
        </form>
      </div>
    </div>
  );
}


