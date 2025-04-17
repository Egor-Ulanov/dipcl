import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './styleStats.css';

function RegisterGroup({ user }) {
  const [groupId, setGroupId] = useState('');
  const [groupTitle, setGroupTitle] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!groupId || !groupTitle || !user?.email) return;
    if (!groupId || !groupTitle) {
      alert("Заполните все поля");
      return;
    }
    try {
      await setDoc(doc(db, 'groups', groupId), {
        info: {
          title: groupTitle,
          admin_email: user.email,
        },
      });
      setSuccess(true);
    } catch (err) {
      console.error('Ошибка при регистрации группы:', err);
    }
    console.log("Попытка зарегистрировать:", groupId, groupTitle);
  };

  return (
    <div className="register-group">
      <h2>Регистрация группы Telegram</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="ID группы (chat.id)"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Название группы"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          required
        />
        <button type="submit">Зарегистрировать</button>
        {success && <p className="success">Группа успешно зарегистрирована!</p>}
      </form>
    </div>
  );
}

export default RegisterGroup;
