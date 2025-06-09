import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Menu from './Menu';
import HomePage from './HomePage';
import Check from './Check';
import Stats from './Stats';
import RegisterGroup from './RegisterGroup';
import TelegramGroup from './TelegramGroup';
import Instructions from './Instructions';
import ChangeCredentials from './components/ChangeCredentials';

function App() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Menu setUser={setUser} isEditing={isEditing} setIsEditing={setIsEditing} />
        <div className="content-container">
          <Routes>
            <Route path="/home" element={<HomePage isEditing={isEditing} />} />
            <Route path="/check" element={<Check user={user} />} />
            <Route path="/stats" element={<Stats user={user} />} />
            <Route path="/register-group" element={<RegisterGroup user={user} />} />
            <Route path="/telegram-group" element={<TelegramGroup isEditing={isEditing} />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/change-credentials" element={<ChangeCredentials />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
