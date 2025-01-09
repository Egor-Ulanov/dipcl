import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Home from './Home';
import ProfileSettings from './ProfileSettings';
import Stats from './Stats';
import Menu from './Menu';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      {user && <Menu setUser={setUser} />} {/* Показываем меню только если пользователь авторизован */}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/check" /> : <Auth setUser={setUser} />}
        />
        <Route
          path="/check"
          element={user ? <Home user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/stats"
          element={user ? <Stats user={user}/> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfileSettings user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
