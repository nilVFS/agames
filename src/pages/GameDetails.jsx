// pages/GameDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, doc, onSnapshot, updateDoc } from "../../firebase";
import Modal from "../components/Modal";
import "./GameDetails.css";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import starIcon from "../assets/icons/star.png";

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
const [editingNoteIndex, setEditingNoteIndex] = useState(-1);

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
    const updatedBlocks = [...game.blocks];
    updatedBlocks[blockIndex].notes.splice(noteIndex, 1);

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

      <div className="row-2">
        <div className="left-column">
          <img src={game.image} alt={game.name} className="game-details-image" />
          <div className="game-stats">
            <p><strong>Оценка:</strong> {game.rating ? `${game.rating}/10` : "Не указана"}</p>
            <p><strong>Статус:</strong> {statusLabels[game.status]}</p>
            <p><strong>Проведено времени:</strong> {game.hoursPlayed ? `${game.hoursPlayed} ч.` : "Не указано"}</p>
            <p><strong>Дата последнего изменения:</strong> {new Date(game.lastUpdated).toLocaleDateString("ru-RU")}</p>
          </div>
        </div>

        <div className="right-column">
          <div className="review-section">
            <h3>Отзыв об игре</h3>
            <div className="review-text">{game.review || "Нет отзыва"}</div>
          </div>

          <div className="notes-section">
            {game.blocks && game.blocks.length > 0 ? (
              <ul className="blocks-list">
                {game.blocks.map((block, blockIndex) => (
                  <li key={blockIndex} className="block-item">
                    <div className="block-header">
                      <h3>{block.title}</h3>
                      {isAdmin && (
                        <div className="block-actions">
                          <button
                            className="edit-block-button"
                            onClick={() => {
                              setBlockTitleInput(block.title);
                              setEditingBlockIndex(blockIndex);
                              setShowNoteModal(true);
                            }}
                          >
                            ✏️ Редактировать блок
                          </button>
                          <button
                            className="delete-block-button"
                            onClick={() => handleDeleteBlock(blockIndex)}
                          >
                            ❌ Удалить блок
                          </button>
                          <button
                            className="add-note-to-block"
                            onClick={() => openAddNoteModal(blockIndex)}
                          >
                            ➕ Добавить заметку
                          </button>
                        </div>
                      )}
                    </div>
                    <ul className="notes-grid">
                      {block.notes && block.notes.length > 0 ? (
                        <div className="notes-list-container">
                          {block.notes.map((note, noteIndex) => (
                            <li key={noteIndex} className="note-card">
                              <h4>
                                {note.title}
                                {isAdmin && (
                                  <button
                                    className="delete-note-button"
                                    onClick={() => handleDeleteNote(blockIndex, noteIndex)}
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
                  </li>
                ))}
              </ul>
            ) : (
              <p>Нет блоков с заметками</p>
            )}
          </div>
        </div>
      </div>

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