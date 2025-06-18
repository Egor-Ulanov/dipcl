import React from 'react';
import './stylesInstructions.css';

function Instructions() {
  return (
    <div className="instructions-container">
      <div className="instructions-header">
        <svg className="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
        </svg>
        <h1>Инструкция по использованию</h1>
      </div>

      <div className="instructions-content">
        <section className="instruction-section">
          <h2>
            <svg className="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z" fill="currentColor"/>
            </svg>
            Основные разделы
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.06 9.02L14.98 9.94L5.92 19H5V18.08L14.06 9.02ZM17.66 3C17.41 3 17.15 3.1 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C18.17 3.09 17.92 3 17.66 3ZM14.06 6.19L3 17.25V21H6.75L17.81 9.94L14.06 6.19Z" fill="currentColor"/>
              </svg>
              <h3>Проверка текста</h3>
              <p>Инструмент для анализа текстовых сообщений на наличие токсичного контента и спама.</p>
              <ul>
                <li>Проверка отдельных сообщений</li>
                <li>Загрузка файлов для проверки</li>
                <li>Мгновенный результат анализа</li>
              </ul>
            </div>

            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
              </svg>
              <h3>Статистика</h3>
              <p>Визуализация данных о проверках и результатах анализа.</p>
              <ul>
                <li>Графики по периодам</li>
                <li>Фильтрация по мастерам</li>
                <li>Статистика нарушений</li>
              </ul>
            </div>

            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
              </svg>
              <h3>Управление профилем</h3>
              <p>Настройка личного кабинета и управление доступом.</p>
              <ul>
                <li>Изменение личных данных</li>
                <li>Смена пароля</li>
              </ul>
            </div>

            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
              </svg>
              <h3>Управление группами</h3>
              <p>Работа с группами Telegram и их настройками.</p>
              <ul>
                <li>Регистрация новых групп</li>
                <li>Анализ результатов проверок</li>
                <li>Список нарушителей</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="instruction-section">
          <h2>
            <svg className="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H7V10H17V12ZM13 16H7V14H13V16Z" fill="currentColor"/>
            </svg>
            Пошаговая инструкция
          </h2>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Регистрация группы Telegram</h3>
                <p>Перейдите в раздел "Регистрация группы" и добавьте бота в вашу группу:</p>
                <ol>
                  <li>Добавьте бота в группу как администратора</li>
                  <li>Отправьте команду /getid</li>
                  <li>Скопируйте ID и название группы из ответа бота</li>
                  <li>Введите ID и название группы в форму регистрации</li>
                </ol>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Мониторинг и статистика</h3>
                <p>Используйте раздел "Статистика" для отслеживания результатов:</p>
                <ol>
                  <li>Просматривайте графики проверок</li>
                  <li>Анализируйте типы нарушений</li>
                  <li>Отслеживайте активность пользователей</li>
                  <li>Фильтруйте данные по периодам и мастерам</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="instruction-section">
          <h2>
            <svg className="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 18H13V16H11V18ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10H10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 12 11 11.75 11 15H13C13 12.75 16 12.5 16 10C16 7.79 14.21 6 12 6Z" fill="currentColor"/>
            </svg>
            Часто задаваемые вопросы
          </h2>
          
          <div className="faq-container">
            <div className="faq-item">
              <h3>Как изменить материалы главной страницы или страницы с QR кодами?</h3>
              <p>Перейдите в на нужную страницу и нажмите на кнопку "Редактировать сайт" в верхнем меню.</p>
            </div>

            <div className="faq-item">
              <h3>Что делать, если бот не отвечает?</h3>
              <p>Проверьте права бота в группе (должен быть администратором) и попробуйте перезапустить его командой /start.</p>
            </div>

            <div className="faq-item">
              <h3>Почему не приходят уведомления о подозрительных сообщениях?</h3>
              <p>Проверьте спам сообщения на вашей электронной почте, указанной при регистрации.</p>
            </div>

            <div className="faq-item">
              <h3>Как посмотреть статистику за определённый период?</h3>
              <p>В разделе "Статистика" используйте фильтры периода и выберите нужный временной интервал.</p>
            </div>
          </div>
        </section>

        <div className="support-section">
          <h2>
            <svg className="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
            </svg>
            Поддержка
          </h2>
          <p>Если у вас возникли вопросы или проблемы, обратитесь к администратору или в службу поддержки:</p>
          <ul>
            <li>Email: support@example.com</li>
            <li>Телефон: +7 (999) 999-99-99</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Instructions;
