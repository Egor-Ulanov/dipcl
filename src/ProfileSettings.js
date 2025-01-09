import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './stylesProfile.css';

function ProfileSettings({ user }) {
  const [profileData, setProfileData] = useState({
    login: '',
    email: '',
    age: '',
    gender: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setProfileData(userDoc.data());
      } else {
        console.error('Профиль не найден');
      }
    };

    fetchProfileData();
  }, [user.uid]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        login: profileData.login,
        age: profileData.age,
        gender: profileData.gender,
      });

      if (profileData.email !== user.email) {
        await updateEmail(user, profileData.email);
      }

      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      setMessage('Изменения успешно сохранены.');
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      setMessage('Ошибка: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Настройки профиля</h2>
      <form onSubmit={handleSaveChanges} className="profile-form">
        <div className="form-group">
          <label>Логин:</label>
          <input
            type="text"
            value={profileData.login}
            onChange={(e) => setProfileData({ ...profileData, login: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Почта:</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Возраст:</label>
          <input
            type="number"
            value={profileData.age}
            onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Пол:</label>
          <select
            value={profileData.gender}
            onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
          >
            <option value="">Не указан</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
            <option value="other">Другой</option>
          </select>
        </div>
        <div className="form-group">
          <label>Новый пароль:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Введите новый пароль (необязательно)"
          />
        </div>
        <button type="submit" className="save-button" disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ProfileSettings;
