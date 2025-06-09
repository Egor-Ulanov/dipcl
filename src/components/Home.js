import React from 'react';
import './Home.css';
import logo from '../assets/logo.png';

// Примеры изображений работ (замените на реальные)
const workExamples = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    title: 'Разработка ПО',
    description: 'Создание современных веб-приложений'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb',
    title: 'Мобильные приложения',
    description: 'Разработка для iOS и Android'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692',
    title: 'Консультации',
    description: 'Техническая поддержка проектов'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    title: 'Аналитика',
    description: 'Анализ данных и отчетность'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3',
    title: 'Безопасность',
    description: 'Защита данных и аудит'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692',
    title: 'Оптимизация',
    description: 'Улучшение производительности'
  }
];

function Home() {
  return (
    <div className="page-container">
      <div className="home-container">
        <section className="company-section">
          <div className="logo-container">
            <img src={logo} alt="Text Checker Logo" />
          </div>
          <h1 className="company-title">О нашей компании</h1>
          <p className="company-description">
            Наша компания специализируется на быстром и качественном ремонте техники — от смартфонов и ноутбуков до бытовых приборов. Мы не просто устраняем поломки, а возвращаем комфорт и надежность в вашу повседневную жизнь. Опытные мастера, оригинальные запчасти и честные цены — вот за что нас выбирают сотни клиентов.
          </p>
        </section>

        <section className="work-section">
          <h2 className="work-title">Наша работа</h2>
          <div className="work-grid">
            {workExamples.map(item => (
              <div key={item.id} className="work-item">
                <img src={item.image} alt={item.title} />
                <div className="work-item-overlay">
                  <h3 className="work-item-title">{item.title}</h3>
                  <p className="work-item-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home; 