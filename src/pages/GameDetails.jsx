// pages/GameDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, doc, onSnapshot, updateDoc } from "../../firebase";
import Modal from "../components/Modal";
import "./GameDetails.css";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function GameDetails() {
  const { id } = useParams();
  const { isAdmin } = useAuth(); // ← Проверка роли
  const [game, setGame] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(-1);
  const [noteData, setNoteData] = useState({ title: "", rating: "", content: "" });
  const [blockTitleInput, setBlockTitleInput] = useState("");
  const [editingBlockIndex, setEditingBlockIndex] = useState(-1);
  const [selectedTab, setSelectedTab] = useState(null);

  const statusLabels = {
    "in-progress": "в процессе",
    "completed": "пройдено",
    "dropped": "брошена"
  };

  // Загрузка данных из Firebase

  useEffect(() => {
    if (!id) return;
    const gameRef = doc(db, "games", id);
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setGame(data);
        // Устанавливаем первый блок как активный, если есть блоки
        if (data.blocks && data.blocks.length > 0) {
          setSelectedTab(0); // ← Выбираем первый блок по умолчанию
        } else {
          setSelectedTab(null);
        }
        // Опционально: обновляем formData при загрузке игры
        setFormData({
          rating: data.rating || 0,
          review: data.review || "",
          hoursPlayed: data.hoursPlayed || 0,
          status: data.status || "in-progress"
        });
      }
    });
    return () => unsubscribe();
  }, [id]);

  // Форма редактирования игры
  const [formData, setFormData] = useState({
    rating: 0,
    review: "",
    hoursPlayed: 0,
    status: "in-progress"
  });

  const handleSave = async () => {
    const gameRef = doc(db, "games", id);
    await updateDoc(gameRef, {
      rating: Number(formData.rating),
      review: formData.review,
      hoursPlayed: Number(formData.hoursPlayed),
      status: formData.status,
      lastUpdated: new Date().toISOString()
    });

    setShowEditModal(false);
  };

  // Открытие формы добавления заметки в блок
  const openAddNoteModal = (blockIndex) => {
    setSelectedBlockIndex(blockIndex);
    setNoteData({ title: "", rating: "", content: "" });
    setShowNoteModal(true);
  };

  // Сохранение изменений блока
  const handleSaveEditedBlock = async () => {
    const updatedBlocks = [...game.blocks];
    updatedBlocks[editingBlockIndex].title = blockTitleInput;

    const gameRef = doc(db, "games", id);
    await updateDoc(gameRef, {
      blocks: updatedBlocks
    });

    setShowNoteModal(false);
    setEditingBlockIndex(-1);
  };

  // Удаление блока
  const handleDeleteBlock = async (blockIndex) => {
    const updatedBlocks = [...game.blocks];
    updatedBlocks.splice(blockIndex, 1);

    const gameRef = doc(db, "games", id);
    await updateDoc(gameRef, {
      blocks: updatedBlocks
    });
  };

  // Удаление заметки
  const handleDeleteNote = async (blockIndex, noteIndex) => {
    // Проверяем, что данные существуют
    if (!game.blocks || !game.blocks[blockIndex]?.notes) return;

    const updatedBlocks = game.blocks.map((block, idx) => {
      if (idx === blockIndex) {
        return {
          ...block,
          notes: block.notes.filter((_, i) => i !== noteIndex)
        };
      }
      return block;
    });

    const gameRef = doc(db, "games", id);
    await updateDoc(gameRef, {
      blocks: updatedBlocks
    });
  };

  if (!game) {
    return <div>Игра не найдена</div>;
  }

  return (
    <div className="game-details-container">
  <div className="row-1">
    <h2>{game.name}</h2>
    <Link to="/games" className="back-link">← Назад к списку</Link>
    {isAdmin && (
      <>
        <button onClick={() => setShowEditModal(true)} className="edit-button">Редактировать</button>
        <button
          onClick={() => {
            setBlockTitleInput("");
            setShowNoteModal(true);
          }}
          className="add-note-button"
        >
          Добавить блок
        </button>
      </>
    )}
  </div>

  {/* Изображение + статистика */}
  <div className="image-and-stats">
    <div className="image-section">
      <img src={game.image} alt={game.name} className="game-details-image" />
    </div>
    <div className="stats-section">
      <h3>Статистика</h3>
      <div className="game-stats">
        <p><strong>Оценка:</strong> {game.rating ? `${game.rating}/10` : "Не указана"}</p>
        <p><strong>Статус:</strong> {statusLabels[game.status]}</p>
        <p><strong>Проведено времени:</strong> {game.hoursPlayed ? `${game.hoursPlayed} ч.` : "Не указано"}</p>
        <p><strong>Дата последнего изменения:</strong> {new Date(game.lastUpdated).toLocaleDateString("ru-RU")}</p>
      </div>
    </div>
  </div>

  {/* Отзыв */}
  <div className="review-section">
    <h3>Отзыв об игре</h3>
    <div className="review-text">{game.review || "Нет отзыва"}</div>
  </div>

  {/* Кнопки-переключатели блоков */}
  <div className="block-tabs">
    {game.blocks?.map((block, index) => (
      <button
        key={index}
        className={`tab-button ${selectedTab === index ? "active" : ""}`}
        onClick={() => setSelectedTab(index)}
      >
        {block.title}
      </button>
    ))}
  </div>

  {/* Текущий блок с заметками */}
  <div className="current-block">
    {selectedTab !== null && game.blocks[selectedTab] ? (
      <div className="block-item">
        <div className="block-header">
          <h3>{game.blocks[selectedTab].title}</h3>
          {isAdmin && (
            <div className="block-actions">
              <button
                className="edit-block-button"
                onClick={() => {
                  setBlockTitleInput(game.blocks[selectedTab].title);
                  setEditingBlockIndex(selectedTab);
                  setShowNoteModal(true);
                }}
              >
                ✏️ Редактировать блок
              </button>
              <button
                className="delete-block-button"
                onClick={() => handleDeleteBlock(selectedTab)}
              >
                ❌ Удалить блок
              </button>
              <button
                className="add-note-to-block"
                onClick={() => openAddNoteModal(selectedTab)}
              >
                ➕ Добавить заметку
              </button>
            </div>
          )}
        </div>

        {/* Здесь можно отобразить заметки или любую другую информацию о блоке */}
        <ul className="notes-grid">
          {game.blocks[selectedTab].notes && game.blocks[selectedTab].notes.length > 0 ? (
            <div className="notes-list-container">
              {game.blocks[selectedTab].notes.map((note, noteIndex) => (
                <li key={noteIndex} className="note-card">
                  <h4>
                    {note.title}
                    {isAdmin && (
                      <button
                        className="delete-note-button"
                        onClick={() => handleDeleteNote(selectedTab, noteIndex)}
                      >
                        ❌ Удалить
                      </button>
                    )}
                  </h4>
                  {note.rating !== null && (
                    <p><strong>Рейтинг:</strong> {note.rating}/10</p>
                  )}
                  <p>{note.content}</p>
                </li>
              ))}
            </div>
          ) : (
            <p>Нет заметок в этом блоке</p>
          )}
        </ul>
      </div>
    ) : (
      <p></p>
    )}
  </div>

  {/* Модалки ниже остаются без изменений */}

      {/* Модалка: редактирование игры */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <h3>Редактировать игру</h3>
          <div className="modal-form">
            <label>
              Оценка:
              <input
                type="number"
                min="0"
                max="10"
                value={formData.rating}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rating: e.target.value }))
                }
                className="modal-input"
              />
            </label>
            <label>
              Статус:
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="modal-input"
              >
                <option value="in-progress">в процессе</option>
                <option value="completed">пройдено</option>
                <option value="dropped">брошена</option>
              </select>
            </label>
            <label>
              Проведено времени (ч):
              <input
                type="number"
                min="0"
                value={formData.hoursPlayed}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, hoursPlayed: e.target.value }))
                }
                className="modal-input"
              />
            </label>
            <label>
              Отзыв:
              <textarea
                name="review"
                value={formData.review}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, review: e.target.value }))
                }
                className="modal-textarea"
              />
            </label>
            <div className="modal-buttons">
              <button onClick={handleSave} className="save-button">Сохранить</button>
              <button onClick={() => setShowEditModal(false)} className="cancel-button">Отмена</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модалка: добавление блока */}
      {showNoteModal && (
        <Modal onClose={() => setShowNoteModal(false)}>
          <h3>Добавить блок</h3>
          <div className="modal-form">
            <label>
              Название блока:
              <input
                type="text"
                value={blockTitleInput}
                onChange={(e) => setBlockTitleInput(e.target.value)}
                className="modal-input"
                placeholder="Введите название блока"
              />
            </label>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  const updatedBlocks = [...(game.blocks || [])];
                  updatedBlocks.push({ title: blockTitleInput, notes: [] });
                  const gameRef = doc(db, "games", id);
                  updateDoc(gameRef, { blocks: updatedBlocks });
                  setShowNoteModal(false);
                  setBlockTitleInput("");
                }}
                className="save-button"
              >
                Создать блок
              </button>
              <button onClick={() => setShowNoteModal(false)} className="cancel-button">Отмена</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модалка: редактирование названия блока */}
      {showNoteModal && editingBlockIndex !== -1 && (
        <Modal onClose={() => {
          setShowNoteModal(false);
          setEditingBlockIndex(-1);
        }}>
          <h3>Редактировать название блока</h3>
          <div className="modal-form">
            <label>
              Новое название:
              <input
                type="text"
                value={blockTitleInput}
                onChange={(e) => setBlockTitleInput(e.target.value)}
                className="modal-input"
              />
            </label>
            <div className="modal-buttons">
              <button onClick={handleSaveEditedBlock} className="save-button">Сохранить</button>
              <button onClick={() => {
                setShowNoteModal(false);
                setEditingBlockIndex(-1);
              }} className="cancel-button">Отмена</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модалка: добавление заметки в блок */}
      {showNoteModal && selectedBlockIndex !== -1 && (
        <Modal onClose={() => {
          setShowNoteModal(false);
          setSelectedBlockIndex(-1);
          setNoteData({ title: "", rating: "", content: "" });
        }}>
          <h3>Добавить заметку</h3>
          <div className="modal-form">
            <label>
              Заголовок:
              <input
                type="text"
                value={noteData.title}
                onChange={(e) => setNoteData((prev) => ({ ...prev, title: e.target.value }))}
                className="modal-input"
                placeholder="Заголовок заметки"
              />
            </label>
            <label>
              Рейтинг (от 0 до 10):
              <input
                type="number"
                min="0"
                max="10"
                value={noteData.rating}
                onChange={(e) => setNoteData((prev) => ({ ...prev, rating: e.target.value }))}
                className="modal-input"
                placeholder="Рейтинг"
              />
            </label>
            <label>
              Описание:
              <textarea
                value={noteData.content}
                onChange={(e) => setNoteData((prev) => ({ ...prev, content: e.target.value }))}
                className="modal-textarea"
                placeholder="Текст заметки..."
              />
            </label>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  const updatedBlocks = [...game.blocks];
                  updatedBlocks[selectedBlockIndex].notes.unshift({
                    title: noteData.title,
                    rating: noteData.rating ? Number(noteData.rating) : null,
                    content: noteData.content
                  });

                  const gameRef = doc(db, "games", id);
                  updateDoc(gameRef, { blocks: updatedBlocks });

                  setShowNoteModal(false);
                  setNoteData({ title: "", rating: "", content: "" });
                  setSelectedBlockIndex(-1);
                }}
                className="save-button"
              >
                Сохранить заметку
              </button>
              <button onClick={() => setShowNoteModal(false)} className="cancel-button">Отмена</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


