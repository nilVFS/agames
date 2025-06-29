// pages/Debts.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  db,
  doc,
  deleteDoc,
  updateDoc
} from "../../firebase";
import Modal from "../components/Modal";
import useAuth from "../hooks/useAuth"; // Импортируем хук для проверки роли
import './Debts.css'

export default function Debts() {
  const { isAdmin } = useAuth(); // Получаем роль администратора
  const [debts, setDebts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDebt, setNewDebt] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const debtsCollection = collection(db, "debts");
    const unsubscribe = onSnapshot(debtsCollection, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDebts(list);
    });

    return () => unsubscribe();
  }, []);

  const handleAddDebt = async () => {
    if (newDebt.trim() !== "") {
      const debtsCollection = collection(db, "debts");
      await addDoc(debtsCollection, { name: newDebt });
      setNewDebt("");
      setShowModal(false);
    }
  };

  const handleDeleteDebt = async (id) => {
    const debtDoc = doc(db, "debts", id);
    await deleteDoc(debtDoc);
  };

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const finishEditing = async () => {
    if (editValue.trim() === "") return;
    const debtDoc = doc(db, "debts", editingId);
    await updateDoc(debtDoc, { name: editValue });
    setEditingId(null);
  };

  return (
    <div className="debt-container">
      <h2>Долги</h2>
      {isAdmin && (
        <button onClick={() => setShowModal(true)} className="add-button">Добавить долг</button>
      )}

      <ul className="debt-list">
        {debts.map((debt) => (
          <li key={debt.id} className="debt-card">
            {editingId === debt.id ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  onBlur={finishEditing}
                  onKeyDown={(e) => e.key === "Enter" && finishEditing()}
                  className="edit-input"
                />
              </>
            ) : (
              <>
                <span>{debt.name}</span>
                {isAdmin && (
                  <button
                    className="edit-button"
                    onClick={() => startEditing(debt.id, debt.name)}
                  >
                    ✏️ Редактировать
                  </button>
                )}
                {isAdmin && (
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteDebt(debt.id)}
                  >
                    ❌ Удалить
                  </button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3>Новый долг</h3>
          <input
            type="text"
            value={newDebt}
            onChange={(e) => setNewDebt(e.target.value)}
            placeholder="Введите имя должника"
            className="modal-input"
          />
          <div className="modal-buttons">
            <button onClick={handleAddDebt} className="save-button">Сохранить</button>
            <button onClick={() => setShowModal(false)} className="cancel-button">Отмена</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

