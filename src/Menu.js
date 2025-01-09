import React from 'react';
import { useNavigate } from 'react-router-dom';
import './stylesMenu.css'; // Подключаем стили

function Menu({ setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null); // Сбрасываем пользователя для выхода из приложения
    navigate('/'); // Перенаправляем на страницу авторизации
  };

  return (
    <nav className="menu-container">
      <button className="menu-button" onClick={() => navigate('/check')}>
        Проверка текста
      </button>
      <button className="menu-button" onClick={() => navigate('/stats')}>
        Статистика
      </button>
      <button className="menu-button" onClick={() => navigate('/profile')}>
        Настройки профиля
      </button>
      <button className="menu-button" onClick={() => navigate('/instructions')}>
  Инструкция
</button>
      <button className="menu-button logout" onClick={handleLogout}>
        Выйти
      </button>
    </nav>
  );
}

export default Menu;
