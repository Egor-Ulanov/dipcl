import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './stylesTelegramGroup.css';

// Константы для работы с Cloudinary
const CLOUDINARY_UPLOAD_PRESET = 'diplom';
const CLOUDINARY_CLOUD_NAME = 'dh2qb7atd';

function TelegramGroup({ isEditing }) {
  // Состояния компонента
  const [qrImage, setQrImage] = useState(null);     // URL QR-кода
  const [loading, setLoading] = useState(false);    // Состояние загрузки
  const [error, setError] = useState('');           // Сообщение об ошибке
  const telegramLink = "https://t.me/+3GKpkziwWYxmMzgy";  // Ссылка на группу

  // Получаем текущего пользователя
  const user = auth.currentUser;

  // Эффект для загрузки QR-кода при монтировании компонента
  useEffect(() => {
    const fetchQrCode = async () => {
      if (user) {
        // Получаем документ пользователя из Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Устанавливаем URL QR-кода из данных пользователя
          setQrImage(data.qrCodeURL || null);
        }
      }
    };
    fetchQrCode();
  }, [user]);

  // Функция для загрузки изображения в Cloudinary
  const uploadToCloudinary = async (file) => {
    console.log('Начинаем загрузку в Cloudinary...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      // Отправляем запрос на загрузку в Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки в Cloudinary: ' + response.statusText);
      }

      const data = await response.json();
      console.log('Получен ответ от Cloudinary:', data);
      return data.secure_url;  // Возвращаем URL загруженного изображения
    } catch (error) {
      console.error('Ошибка при загрузке в Cloudinary:', error);
      throw error;
    }
  };

  // Обработчик загрузки изображения
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      setError('');
      // Загружаем файл в Cloudinary
      const url = await uploadToCloudinary(file);
      
      // Сохраняем URL в Firebase
      await updateDoc(doc(db, "users", user.uid), {
        qrCodeURL: url,
      });
      
      // Обновляем локальное состояние
      setQrImage(url);
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      setError('Не удалось загрузить изображение');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик удаления QR-кода
  const handleDeleteQrCode = async () => {
    if (!user) return;
    
    try {
      // Удаляем URL QR-кода из Firebase
      await updateDoc(doc(db, "users", user.uid), {
        qrCodeURL: null,
      });
      // Очищаем локальное состояние
      setQrImage(null);
    } catch (error) {
      console.error('Ошибка при удалении QR-кода:', error);
      setError('Не удалось удалить QR-код');
    }
  };

  // Обработчик печати QR-кода
  const handlePrint = () => {
    if (!qrImage) return;
    
    // Создаем временный элемент img для печати
    const printImg = document.createElement('img');
    printImg.src = qrImage;
    printImg.style.maxWidth = '100%';
    
    // Сохраняем текущее содержимое body
    const originalContents = document.body.innerHTML;
    
    // Заменяем содержимое body на наше изображение
    document.body.innerHTML = '';
    document.body.appendChild(printImg);
    
    // Вызываем диалог печати
    window.print();
    
    // Восстанавливаем оригинальное содержимое
    document.body.innerHTML = originalContents;
  };

  return (
    <div className="telegram-page">
      <div className="telegram-content">
        <div className="telegram-header">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"/>
              <path d="M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" fill="currentColor"/>
            </svg>
          </div>
          <h1>Присоединяйтесь к нашей группе в Telegram</h1>
        </div>

        <div className="qr-section">
          {qrImage ? (
            <div className="qr-display">
              <div className="qr-image-container">
                <img src={qrImage} alt="QR-код Telegram группы" className="qr-image" />
              </div>
              <div className="qr-actions">
                <button onClick={handlePrint} className="action-button print">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" fill="currentColor"/>
                  </svg>
                  <span>Распечатать QR-код</span>
                </button>
                {isEditing && (
                  <button onClick={handleDeleteQrCode} className="action-button delete">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                    <span>Удалить QR-код</span>
                  </button>
                )}
              </div>
            </div>
          ) : isEditing ? (
            <div className="upload-zone">
              <input
                type="file"
                id="qr-upload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
              <label htmlFor="qr-upload" className="upload-label">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
                <span>Загрузить QR-код</span>
                <small>Нажмите или перетащите файл</small>
              </label>
              {loading && (
                <div className="loading-indicator">
                  <span className="loading-spinner"></span>
                  <span>Загрузка...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="no-qr-message">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
              </svg>
              <span>QR-код пока не загружен</span>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="telegram-join">
          <p>Или присоединяйтесь напрямую по ссылке:</p>
          <a 
            href={telegramLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="join-button"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.78 18.65L10.06 14.42L17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3L3.64 12C2.76 11.75 2.75 11.14 3.84 10.7L19.81 4.54C20.54 4.21 21.24 4.72 20.96 5.84L18.24 18.65C18.05 19.56 17.5 19.78 16.74 19.36L12.6 16.3L10.61 18.23C10.38 18.46 10.19 18.65 9.78 18.65Z" fill="currentColor"/>
            </svg>
            <span>Присоединиться к группе</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default TelegramGroup; 