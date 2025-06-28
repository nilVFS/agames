// src/components/Header.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Header.css';
import { auth } from "../../firebase";
import useAuth from "../hooks/useAuth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Ошибка выхода:", err);
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/"><img src="coin.png" alt="" /></Link>
      </div>

      {/* Бургер-меню */}
      <button
        className="menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Навигация */}
      <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
        <ul className="nav-links">
          <li><Link to="/games" onClick={() => setIsMenuOpen(false)}>Игры</Link></li>
          <li><Link to="/debts" onClick={() => setIsMenuOpen(false)}>Долги</Link></li>
          <li>
            {currentUser ? (
              <button className="logout-button" onClick={handleSignOut}>
                Выход
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                Войти
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

