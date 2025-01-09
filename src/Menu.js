import React from 'react';
import { useNavigate } from 'react-router-dom';

function Menu({ setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null); // Сбрасываем пользователя для выхода из приложения
    navigate('/'); // Перенаправляем на страницу авторизации
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f0f0f0' }}>
      <button onClick={() => navigate('/check')} style={{ padding: '10px 20px' }}>
        Проверка текста
      </button>
      <button onClick={() => navigate('/stats')} style={{ padding: '10px 20px' }}>
        Статистика
      </button>
      <button onClick={() => navigate('/profile')} style={{ padding: '10px 20px' }}>
        Настройки профиля
      </button>
      <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white' }}>
        Выйти
      </button>
    </nav>
  );
}

export default Menu;
