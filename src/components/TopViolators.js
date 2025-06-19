import React from 'react';

export default function TopViolators({ violators }) {
  return (
    <div className="violators-section">
      <h3>Топ нарушителей</h3>
      {violators && violators.length > 0 ? (
        <div className="violators-list">
          {violators.map((v, i) => (
            <div className="violator-item" key={v.name || i}>
              <div className="violator-header">
                <span className="violator-rank">#{i + 1}</span>
                <span className="violator-name">{v.name}</span>
              </div>
              <div className="violator-stats">
                <div className="stat-item">
                  <span className="stat-label">Нарушений:</span>
                  <span className="stat-value">{v.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Нет данных о нарушениях</p>
      )}
    </div>
  );
} 