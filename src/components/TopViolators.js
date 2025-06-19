import React from 'react';

export default function TopViolators({ violators }) {
  return (
    <div className="top-violators-section">
      <h3>Топ нарушителей</h3>
      <ol>
        {violators && violators.length > 0 ? (
          violators.map((v, i) => (
            <li key={v.name || i}>
              {v.name}: {v.count}
            </li>
          ))
        ) : (
          <li>Нет данных</li>
        )}
      </ol>
    </div>
  );
} 