// Компонент для проверки текста на наличие запрещенного контента
import React, { useState } from 'react';
import * as Mammoth from 'mammoth';  // Библиотека для работы с .docx файлами
import './stylesCheck.css';

function Check({ user }) {
  // Состояния компонента
  const [text, setText] = useState("");           // Текст для проверки
  const [result, setResult] = useState(null);     // Результаты проверки
  const [isLoading, setIsLoading] = useState(false);  // Состояние загрузки
  const [url, setUrl] = useState("");            // URL для проверки

  // Обработка загрузки файлов (.txt и .docx)
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.type === "text/plain") {
      // Обработка .txt файлов
      const text = await file.text();
      setText(text);
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // Обработка .docx файлов
      const arrayBuffer = await file.arrayBuffer();
      Mammoth.extractRawText({ arrayBuffer })
        .then((result) => setText(result.value))
        .catch((error) => console.error("Ошибка при обработке .docx файла:", error));
    } else {
      alert("Поддерживаются только файлы .txt и .docx");
    }
  };

  // Проверка введенного текста
  const handleCheck = async () => {
    if (isLoading) return;
    setResult(null);
    setIsLoading(true);
    try {
      const response = await fetch("https://dip-kenh.onrender.com/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          email: user.email,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Ошибка при проверке текста:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка контента по URL
  const handleUrlCheck = async () => {
    if (isLoading) return;
    setResult(null);
    setIsLoading(true);
    try {
      const response = await fetch("https://dip-kenh.onrender.com/check-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          email: user.email,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Ошибка при проверке URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Рендер компонента
  return (
    <div className="check-page">
      <div className="check-content">
        {/* Заголовок страницы */}
        <div className="check-header">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 7.58L10 14.17L7.41 11.59L9 10L12 13L18 5L16.59 7.58Z" fill="currentColor"/>
            </svg>
          </div>
          <h1>Проверка текста на запрещённый контент</h1>
        </div>

        <div className="check-form">
          {/* Секция ввода данных */}
          <div className="input-section">
            {/* Поле для ввода URL */}
            <div className="input-group">
              <label>URL для проверки</label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="Введите URL для проверки"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button 
                  onClick={handleUrlCheck} 
                  disabled={isLoading}
                  className="action-button"
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
                      </svg>
                      <span>Проверить URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Поле для ввода текста */}
            <div className="input-group">
              <label>Текст для проверки</label>
              <textarea
                placeholder="Введите текст или загрузите файл..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            {/* Загрузка файла */}
            <div className="file-upload">
              <input 
                type="file" 
                id="file-input" 
                accept=".txt, .docx" 
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <label htmlFor="file-input">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
                <span>Загрузить файл</span>
                <small>.txt или .docx</small>
              </label>
            </div>

            {/* Кнопка проверки текста */}
            <button 
              onClick={handleCheck} 
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
                  </svg>
                  <span>Проверить текст</span>
                </>
              )}
            </button>
          </div>

          {/* Секция результатов проверки */}
          {result && (
            <div className="results-section">
              <h2>Результаты проверки</h2>
              {/* Если есть массив предложений */}
              {Array.isArray(result.sentences) ? (
                <div>
                  {result.sentences.map((sent, idx) => (
                    <div key={idx} className={`result-card ${sent.is_safe ? 'safe' : 'toxic'}`} style={{marginBottom: '12px'}}>
                      <div className="result-details">
                        <div><b>Предложение:</b> {sent.text}</div>
                        <div className="result-status">
                          Статус: <span>{sent.is_safe ? "Безопасно" : "Обнаружены нарушения"}</span>
                        </div>
                        {!sent.is_safe && sent.violations?.length > 0 && (
                          <div className="violations">
                            <h3>Найденные нарушения:</h3>
                            <ul>
                              {sent.violations.map((violation, index) => (
                                <li key={index}>{violation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`result-card ${result.is_safe ? 'safe' : 'toxic'}`}>
                  <div className="result-icon">
                    {result.is_safe ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  <div className="result-details">
                    <div className="result-status">
                      Статус: <span>{result.is_safe ? "Безопасно" : "Обнаружены нарушения"}</span>
                    </div>
                    {!result.is_safe && result.violations?.length > 0 && (
                      <div className="violations">
                        <h3>Найденные нарушения:</h3>
                        <ul>
                          {result.violations.map((violation, index) => (
                            <li key={index}>{violation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Check;
