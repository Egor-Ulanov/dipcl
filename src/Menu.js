import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './stylesMenu.css'; // Подключаем стили

function Menu({ setUser, isEditing, setIsEditing }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null); // Сбрасываем пользователя для выхода из приложения
    navigate('/'); // Перенаправляем на страницу авторизации
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/home')}>
        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="logo-text">Text Checker</span>
      </div>

      <div className="navbar-links">
        <div className={`nav-link ${isActive('/check') ? 'active' : ''}`} onClick={() => navigate('/check')}>
          Проверка текста
        </div>
        <div className={`nav-link ${isActive('/stats') ? 'active' : ''}`} onClick={() => navigate('/stats')}>
          Статистика
        </div>
        <div 
          className={`nav-link ${isEditing ? 'active' : ''}`} 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Завершить редактирование' : 'Редактировать сайт'}
        </div>
        <div className={`nav-link ${isActive('/register-group') ? 'active' : ''}`} onClick={() => navigate('/register-group')}>
          Регистрация группы
        </div>
        <div className={`nav-link ${isActive('/telegram-group') ? 'active' : ''}`} onClick={() => navigate('/telegram-group')}>
          QR-код Telegram
        </div>
        <div className={`nav-link ${isActive('/instructions') ? 'active' : ''}`} onClick={() => navigate('/instructions')}>
          Инструкция
        </div>
        <div className={`nav-link ${isActive('/change-credentials') ? 'active' : ''}`} onClick={() => navigate('/change-credentials')}>
          Профиль
        </div>
      </div>

      <div className="navbar-actions">
        <div className="nav-link logout" onClick={handleLogout}>
          <svg className="logout-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Выйти</span>
        </div>
      </div>
    </nav>
  );
}

export default Menu;
