import React, { useState } from 'react';
import * as Mammoth from 'mammoth';
import './styles.css';
import { useNavigate } from 'react-router-dom';

function Home({ user }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.type === 'text/plain') {
      const text = await file.text();
      setText(text);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      Mammoth.extractRawText({ arrayBuffer })
        .then((result) => setText(result.value))
        .catch((error) => console.error("Ошибка при обработке .docx файла:", error));
    } else {
      alert("Поддерживаются только файлы .txt и .docx");
    }
  };

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
          text: text,
          email: user.email, // Передаём email текущего пользователя
        }),
      });
      const data = await response.json();
      console.log("Ответ от сервера:", data);
      if (Array.isArray(data.results)) {
        setResult(data);
      } else {
        setResult({ is_safe: true, results: [] });
      }
    } catch (error) {
      console.error("Ошибка при проверке текста:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlCheck = async () => {
    if (isLoading) return;
    setResult(null);
    setIsLoading(true);
    try {
        const response = await fetch('https://dip-kenh.onrender.com/check-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,  // Отправка URL
                email: user.email,  // Отправка email текущего пользователя
            }),
        });
        const data = await response.json();
        setResult(data);
    } catch (error) {
        console.error('Ошибка при проверке URL:', error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="file-check-container">
      <h1>Проверка текста на запрещённый контент</h1>
      {/* Поле для URL */}
      <textarea
        type="text"
        placeholder="Введите URL для проверки"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ marginTop: '20px', width: '100%' }}
      />
      <button onClick={handleUrlCheck} disabled={isLoading}>
        {isLoading ? 'Загрузка...' : 'Проверить URL'}
      </button>
      <textarea
        rows="5"
        cols="50"
        placeholder="Введите текст..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <label>
        Перетащите файл сюда для загрузки
        <input
          type="file"
          accept=".txt, .docx"
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
      </label>
      <button onClick={handleCheck} disabled={isLoading}>
        {isLoading ? "Загрузка..." : "Проверить"}
      </button>
      {result && (
        <div>
          <h3>Результаты анализа:</h3>
          <p>Безопасен: {result.is_safe ? 'Да' : 'Нет'}</p>
          <p>
            Нарушения: {result.violations && result.violations.length > 0
              ? result.violations.join(', ')
              : 'Нет'}
          </p>
          <h4>Детализация по предложениям:</h4>
          {Array.isArray(result.results) && result.results.length > 0 ? (
            result.results.map((res, index) => (
              <div key={index}>
                <p
                  style={{
                    color: res.is_toxic ? "red" : "black",
                    fontWeight: res.is_toxic ? "bold" : "normal",
                  }}
                >
                  {res.sentence}
                </p>
                {res.is_toxic && res.predictions && Array.isArray(res.predictions) && (
                  <ul>
                    {res.predictions.map((pred, i) => (
                      <li key={i}>
                        {pred.label}: {Math.round(pred.score * 100)}%
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          ) : (
            <p>Анализ не дал результатов.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
