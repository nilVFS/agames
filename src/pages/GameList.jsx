// src/pages/GameList/GameList.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  db,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc
} from "../../firebase";
import Modal from "../components/Modal";
import "./GameList.css";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function GameList() {
  const { isAdmin } = useAuth();
  const [games, setGames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [localSearch, setLocalSearch] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Теперь определён
  const [activeIndex, setActiveIndex] = useState(-1); // ✅ Теперь определён
  
  // Загрузка данных из Firestore
  useEffect(() => {
    const gamesCollection = collection(db, "games");
    const unsubscribe = onSnapshot(gamesCollection, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedList = list.sort(
        (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );
      setGames(sortedList);
    });
    return () => unsubscribe();
  }, []);

  // Поиск через RAWG API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.rawg.io/api/games?key=21ef7b1caed44e36abf6e96f359362ef&search=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();

        const formattedResults = data.results.map((game) => ({
          id: game.id,
          name: game.name,
          image: game.background_image
        }));

        setResults(formattedResults);
      } catch (err) {
        console.error("Ошибка при поиске:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Добавление новой игры
  const handleAddFromSearch = async (game) => {
    const gamesCollection = collection(db, "games");
    await addDoc(gamesCollection, {
      name: game.name,
      image: game.image,
      rating: null,
      review: "",
      hoursPlayed: 0,
      status: "in-progress",
      lastUpdated: new Date().toISOString(),
      notes: []
    });

    setSearchQuery("");
    setResults([]);
    setShowModal(false);
  };

  // Удаление игры
  const handleDeleteGame = async (gameId) => {
    const gameDoc = doc(db, "games", gameId);
    await deleteDoc(gameDoc);
  };

  // Фильтрация по локальному поиску
  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <div className="game-list-container">
      <h2>Мои игры</h2>

      {/* Локальный поиск */}
      <input
        type="text"
        placeholder="Поиск по играм..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="search-input"
      />

      {/* Кнопка добавления игры — только для admin */}
      {isAdmin && (
        <button onClick={() => setShowModal(true)} className="add-button">Добавить игру</button>
      )}

      {/* Список игр */}
      {/* Список игр */}
      <div className="game-cards">
        {filteredGames.length === 0 ? (
          <p>Список игр пуст</p>
        ) : (
          <div className="cards-grid">
            {filteredGames.map((game) => (
              <Link
                to={`/games/${game.id}`}
                key={game.id}
                className="game-card-link"
                onClick={() => {
                }}
              >
                <div className="game-card">
                  <img
                    src={game.image || "https://placehold.co/300x200 "}
                    alt={game.name}
                    className="game-card-image"
                  />
                  <div className="game-card-info">
                    <span className="game-card-title">{game.name}</span>
                    {game.rating && (
                      <span className="game-card-rating">⭐ {game.rating}/10</span>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      className="delete-game-button"
                      onClick={(e) => {
                        e.preventDefault(); // Останавливаем всплытие
                        handleDeleteGame(game.id);
                      }}
                    >
                      ❌ Удалить
                    </button>
                  )}
                  <div className={`status-indicator ${game.status}`}>
                    {statusLabels[game.status]}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      

      {/* Модальное окно поиска */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3>Найти игру</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите название игры"
            className="modal-input"
            autoFocus
          />
          <div className="search-results">
            {loading ? (
              <p>Идёт поиск...</p>
            ) : results.length > 0 ? (
              <ul>
                {results.map((game, index) => (
                  <li
                    key={index}
                    className={`search-result-item ${
                      index === activeIndex ? "active" : ""
                    }`}
                    onClick={() => handleAddFromSearch(game)}
                  >
                    <img src={game.image} alt={game.name} />
                    <span>{game.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>По запросу ничего не найдено</p>
            )}
          </div>
          <div className="modal-buttons">
            <button onClick={() => setShowModal(false)} className="cancel-button">
              Закрыть
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const statusLabels = {
  "in-progress": "в процессе",
  "completed": "пройдено",
  "dropped": "брошена"
};

