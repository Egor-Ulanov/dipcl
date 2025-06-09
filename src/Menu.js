import React from 'react';
import { useNavigate } from 'react-router-dom';
import './stylesMenu.css'; // Подключаем стили

function Menu({ setUser, isEditing, setIsEditing }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null); // Сбрасываем пользователя для выхода из приложения
    navigate('/'); // Перенаправляем на страницу авторизации
  };

  return (
    <nav className="menu-container">
      <button className="menu-button" onClick={() => navigate('/home')}>
        Главная
      </button>
      <button className="menu-button" onClick={() => navigate('/check')}>
        Проверка текста
      </button>
      <button className="menu-button" onClick={() => navigate('/stats')}>
        Статистика
      </button>
      <button 
        className={`menu-button ${isEditing ? 'active' : ''}`} 
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? 'Завершить редактирование' : 'Редактировать сайт'}
      </button>
      <button className="menu-button" onClick={() => navigate('/register-group')}>
        Регистрация группы(Telegram)
      </button>
      <button className="menu-button" onClick={() => navigate('/telegram-group')}>
        QR-код Telegram
      </button>
      <button className="menu-button" onClick={() => navigate('/instructions')}>
        Инструкция
      </button>
      <button className="menu-button" onClick={() => navigate('/change-credentials')}>
        Сменить логин/пароль
      </button>
      <button className="menu-button logout" onClick={handleLogout}>
        Выйти
      </button>
    </nav>
  );
}

export default Menu;
