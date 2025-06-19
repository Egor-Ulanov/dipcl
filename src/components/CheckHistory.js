import React from 'react';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('ru-RU');
};

export default function CheckHistory({ history }) {
  return (
    <div className="history-section">
      <h3>История проверок</h3>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Пользователь</th>
            <th>Текст</th>
            <th>Результат</th>
          </tr>
        </thead>
        <tbody>
          {history && history.length > 0 ? (
            history.map((item, i) => (
              <tr key={i}>
                <td>{formatDate(item.date)}</td>
                <td>{item.user}</td>
                <td>{item.text}</td>
                <td>{item.result}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Нет данных</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 