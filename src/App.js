// Главный компонент приложения, отвечающий за маршрутизацию и управление состоянием пользователя
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Импорт компонентов приложения
import Auth from './Auth';
import Menu from './Menu';
import HomePage from './HomePage';
import Check from './Check';
import Stats from './Stats';
import RegisterGroup from './RegisterGroup';
import TelegramGroup from './TelegramGroup';
import Instructions from './Instructions';
import ChangeCredentials from './components/ChangeCredentials';
import './App.css';

function App() {
  // Состояние для хранения данных пользователя и режима редактирования
  const [user, setUser] = useState(null);          // Информация о текущем пользователе
  const [isEditing, setIsEditing] = useState(false);  // Режим редактирования контента

  // Если пользователь не авторизован, показываем страницу авторизации
  if (!user) {
    return <Auth setUser={setUser} />;
  }

  // Основной интерфейс приложения с маршрутизацией
  return (
    <Router>
      <div className="app-container">
        {/* Боковое меню с навигацией */}
        <Menu setUser={setUser} isEditing={isEditing} setIsEditing={setIsEditing} />
        
        {/* Основной контент приложения */}
        <div className="content-container">
          <Routes>
            {/* Маршруты к различным страницам приложения */}
            <Route path="/home" element={<HomePage isEditing={isEditing} />} />
            <Route path="/check" element={<Check user={user} />} />
            <Route path="/stats" element={<Stats user={user} />} />
            <Route path="/register-group" element={<RegisterGroup user={user} />} />
            <Route path="/telegram-group" element={<TelegramGroup isEditing={isEditing} />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/change-credentials" element={<ChangeCredentials />} />
            {/* Перенаправление с корневого пути на домашнюю страницу */}
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
