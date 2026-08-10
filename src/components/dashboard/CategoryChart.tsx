import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import type { Component } from '../../types';

interface CategoryChartProps {
  components: Component[];
}

const CATEGORY_COLORS: Record<string, string> = {
  microcontroller: '#059669', // Emerald
  sensor:          '#2563eb', // Royal Blue
  actuator:        '#d97706', // Warm Amber
  power:           '#dc2626', // Ruby Red
  passive:         '#7c3aed', // Royal Violet
  connector:       '#0891b2', // Cyan Teal
  tools:           '#4f46e5', // Indigo
  other:           '#6b7280', // Slate Gray
};

const FALLBACK_COLORS = [
  '#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#4f46e5', '#ea580c', '#0284c7', '#16a34a'
];

function getCategoryColor(categoryName: string, index: number): string {
  const key = categoryName.toLowerCase();
  return CATEGORY_COLORS[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function CategoryChart({ components }: CategoryChartProps) {
  const map: Record<string, { count: number; units: number }> = {};
  for (const c of components) {
    if (!map[c.category]) map[c.category] = { count: 0, units: 0 };
    map[c.category].count += 1;
    map[c.category].units += c.quantity;
  }

  const data = Object.entries(map)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, { count, units }]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      rawName: name,
      count,
      units,
    }));

  if (data.length === 0) {
    return (
      <div className="chart-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No components recorded yet</span>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-title">Component Models by Category</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 10 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-md)',
              color: 'var(--text-main)',
              fontSize: 12,
              fontWeight: 600,
            }}
            formatter={(val: any) => [val, 'Component Models']}
            cursor={{ fill: 'rgba(5, 150, 105, 0.05)' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getCategoryColor(entry.rawName, i)} />
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
  const data = Object.entries(map).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    rawName: name,
    value,
  }));

  if (data.length === 0) return null;

  return (
    <div className="chart-card">
      <div className="chart-title">Total Units Distribution</div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={getCategoryColor(entry.rawName, i)} stroke="#ffffff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-md)',
              color: 'var(--text-main)',
              fontSize: 12,
              fontWeight: 600,
            }}
            formatter={(val: any) => [`${val} units`, 'Quantity On Hand']}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 10, color: 'var(--text-main)' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
