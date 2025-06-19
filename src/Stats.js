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
import { BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import ToxicityChart from './components/ToxicityChart';
import ReviewChart from './components/ReviewChart';
import TopViolators from './components/TopViolators';
import CheckHistory from './components/CheckHistory';

// Регистрация необходимых компонентов для графиков
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

// Компонент статистики для визуализации данных о проверках текста
function Stats({ user }) {
  // Состояния для хранения данных и настроек отображения
  const [chartData, setChartData] = useState(null);          // Данные для графика токсичности
  const [history, setHistory] = useState([]);                // История проверок
  const [source, setSource] = useState('telegram');          // Источник данных (telegram/personal)
  const [reviewChartData, setReviewChartData] = useState(null);  // Данные для графика отзывов
  const [error, setError] = useState(null);                  // Состояние ошибки
  const [periodType, setPeriodType] = useState('all');       // Тип периода для фильтрации
  const [customStartDate, setCustomStartDate] = useState(new Date());  // Начальная дата периода
  const [customEndDate, setCustomEndDate] = useState(new Date());      // Конечная дата периода
  const [showCustomPeriod, setShowCustomPeriod] = useState(false);    // Показ выбора периода
  const [selectedMaster, setSelectedMaster] = useState('all');        // Выбранный мастер
  const [masters, setMasters] = useState(['all']);                    // Список мастеров
  const [violators, setViolators] = useState([]);                     // Список нарушителей
  const [chartType, setChartType] = useState('bar');                  // Тип графика
  const [selectedGroupId, setSelectedGroupId] = useState('all'); // выбранная группа
  const [groupList, setGroupList] = useState([]); // список групп

  // Фильтрация данных по выбранному временному периоду
  const filterDataByPeriod = (data, dates) => {
    if (periodType === 'all') {
      return { dates, data };
    }

    const now = new Date();
    let startDate;
    let endDate;

    if (periodType === 'day') {
      startDate = new Date(now);
      endDate = new Date(now);
    } else if (periodType === 'week') {
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (dayOfWeek - 1));
      endDate = new Date(now);
      endDate.setDate(startDate.getDate() + 6);
    } else if (periodType === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (periodType === 'custom') {
      startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEndDate);
      endDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(-8640000000000000);
      endDate = new Date(8640000000000000);
    }

    console.log('Фильтрация по периоду:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const filteredDates = {};
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      console.log('Проверка записи:', {
        itemDate: itemDate.toISOString(),
        isInRange: itemDate >= startDate && itemDate <= endDate
      });

      if (itemDate >= startDate && itemDate <= endDate) {
        const dateStr = itemDate.toISOString().split('T')[0];
        if (!filteredDates[dateStr]) {
          filteredDates[dateStr] = { safe: 0, toxic: 0 };
        }
        const is_toxic = item.sentences
          ? item.sentences.some(sent => sent.violations && sent.violations.includes("Токсичность"))
          : item.violations && item.violations.includes("Токсичность");
        if (is_toxic) {
          filteredDates[dateStr].toxic++;
        } else {
          filteredDates[dateStr].safe++;
        }
        return true;
      }
      return false;
    });

    return { dates: filteredDates, data: filteredData };
  };

  // Фильтрация данных по выбранному мастеру
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
        const is_toxic = item.violations && item.violations.includes("Токсичность");
        if (is_toxic) {
          filteredDates[dateStr].toxic++;
        } else {
          filteredDates[dateStr].safe++;
        }
        return true;
      }
      if (item.master === selectedMaster) {
        const dateStr = item.date.toISOString().split('T')[0];
        if (!filteredDates[dateStr]) {
          filteredDates[dateStr] = { safe: 0, toxic: 0 };
        }
        const is_toxic = item.violations && item.violations.includes("Токсичность");
        if (is_toxic) {
          filteredDates[dateStr].toxic++;
        } else {
          filteredDates[dateStr].safe++;
        }
        return true;
      }
      return false;
    });

    return { dates: filteredDates, data: filteredData };
  };

  // Расчет статистики нарушителей и формирование топ-10
  const calculateViolators = (data) => {
    const violatorsMap = new Map();

    data.forEach(check => {
      const authorId = check.author || 'unknown';
      if (!violatorsMap.has(authorId)) {
        violatorsMap.set(authorId, {
          author: authorId,
          totalMessages: 0,
          toxicMessages: 0,
          spamMessages: 0,
          violationChecks: 0, // Количество проверок с хотя бы одним нарушением
          violationRate: 0
        });
      }

      const stats = violatorsMap.get(authorId);
      stats.totalMessages++;

      let hasToxic = false;
      let hasSpam = false;
      let hasAnyViolation = false;
      // Новый формат: если есть sentences, считаем по предложениям
      if (Array.isArray(check.sentences)) {
        check.sentences.forEach(sent => {
          if (sent.violations && sent.violations.includes("Токсичность")) hasToxic = true;
          if (sent.violations && sent.violations.includes("Спам")) hasSpam = true;
        });
        hasAnyViolation = hasToxic || hasSpam;
        if (hasToxic) stats.toxicMessages++;
        if (hasSpam) stats.spamMessages++;
      } else {
        // Старый формат
        const violations = check.violations || [];
        if (violations.includes("Токсичность")) hasToxic = true;
        if (violations.includes("Спам")) hasSpam = true;
        hasAnyViolation = hasToxic || hasSpam;
        if (hasToxic) stats.toxicMessages++;
        if (hasSpam) stats.spamMessages++;
      }
      if (hasAnyViolation) stats.violationChecks++;
      stats.violationRate = (stats.violationChecks / stats.totalMessages) * 100;
    });

    return Array.from(violatorsMap.values())
      .sort((a, b) => b.violationRate - a.violationRate)
      .slice(0, 10);
  };

  // Подготовка данных для графика токсичности сообщений
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

  // Подготовка данных для графика отзывов с учетом типа диаграммы
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

  // Эффект для загрузки и обновления данных при изменении фильтров
  useEffect(() => {
    // Загрузка данных из Telegram-групп
    const fetchTelegramChecks = async () => {
      if (!user?.email) {
        setError('Пользователь не авторизован');
        return;
      }

      try {
        const groupsRef = collection(db, 'groups');
        const groupDocs = await getDocs(query(groupsRef, where('info.admin_email', '==', user.email)));

        const groupArr = [];
        const dates = {};
        const uniqueMasters = new Set(['all', 'no-master']);
        const allChecks = [];

        for (const groupDoc of groupDocs.docs) {
          const groupId = groupDoc.id;
          const groupTitle = groupDoc.data().info?.title || groupId;
          groupArr.push({ id: groupId, title: groupTitle });
          // Если выбрана конкретная группа, пропускаем остальные
          if (selectedGroupId !== 'all' && groupId !== selectedGroupId) continue;
          const checksRef = collection(db, 'groups', groupId, 'checks');
          const checksSnapshot = await getDocs(checksRef);

          checksSnapshot.forEach((doc) => {
            const check = doc.data();
            if (!check.date) return;

            if (check.master) {
              uniqueMasters.add(check.master);
            }

            const checkDate = check.date.toDate();
            const dateStr = checkDate.toLocaleDateString();

            if (!dates[dateStr]) {
              dates[dateStr] = {
                safe: 0,
                toxic: 0,
                positive: 0,
                negative: 0,
                checks: []
              };
            }

            // Новый формат: sentences — одна проверка = один блок
            if (Array.isArray(check.sentences)) {
              const hasToxic = check.sentences.some(sent => sent.violations && sent.violations.includes("Токсичность"));
              const is_safe = !hasToxic;
              if (hasToxic) {
                dates[dateStr].toxic++;
              } else {
                dates[dateStr].safe++;
              }
              const is_review = check.sentences.some(sent => sent.is_review === true);
              const checkData = {
                id: doc.id,
                date: checkDate,
                text: check.text || check.sentences.map(s => s.text).join(' '),
                author: check.author || 'Неизвестен',
                master: check.master,
                is_safe: is_safe,
                sentences: check.sentences,
                is_review: is_review,
                groupId: groupId,
                groupTitle: groupTitle,
              };
              dates[dateStr].checks.push(checkData);
              allChecks.push(checkData);
            } else {
              // Старый формат
              const violations = (check.result && check.result.violations) ? check.result.violations : (check.violations || []);
              const is_safe = !(violations && violations.length > 0);
              const is_review = check.is_review === true || check.review === true;
              const checkData = {
                id: doc.id,
                date: checkDate,
                text: check.text || 'Сообщение',
                author: check.author || 'Неизвестен',
                master: check.master,
                is_safe: is_safe,
                violations: violations,
                is_review: is_review,
                groupId: groupId,
                groupTitle: groupTitle,
              };
              const is_toxic = violations.includes("Токсичность");
              if (is_toxic) {
                dates[dateStr].toxic++;
              } else {
                dates[dateStr].safe++;
              }
              dates[dateStr].checks.push(checkData);
              allChecks.push(checkData);
            }
          });
        }

        setGroupList(groupArr);
        setMasters(Array.from(uniqueMasters));

        let filtered = filterDataByPeriod(allChecks, dates);
        filtered = filterDataByMaster(filtered.data, filtered.dates);
        setHistory(filtered.data);

        const violatorsStats = calculateViolators(filtered.data);
        setViolators(violatorsStats);

        const sortedLabels = Object.keys(filtered.dates).sort((a, b) => new Date(a) - new Date(b));
        const safeCount = sortedLabels.map(date => filtered.dates[date].safe || 0);
        const unsafeCount = sortedLabels.map(date => filtered.dates[date].toxic || 0);

        const toxicityData = {
          labels: sortedLabels,
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
        const toxicityOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const date = new Date(tooltipItems[0].label);
                  return date.toLocaleDateString('ru-RU');
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                callback: function(value, index, ticks) {
                  const date = new Date(this.getLabelForValue(value));
                  return date.toLocaleDateString('ru-RU');
                }
              }
            },
            y: { beginAtZero: true }
          }
        };

        setChartData(toxicityData);

        // График отзывов только по is_review/review === true
        const reviewChecks = filtered.data.filter(item => item.is_review === true);
        const reviewByDate = {};
        reviewChecks.forEach(item => {
          const d = item.date.toISOString().split('T')[0];
          if (item.sentences) {
            const pos = item.sentences.filter(s => s.sentiment === "positive").length;
            const neg = item.sentences.filter(s => s.sentiment === "negative").length;
            if (!reviewByDate[d]) {
              reviewByDate[d] = { positive: 0, negative: 0 };
            }
            if (pos > neg) reviewByDate[d].positive++;
            else if (neg > pos) reviewByDate[d].negative++;
          } else {
            if (!reviewByDate[d]) {
              reviewByDate[d] = { positive: 0, negative: 0 };
            }
            if (item.sentiment === "positive") reviewByDate[d].positive++;
            else if (item.sentiment === "negative") reviewByDate[d].negative++;
          }
        });
        const sortedReviewLabels = Object.keys(reviewByDate).sort((a, b) => new Date(a) - new Date(b));
        const reviewPositiveArr = sortedReviewLabels.map(d => (reviewByDate[d]?.positive || 0));
        const reviewNegativeArr = sortedReviewLabels.map(d => (reviewByDate[d]?.negative || 0));
        const reviewPositiveCount = reviewPositiveArr.reduce((a, b) => a + b, 0);
        const reviewNegativeCount = reviewNegativeArr.reduce((a, b) => a + b, 0);
        const reviewData = {
          labels: sortedReviewLabels,
          datasets: [
            {
              label: 'Положительные',
              data: reviewPositiveArr,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Отрицательные',
              data: reviewNegativeArr,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        };
        const reviewOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const date = new Date(tooltipItems[0].label);
                  return date.toLocaleDateString('ru-RU');
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                callback: function(value, index, ticks) {
                  const date = new Date(this.getLabelForValue(value));
                  return date.toLocaleDateString('ru-RU');
                }
              }
            },
            y: { beginAtZero: true }
          }
        };

        setReviewChartData(reviewData);

      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Ошибка при загрузке данных');
      }
    };

    // Загрузка данных из личных проверок пользователя
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
          const dateStr = checkDate.toLocaleDateString();

          if (!dates[dateStr]) {
            dates[dateStr] = {
              safe: 0,
              toxic: 0,
              positive: 0,
              negative: 0,
              checks: []
            };
          }

          // Новый формат: sentences — одна проверка = один блок
          if (Array.isArray(check.sentences)) {
            const hasToxic = check.sentences.some(sent => sent.violations && sent.violations.includes("Токсичность"));
            const is_safe = !hasToxic;
            if (hasToxic) {
              dates[dateStr].toxic++;
            } else {
              dates[dateStr].safe++;
            }
            const is_review = check.sentences.some(sent => sent.is_review === true);
            const checkData = {
              id: doc.id,
              date: checkDate,
              text: check.text || check.sentences.map(s => s.text).join(' '),
              author: check.author || 'Неизвестен',
              is_safe: is_safe,
              sentences: check.sentences,
              is_review: is_review,
            };
            dates[dateStr].checks.push(checkData);
            data.push(checkData);
          } else {
            // Старый формат
            const violations = (check.result && check.result.violations) ? check.result.violations : (check.violations || []);
            const is_safe = !(violations && violations.length > 0);
            const is_review = check.is_review === true || check.review === true;
            const checkData = {
              id: doc.id,
              date: checkDate,
              text: check.text || 'Сообщение',
              author: check.author || 'Неизвестен',
              is_safe: is_safe,
              violations: violations,
              is_review: is_review,
            };
            const is_toxic = violations.includes("Токсичность");
            if (is_toxic) {
              dates[dateStr].toxic++;
            } else {
              dates[dateStr].safe++;
            }
            dates[dateStr].checks.push(checkData);
            data.push(checkData);
          }
        });

        const filtered = filterDataByPeriod(data, dates);
        setHistory(filtered.data);

        const sortedLabels = Object.keys(filtered.dates).sort((a, b) => new Date(a) - new Date(b));
        const safeCount = sortedLabels.map(date => filtered.dates[date].safe || 0);
        const unsafeCount = sortedLabels.map(date => filtered.dates[date].toxic || 0);

        const toxicityData = {
          labels: sortedLabels,
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
        const toxicityOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const date = new Date(tooltipItems[0].label);
                  return date.toLocaleDateString('ru-RU');
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                callback: function(value, index, ticks) {
                  const date = new Date(this.getLabelForValue(value));
                  return date.toLocaleDateString('ru-RU');
                }
              }
            },
            y: { beginAtZero: true }
          }
        };

        setChartData(toxicityData);

        // График отзывов только по is_review === true, группировка по дате
        const reviewChecks = filtered.data.filter(item => item.is_review === true);
        const reviewByDate = {};
        reviewChecks.forEach(item => {
          const d = item.date.toISOString().split('T')[0];
          // Для новых: если есть предложения, считаем положительный/отрицательный по большинству
          if (item.sentences) {
            const pos = item.sentences.filter(s => s.sentiment === "positive").length;
            const neg = item.sentences.filter(s => s.sentiment === "negative").length;
            if (!reviewByDate[d]) {
              reviewByDate[d] = { positive: 0, negative: 0 };
            }
            if (pos > neg) reviewByDate[d].positive++;
            else if (neg > pos) reviewByDate[d].negative++;
          } else {
            if (!reviewByDate[d]) {
              reviewByDate[d] = { positive: 0, negative: 0 };
            }
            if (item.sentiment === "positive") reviewByDate[d].positive++;
            else if (item.sentiment === "negative") reviewByDate[d].negative++;
          }
        });
        const sortedReviewLabels = Object.keys(reviewByDate).sort((a, b) => new Date(a) - new Date(b));
        const reviewPositiveArr = sortedReviewLabels.map(d => (reviewByDate[d]?.positive || 0));
        const reviewNegativeArr = sortedReviewLabels.map(d => (reviewByDate[d]?.negative || 0));
        const reviewPositiveCount = reviewPositiveArr.reduce((a, b) => a + b, 0);
        const reviewNegativeCount = reviewNegativeArr.reduce((a, b) => a + b, 0);
        const reviewData = {
          labels: sortedReviewLabels,
          datasets: [
            {
              label: 'Положительные',
              data: reviewPositiveArr,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Отрицательные',
              data: reviewNegativeArr,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        };
        const reviewOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const date = new Date(tooltipItems[0].label);
                  return date.toLocaleDateString('ru-RU');
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                callback: function(value, index, ticks) {
                  const date = new Date(this.getLabelForValue(value));
                  return date.toLocaleDateString('ru-RU');
                }
              }
            },
            y: { beginAtZero: true }
          }
        };

        setReviewChartData(reviewData);
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
  }, [source, user?.email, periodType, customStartDate, customEndDate, selectedMaster, chartType, selectedGroupId]);

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

  const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Подготовка данных для новых компонентов
  const toxicityChartData = (chartData?.labels || []).map((date, i) => ({
    date: date, // ISO-строка
    safe: chartData?.datasets?.[0]?.data?.[i] || 0,
    toxic: chartData?.datasets?.[1]?.data?.[i] || 0,
  })).filter(d => d.date && d.date.length === 10 && d.date.includes('-'));

  const reviewChartDataArr = (reviewChartData?.labels || []).map((date, i) => ({
    date: date, // ISO-строка
    positive: reviewChartData?.datasets?.[0]?.data?.[i] || 0,
    neutral: reviewChartData?.datasets?.[1]?.data?.[i] || 0,
    negative: reviewChartData?.datasets?.[2]?.data?.[i] || 0,
  })).filter(d => d.date && d.date.length === 10 && d.date.includes('-'));

  const topViolators = (violators || []).map(v => ({
    name: v.author,
    count: v.violationChecks || v.violationRate || 0
  }));

  const checkHistoryData = (history || []).sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => ({
    date: item.date instanceof Date ? item.date.toISOString() : item.date,
    user: item.author || item.user || '',
    text: item.text || '',
    result: item.is_safe !== undefined ? (item.is_safe ? 'Без нарушений' : 'Есть нарушения') : (item.result || '')
  }));

  return (
    <div className="stats-page">
      <ToxicityChart data={toxicityChartData} />
      <ReviewChart data={reviewChartDataArr} />
      <TopViolators violators={topViolators} />
      <CheckHistory history={checkHistoryData} />
    </div>
  );
}

export default Stats;