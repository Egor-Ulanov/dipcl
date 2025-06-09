import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { setDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './styles.css';

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, setLogin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('login', '==', login));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('Логин не найден. Проверьте данные.');
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userEmail = userData.email;

        const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
        setUser(userCredential.user);
      } else {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('login', '==', login));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          throw new Error('Такой логин уже существует');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          login: login,
          email: email,
          createdAt: new Date(),
        });

        setUser(user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="app-icon"></div>
      <h1>{isLogin ? 'Вход' : 'Регистрация'}</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleAuth}>
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          disabled={loading}
          required
        />
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        )}
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>
      <button 
        className="switch-button" 
        onClick={() => {
          setIsLogin(!isLogin);
          setError('');
        }}
        disabled={loading}
      >
        {isLogin ? 'Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
      </button>
    </div>
  );
}

export default Auth;
