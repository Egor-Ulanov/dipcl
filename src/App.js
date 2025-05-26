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
import PrivateRoute from './PrivateRoute';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/home" /> : <Auth setUser={setUser} />
          } 
        />
        <Route
          path="/home"
          element={
            <PrivateRoute user={user}>
              <div>
                <Menu setUser={setUser} />
                <HomePage />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/check"
          element={
            <PrivateRoute user={user}>
              <div>
                <Menu setUser={setUser} />
                <Check />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <PrivateRoute user={user}>
              <div>
                <Menu setUser={setUser} />
                <Stats />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/register-group"
          element={
            <PrivateRoute user={user}>
              <div>
                <Menu setUser={setUser} />
                <RegisterGroup />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute user={user}>
              <div>
                <Menu setUser={setUser} />
                <Profile user={user} />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/instructions"
          element={
            <PrivateRoute user={user}>
              <div>
                <Menu setUser={setUser} />
                <Instructions />
              </div>
            </PrivateRoute>
          }
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
