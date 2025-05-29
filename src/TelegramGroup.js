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
    <div className="telegram-group-container">
      <h1>Присоединяйтесь к нашей группе в Telegram</h1>
      
      <div className="qr-section">
        {qrImage ? (
          // Если QR-код загружен, показываем его и кнопки управления
          <div className="qr-code-container">
            <img src={qrImage} alt="QR-код Telegram группы" className="qr-code" />
            <div className="actions">
              <button onClick={handlePrint} className="print-button">
                Распечатать QR-код
              </button>
              {isEditing && (
                <button 
                  onClick={handleDeleteQrCode}
                  className="delete-button"
                >
                  Удалить QR-код
                </button>
              )}
            </div>
          </div>
        ) : isEditing ? (
          // Если режим редактирования и QR-код не загружен, показываем форму загрузки
          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading}
            />
            {loading && <div className="loading">Загрузка...</div>}
          </div>
        ) : (
          // Если не режим редактирования и QR-код не загружен
          <div className="no-qr-code">
            QR-код пока не загружен
          </div>
        )}
        
        {/* Показываем сообщение об ошибке, если есть */}
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Секция с прямой ссылкой на Telegram */}
      <div className="telegram-link">
        <p>Или присоединяйтесь напрямую по ссылке:</p>
        <a 
          href={telegramLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="telegram-button"
        >
          Присоединиться к группе
        </a>
      </div>
    </div>
  );
}

export default TelegramGroup; 