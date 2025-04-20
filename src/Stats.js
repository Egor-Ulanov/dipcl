import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './styleStats.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Stats({ user }) {
  const [chartData, setChartData] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredChecks, setFilteredChecks] = useState([]);
  const [source, setSource] = useState('telegram'); // или 'personal'

  useEffect(() => {
    const fetchTelegramChecks  = async () => {
      if (!user?.email) return;
  
      const groupsRef = collection(db, 'groups');
      const groupDocs = await getDocs(query(groupsRef, where('info.admin_email', '==', user.email)));
  
      const dates = {};
      const data = [];
  
      for (const groupDoc of groupDocs.docs) {
        const groupId = groupDoc.id;
        const checksRef = collection(db, 'groups', groupId, 'checks');
        const checksSnapshot = await getDocs(checksRef);
  
        checksSnapshot.forEach((doc) => {
          const check = doc.data();
          if (!check.date) return;
          const date = check.date.toDate().toISOString().split('T')[0];
  
          if (!dates[date]) {
            dates[date] = { safe: 0, toxic: 0 };
          }
  
          if (check.result.is_safe) {
            dates[date].safe++;
          } else {
            dates[date].toxic++;
          }
  
          data.push({
            id: doc.id,
            date: check.date.toDate(),
            text: check.text || 'Сообщение',
            author: check.author || 'Неизвестен', // <--- добавить
            is_safe: check.result.is_safe,
            violations: check.result.violations,
          });
        });
      }
  
      setHistory(data);
  
      const labels = Object.keys(dates).sort();
      const safeValues = labels.map((date) => dates[date].safe);
      const toxicValues = labels.map((date) => dates[date].toxic);
  
      setChartData({
        labels,
        datasets: [
          {
            label: 'Обычные проверки',
            data: safeValues,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Токсичные проверки',
            data: toxicValues,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      });
    };

    const fetchPersonalChecks  = async () => {
      if (!user?.email) return;
      const dates = {};
      const data = [];

        const checksRef = collection(db, 'checks');
        const checksSnapshot = await getDocs(query(checksRef, where('email', '==', user.email)));
  
        checksSnapshot.forEach((doc) => {
          const check = doc.data();
          if (!check.date) return;
          const date = check.date.toDate().toISOString().split('T')[0];
  
          if (!dates[date]) {
            dates[date] = { safe: 0, toxic: 0 };
          }
  
          if (check.result.is_safe) {
            dates[date].safe++;
          } else {
            dates[date].toxic++;
          }
  
          data.push({
            id: doc.id,
            date: check.date.toDate(),
            text: check.text || 'Сообщение',
            author: check.author || 'Неизвестен', // <--- добавить
            is_safe: check.result.is_safe,
            violations: check.result.violations,
          });
        });
      
  
      setHistory(data);
  
      const labels = Object.keys(dates).sort();
      const safeValues = labels.map((date) => dates[date].safe);
      const toxicValues = labels.map((date) => dates[date].toxic);
  
      setChartData({
        labels,
        datasets: [
          {
            label: 'Обычные проверки',
            data: safeValues,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Токсичные проверки',
            data: toxicValues,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      });
    };

    if (source === 'telegram') {
      fetchTelegramChecks();
    } else {
      fetchPersonalChecks();
    }
  }, [source, user.email]);
  

  useEffect(() => {
    const filtered = history.filter((check) => {
      return check.date.toDateString() === selectedDate.toDateString();
    });
    setFilteredChecks(filtered);
  }, [selectedDate, history]);

  if (!chartData) {
    return <p className="loading-text">Загрузка данных...</p>;
  }

  return (
    <div className="stats-container">
      <h2 className="chart-title">Статистика проверок</h2>
      <select className="stats-select" value={source} onChange={(e) => setSource(e.target.value)}>
        <option value="telegram">Telegram-группы</option>
        <option value="personal">Личные проверки</option>
      </select>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Количество проверок по датам',
            },
          },
        }}
      />
      <div className="stats-content">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="ru-RU"
        />
        <div className="checks-history">
          <h3>Проверки за {selectedDate.toLocaleDateString()}</h3>
          {filteredChecks.length === 0 ? (
            <p>Нет проверок за выбранный день.</p>
          ) : (
            <ul>
              {filteredChecks.map((check) => (
                <li key={check.id}>
                  <p><strong>Автор:</strong> {check.author || 'Неизвестен'}</p>
                  <p><strong>Текст:</strong> {check.text}</p>
                  <p>
                    <strong>Результат:</strong>{' '}
                    {check.is_safe ? 'Запрещенного контента не обнаружено' : 'Обнаружены нарушения'}
                  </p>
                  {check.violations && check.violations.length > 0 && (
                    <p>
                      <strong>Нарушения:</strong> {check.violations.join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Stats;
