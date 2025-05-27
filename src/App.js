import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Menu from './Menu';
import HomePage from './HomePage';
import Check from './Check';
import Stats from './Stats';
import RegisterGroup from './RegisterGroup';
import Profile from './ProfileSettings';
import Instructions from './Instructions';
import './stylesApp.css';

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
            <Route path="/check" element={<Check />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/register-group" element={<RegisterGroup />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
