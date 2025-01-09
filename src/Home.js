import React, { useState } from 'react';
import * as Mammoth from 'mammoth';
import './stylesHome.css';

function Home({ user }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.type === "text/plain") {
      const text = await file.text();
      setText(text);
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
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

  return (
    <div className="file-check-container">
      <h1>Проверка текста на запрещённый контент</h1>
      <textarea
        placeholder="Введите URL для проверки"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleUrlCheck} disabled={isLoading}>
        {isLoading ? "Загрузка..." : "Проверить URL"}
      </button>
      <textarea
        rows="5"
        placeholder="Введите текст..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <label>
        Перетащите файл сюда для загрузки
        <input type="file" accept=".txt, .docx" onChange={(e) => handleFileUpload(e.target.files[0])} />
      </label>
      <button onClick={handleCheck} disabled={isLoading}>
        {isLoading ? "Загрузка..." : "Проверить текст"}
      </button>
      {result && (
        <div className="results">
          <h3>Результаты анализа:</h3>
          <p>
            Безопасен:{" "}
            <span className={result.is_safe ? "safe" : "toxic"}>
              {result.is_safe ? "Да" : "Нет"}
            </span>
          </p>
          <p>
            Нарушения: {result.violations?.length > 0 ? result.violations.join(", ") : "Нет"}
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;
