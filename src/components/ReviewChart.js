import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU');
};

export default function ReviewChart({ data }) {
  return (
    <div className="chart-section">
      <h3>Отзывы</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatDate} />
          <Legend />
          <Bar dataKey="positive" name="Положительные" fill="#81c784" />
          <Bar dataKey="neutral" name="Нейтральные" fill="#ffd54f" />
          <Bar dataKey="negative" name="Отрицательные" fill="#e57373" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 