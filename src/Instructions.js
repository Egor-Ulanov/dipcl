import React from 'react';
import './stylesInstructions.css';

function Instructions() {
  return (
    <div className="instructions-container">
      <h1>Инструкция по использованию приложения</h1>
      <div className="instructions-content">
        <h2>Основные разделы:</h2>
        <ul>
          <li><strong>Проверка текста:</strong> Раздел для проверки текста или URL на запрещённый контент.</li>
          <li><strong>Статистика:</strong> Показывает графики и календарь проверок.</li>
          <li><strong>Настройки профиля:</strong> Позволяет изменять данные профиля, включая пароль и почту.</li>
        </ul>
        <h2>Что делать:</h2>
        <ol>
          <li>Зайдите в раздел "Проверка текста".</li>
          <li>Введите текст, URL или загрузите файл для проверки.</li>
          <li>Перейдите в "Статистика", чтобы посмотреть результаты проверок.</li>
          <li>При необходимости измените данные профиля в разделе "Настройки профиля".</li>
        </ol>
        <p>Если возникли вопросы, обратитесь к администратору или разработчику.</p>
      </div>
    </div>
  );
}

export default Instructions;
