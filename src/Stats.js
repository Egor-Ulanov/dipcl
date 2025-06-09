import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './styleStats.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Stats({ user }) {
  const [chartData, setChartData] = useState(null);
  const [history, setHistory] = useState([]);
  const [source, setSource] = useState('telegram');
  const [reviewChartData, setReviewChartData] = useState(null);
  const [error, setError] = useState(null);
  const [periodType, setPeriodType] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showCustomPeriod, setShowCustomPeriod] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState('all');
  const [masters, setMasters] = useState(['all']);

  const filterDataByPeriod = (data, dates) => {
    const now = new Date();
    let startDate;
    
    switch (periodType) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'custom':
        startDate = customStartDate;
        now.setTime(customEndDate.getTime());
        break;
      default:
        return { dates, data };
    }

    const filteredDates = {};
    const filteredData = data.filter(item => {
      const itemDate = item.date;
      if (itemDate >= startDate && itemDate <= now) {
        const dateStr = itemDate.toISOString().split('T')[0];
        if (!filteredDates[dateStr]) {
          filteredDates[dateStr] = { safe: 0, toxic: 0 };
        }
        if (item.is_safe) {
          filteredDates[dateStr].safe++;
        } else {
          filteredDates[dateStr].toxic++;
        }
        return true;
      }
      return false;
    });

    return { dates: filteredDates, data: filteredData };
  };

  const filterDataByMaster = (data, dates) => {
    if (selectedMaster === 'all') {
      return { dates, data };
    }

    const filteredDates = {};
    const filteredData = data.filter(item => {
      if (selectedMaster === 'no-master' && !item.master) {
        const dateStr = item.date.toISOString().split('T')[0];
        if (!filteredDates[dateStr]) {
          filteredDates[dateStr] = { safe: 0, toxic: 0 };
        }
        const is_safe = item.result && item.result.is_safe;
        if (is_safe) {
          filteredDates[dateStr].safe++;
        } else {
          filteredDates[dateStr].toxic++;
        }
        return true;
      }
      if (item.master === selectedMaster) {
        const dateStr = item.date.toISOString().split('T')[0];
        if (!filteredDates[dateStr]) {
          filteredDates[dateStr] = { safe: 0, toxic: 0 };
        }
        const is_safe = item.result && item.result.is_safe;
        if (is_safe) {
          filteredDates[dateStr].safe++;
        } else {
          filteredDates[dateStr].toxic++;
        }
        return true;
      }
      return false;
    });

    return { dates: filteredDates, data: filteredData };
  };

  useEffect(() => {
    const fetchTelegramChecks = async () => {
      if (!user?.email) {
        setError('Пользователь не авторизован');
        return;
      }

      try {
        const groupsRef = collection(db, 'groups');
        const groupDocs = await getDocs(query(groupsRef, where('info.admin_email', '==', user.email)));
        const reviewDates = {};
        const dates = {};
        const data = [];
        const uniqueMasters = new Set(['all', 'no-master']);

        for (const groupDoc of groupDocs.docs) {
          const groupId = groupDoc.id;
          const checksRef = collection(db, 'groups', groupId, 'checks');
          const checksSnapshot = await getDocs(checksRef);

          checksSnapshot.forEach((doc) => {
            const check = doc.data();
            if (!check.date) return;
            
            if (check.master) {
              uniqueMasters.add(check.master);
            }

            const checkDate = check.date.toDate();
            const date = checkDate.toISOString().split('T')[0];

            if (!dates[date]) {
              dates[date] = { safe: 0, toxic: 0 };
            }

            const is_safe = check.result && check.result.is_safe;
            if (is_safe) {
              dates[date].safe++;
            } else {
              dates[date].toxic++;
            }

            if (check.review) {
              if (!reviewDates[date]) {
                reviewDates[date] = { positive: 0, negative: 0 };
              }
              if (check.sentiment === true) {
                reviewDates[date].positive++;
              } else if (check.sentiment === false) {
                reviewDates[date].negative++;
              }
            }

            data.push({
              id: doc.id,
              date: checkDate,
              text: check.text || 'Сообщение',
              author: check.author || 'Неизвестен',
              master: check.master,
              is_safe: is_safe,
              violations: check.result?.violations || [],
            });
          });
        }

        setMasters(Array.from(uniqueMasters));

        let filtered = filterDataByPeriod(data, dates);
        filtered = filterDataByMaster(filtered.data, filtered.dates);
        setHistory(filtered.data);

        const labels = Object.keys(filtered.dates).sort();
        const safeValues = labels.map((date) => filtered.dates[date].safe);
        const toxicValues = labels.map((date) => filtered.dates[date].toxic);

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

        if (Object.keys(reviewDates).length > 0) {
          const reviewLabels = Object.keys(reviewDates).sort();
          const positiveValues = reviewLabels.map((date) => reviewDates[date].positive);
          const negativeValues = reviewLabels.map((date) => reviewDates[date].negative);

          setReviewChartData({
            labels: reviewLabels,
            datasets: [
              {
                label: 'Положительные отзывы',
                data: positiveValues,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              },
              {
                label: 'Отрицательные отзывы',
                data: negativeValues,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
              },
            ],
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Ошибка при загрузке данных');
      }
    };

    const fetchPersonalChecks = async () => {
      if (!user?.email) {
        setError('Пользователь не авторизован');
        return;
      }

      try {
        const dates = {};
        const data = [];

        const checksRef = collection(db, 'checks');
        const checksSnapshot = await getDocs(query(checksRef, where('email', '==', user.email)));

        checksSnapshot.forEach((doc) => {
          const check = doc.data();
          if (!check.date) return;
          const checkDate = check.date.toDate();
          const date = checkDate.toISOString().split('T')[0];

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
            date: checkDate,
            text: check.text || 'Сообщение',
            author: check.author || 'Неизвестен',
            is_safe: check.result.is_safe,
            violations: check.result.violations,
          });
        });

        const filtered = filterDataByPeriod(data, dates);
        setHistory(filtered.data);

        const labels = Object.keys(filtered.dates).sort();
        const safeValues = labels.map((date) => filtered.dates[date].safe);
        const toxicValues = labels.map((date) => filtered.dates[date].toxic);

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
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Ошибка при загрузке данных');
      }
    };

    setError(null);
    if (source === 'telegram') {
      fetchTelegramChecks();
    } else {
      fetchPersonalChecks();
    }
  }, [source, user?.email, periodType, customStartDate, customEndDate, selectedMaster]);

  const handlePeriodChange = (e) => {
    const value = e.target.value;
    setPeriodType(value);
    setShowCustomPeriod(value === 'custom');
  };

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!chartData) {
    return <p className="loading-text">Загрузка данных...</p>;
  }

  return (
    <div className="stats-container">
      <h2 className="chart-title">Статистика проверок</h2>
      <div className="controls">
        <select className="stats-select" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="telegram">Telegram-группы</option>
          <option value="personal">Личные проверки</option>
        </select>
        <select className="period-select" value={periodType} onChange={handlePeriodChange}>
          <option value="all">Весь период</option>
          <option value="day">Последний день</option>
          <option value="week">Последняя неделя</option>
          <option value="month">Последний месяц</option>
          <option value="custom">Выбрать период</option>
        </select>
        <select 
          className="master-select" 
          value={selectedMaster} 
          onChange={(e) => setSelectedMaster(e.target.value)}
        >
          <option value="all">Все мастера</option>
          <option value="no-master">Без мастера</option>
          {masters
            .filter(master => master !== 'all' && master !== 'no-master')
            .map(master => (
              <option key={master} value={master}>{master}</option>
            ))
          }
        </select>
      </div>
      
      {showCustomPeriod && (
        <div className="custom-period">
          <div className="date-picker">
            <label>От:</label>
            <input
              type="date"
              value={customStartDate.toISOString().split('T')[0]}
              onChange={(e) => setCustomStartDate(new Date(e.target.value))}
            />
          </div>
          <div className="date-picker">
            <label>До:</label>
            <input
              type="date"
              value={customEndDate.toISOString().split('T')[0]}
              onChange={(e) => setCustomEndDate(new Date(e.target.value))}
            />
          </div>
        </div>
      )}

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

      <div className="checks-history">
        <h3>Список проверок за выбранный период</h3>
        {history.length === 0 ? (
          <p>Нет проверок за выбранный период.</p>
        ) : (
          <ul>
            {history.map((check) => (
              <li key={check.id} className={`check-item ${check.is_safe ? 'safe' : 'toxic'}`}>
                <div className="check-header">
                  <span className="check-date">{check.date.toLocaleDateString()}</span>
                  {check.master && <span className="check-master">Мастер: {check.master}</span>}
                </div>
                <p className="check-text"><strong>Текст:</strong> {check.text}</p>
                <p className="check-author"><strong>Автор:</strong> {check.author}</p>
                <p className="check-status">
                  <strong>Результат:</strong>{' '}
                  {check.is_safe ? 'Запрещенного контента не обнаружено' : 'Обнаружены нарушения'}
                </p>
                {check.violations && check.violations.length > 0 && (
                  <p className="check-violations">
                    <strong>Нарушения:</strong> {check.violations.join(', ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Stats;
