import React, { useState } from 'react';
import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './stylesTelegramGroup.css';

function TelegramGroup() {
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const telegramLink = "https://t.me/+3GKpkziwWYxmMzgy"; 

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      
      const storageRef = ref(storage, `qr-code/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setQrImage(url);
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      setError('Не удалось загрузить изображение');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR-код Telegram группы</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <img src="${qrImage}" alt="QR-код Telegram группы" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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