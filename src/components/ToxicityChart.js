import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU');
};

export default function ToxicityChart({ data }) {
  return (
    <div className="chart-section">
      <h3>Токсичность сообщений</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatDate} />
          <Legend />
          <Bar dataKey="safe" name="Безопасные" fill="#4dd0e1" />
          <Bar dataKey="toxic" name="Токсичные" fill="#f06292" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 