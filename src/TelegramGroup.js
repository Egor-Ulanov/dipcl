import React, { useState } from 'react';
import './stylesTelegramGroup.css';

const CLOUDINARY_UPLOAD_PRESET = 'diplom';
const CLOUDINARY_CLOUD_NAME = 'dh2qb7atd';

function TelegramGroup() {
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const telegramLink = "https://t.me/+3GKpkziwWYxmMzgy";

  const uploadToCloudinary = async (file) => {
    console.log('Начинаем загрузку в Cloudinary...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
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
      return data.secure_url;
    } catch (error) {
      console.error('Ошибка при загрузке в Cloudinary:', error);
      throw error;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      const url = await uploadToCloudinary(file);
      setQrImage(url);
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      setError('Не удалось загрузить изображение');
    } finally {
      setLoading(false);
    }
  };

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
    
    // Печатаем
    window.print();
    
    // Восстанавливаем оригинальное содержимое
    document.body.innerHTML = originalContents;
  };

  return (
    <div className="telegram-group-container">
      <h1>Присоединяйтесь к нашей группе в Telegram</h1>
      
      <div className="qr-section">
        {qrImage ? (
          <div className="qr-code-container">
            <img src={qrImage} alt="QR-код Telegram группы" className="qr-code" />
            <div className="actions">
              <button onClick={handlePrint} className="print-button">
                Распечатать QR-код
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading}
            />
            {loading && <div className="loading">Загрузка...</div>}
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>

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