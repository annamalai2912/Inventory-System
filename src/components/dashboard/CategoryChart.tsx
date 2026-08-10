import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import type { Component } from '../../types';

interface CategoryChartProps {
  components: Component[];
}

const COLORS = [
  '#10b981', '#34d399', '#6ee7b7', '#059669', '#047857',
  '#f59e0b', '#38bdf8', '#f43f5e', '#a7f3d0', '#fbbf24',
];

export function CategoryChart({ components }: CategoryChartProps) {
  // Build per-category counts
  const map: Record<string, { count: number; units: number }> = {};
  for (const c of components) {
    if (!map[c.category]) map[c.category] = { count: 0, units: 0 };
    map[c.category].count += 1;
    map[c.category].units += c.quantity;
  }

  const data = Object.entries(map)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, { count, units }]) => ({ name, count, units }));

  if (data.length === 0) {
    return (
      <div className="chart-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <span style={{ color: 'var(--ivory-muted)', fontSize: '0.875rem' }}>No data yet</span>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-title">Parts by Category</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--ivory-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--ivory-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              color: 'var(--ivory)',
              fontSize: 12,
            }}
            formatter={(val: any, name: any) => [val, name === 'count' ? 'Part types' : 'Total units']}
            cursor={{ fill: 'rgba(16,185,129,0.06)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ components }: CategoryChartProps) {
  const map: Record<string, number> = {};
  for (const c of components) {
    map[c.category] = (map[c.category] ?? 0) + c.quantity;
  }
  const data = Object.entries(map).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div className="chart-card">
      <div className="chart-title">Stock Units by Category</div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              color: 'var(--ivory)',
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: 'var(--ivory-muted)', fontSize: 11 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
