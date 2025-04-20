import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './styleStats.css';

function RegisterGroup({ user }) {
  const [groupId, setGroupId] = useState('');
  const [groupTitle, setGroupTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      setMessage('Ошибка: вы не авторизованы.');
      return;
    }

    if (!groupId.trim() || !groupTitle.trim()) {
      setMessage('Пожалуйста, заполните все поля.');
      return;
    }

    try {
      await setDoc(doc(db, 'groups', groupId.trim()), {
        info: {
          title: groupTitle.trim(),
          admin_email: user.email,
        },
      });
      setMessage(' Группа успешно зарегистрирована!');
      setGroupId('');
      setGroupTitle('');
      console.log('Зарегистрировано:', groupId, groupTitle);
    } catch (error) {
      console.error('Ошибка при записи в Firestore:', error);
      setMessage(' Не удалось зарегистрировать группу. Проверь консоль.', error);
    }
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
        />
        <input
          type="text"
          placeholder="Название группы"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
        />
        <button type="submit">Зарегистрировать</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default RegisterGroup;
