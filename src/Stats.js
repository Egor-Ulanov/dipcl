import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './styleStats.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  const [violators, setViolators] = useState([]);
  const [chartType, setChartType] = useState('bar');

  const filterDataByPeriod = (data, dates) => {
    if (periodType === 'all') {
      return { dates, data };
    }

    const now = new Date();
    let startDate;
    
    switch (periodType) {
      case 'day':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'custom':
        startDate = new Date(customStartDate);
        now.setTime(customEndDate.getTime());
        break;
      default:
        return { dates, data };
    }

    // Устанавливаем время для корректного сравнения
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    console.log('Фильтрация по периоду:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const filteredDates = {};
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      
      console.log('Проверка записи:', {
        itemDate: itemDate.toISOString(),
        isInRange: itemDate >= startDate && itemDate <= endDate
      });

      if (itemDate >= startDate && itemDate <= endDate) {
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

  const calculateViolators = (data) => {
    const violatorsMap = new Map();

    data.forEach(check => {
      const authorId = check.author;
      if (!violatorsMap.has(authorId)) {
        violatorsMap.set(authorId, {
          author: authorId,
          totalMessages: 0,
          toxicMessages: 0,
          spamMessages: 0,
          violationRate: 0
        });
      }

      const stats = violatorsMap.get(authorId);
      stats.totalMessages++;

      if (!check.is_safe) {
        stats.toxicMessages++;
      }
      if (check.spam) {
        stats.spamMessages++;
      }

      stats.violationRate = ((stats.toxicMessages + stats.spamMessages) / stats.totalMessages) * 100;
    });

    return Array.from(violatorsMap.values())
      .sort((a, b) => b.violationRate - a.violationRate)
      .slice(0, 10); // Топ 10 нарушителей
  };

  const prepareChartData = (labels, safeCount, unsafeCount) => {
    return {
      labels,
      datasets: [
        {
          label: 'Безопасные',
          data: safeCount,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Токсичные',
          data: unsafeCount,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareReviewChartData = (labels, reviews) => {
    if (chartType === 'pie' || chartType === 'doughnut') {
      const totalReviews = reviews.reduce((acc, curr) => acc + curr, 0);
      return {
        labels: ['Положительные', 'Нейтральные', 'Негативные'],
        datasets: [{
          data: [
            reviews.filter(r => r > 0).length,
            reviews.filter(r => r === 0).length,
            reviews.filter(r => r < 0).length,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(255, 99, 132, 0.5)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        }],
      };
    }

    return {
      labels,
      datasets: [
        {
          label: 'Положительные',
          data: reviews.map(r => r > 0 ? 1 : 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Нейтральные',
          data: reviews.map(r => r === 0 ? 1 : 0),
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
        },
        {
          label: 'Негативные',
          data: reviews.map(r => r < 0 ? 1 : 0),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
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

        // Вычисляем статистику нарушителей
        const violatorsStats = calculateViolators(filtered.data);
        setViolators(violatorsStats);

        const labels = Object.keys(filtered.dates).sort();
        const safeCount = labels.map(date => 
          filtered.dates[date].filter(check => check.is_safe).length
        );
        const unsafeCount = labels.map(date => 
          filtered.dates[date].filter(check => !check.is_safe).length
        );

        const reviews = labels.map(date => 
          filtered.dates[date].map(check => check.sentiment)
        ).flat();

        setChartData(prepareChartData(labels, safeCount, unsafeCount));
        setReviewChartData(prepareReviewChartData(labels, reviews));
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

  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
  }[chartType];

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
        <div className="chart-type-selector">
          <label>Тип графика:</label>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            className="chart-type-select"
          >
            <option value="bar">Столбчатая диаграмма</option>
            <option value="line">Линейный график</option>
            <option value="pie">Круговая диаграмма</option>
            <option value="doughnut">Кольцевая диаграмма</option>
          </select>
        </div>
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

      <div className="stats-content">
        <div className="charts-container">
          <div className="chart-section">
            <h3>Токсичность сообщений</h3>
            {chartData && <ChartComponent
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
                  y: {
                    beginAtZero: true,
                  },
                } : undefined,
              }}
            />}
          </div>

          <div className="chart-section">
            <h3>Отзывы</h3>
            {reviewChartData && <ChartComponent
              data={reviewChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
                  y: {
                    beginAtZero: true,
                  },
                } : undefined,
              }}
            />}
          </div>
        </div>

        <div className="violators-section">
          <h3>Топ нарушителей</h3>
          {violators.length > 0 ? (
            <div className="violators-list">
              {violators.map((violator, index) => (
                <div key={violator.author} className="violator-item">
                  <div className="violator-header">
                    <span className="violator-rank">#{index + 1}</span>
                    <span className="violator-name">{violator.author.split('__')[0]}</span>
                  </div>
                  <div className="violator-stats">
                    <div className="stat-item">
                      <span className="stat-label">Всего сообщений:</span>
                      <span className="stat-value">{violator.totalMessages}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Токсичных:</span>
                      <span className="stat-value">{violator.toxicMessages}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Спам:</span>
                      <span className="stat-value">{violator.spamMessages}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Процент нарушений:</span>
                      <span className="stat-value">{violator.violationRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Нет данных о нарушениях</p>
          )}
        </div>
      </div>

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
