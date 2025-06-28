// src/pages/Register.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./auth.css";
// Login.jsx
import useAuth from "../hooks/useAuth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Укажите имя пользователя");
      return;
    }

    try {
      // Создаем пользователя через Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Сохраняем дополнительные данные в Firestore
      const userRef = doc(db, "users", user.uid); // uid из Auth
      await setDoc(userRef, {
        email: user.email,
        username,
        role: "user", // стандартная роль
        createdAt: new Date().toISOString()
      });

      navigate("/login");
    } catch (err) {
      setError("Ошибка регистрации");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Регистрация</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="auth-input"
          />
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
          <button type="submit" className="auth-button">Зарегистрироваться</button>
          <p className="auth-switch">
            Уже есть аккаунт? <a href="/login">Войдите</a>
          </p>
        </form>
      </div>
    </div>
  );
}
