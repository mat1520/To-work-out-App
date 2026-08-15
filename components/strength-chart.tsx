"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface StrengthPoint {
  fecha: string;
  "0025"?: number;
  "0043"?: number;
  "0032"?: number;
}

const COMPUESTOS = [
  { id: "0025", label: "Press banca", color: "#f87171" },
  { id: "0043", label: "Sentadilla", color: "#60a5fa" },
  { id: "0032", label: "Peso muerto", color: "#fbbf24" },
] as const;

interface StrengthChartProps {
  data: StrengthPoint[];
  names?: Record<string, string>;
}

export default function StrengthChart({ data, names = {} }: StrengthChartProps) {
  const series = COMPUESTOS.map((c) => ({ ...c, name: names[c.id] ?? c.label })).filter(
    ({ id }) => data.filter((p) => p[id] != null).length >= 2,
  );

  if (series.length === 0) {
    return (
      <p className="mt-6 rounded-xl border border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Registra al menos 2 sesiones de un mismo levantamiento para ver su curva de fuerza.
      </p>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid strokeOpacity={0.3} stroke="#3f3f46" strokeDasharray="3 3" />
          <XAxis
            dataKey="fecha"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#3f3f46" }}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            unit="kg"
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 8,
              color: "#e4e4e7",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value, name) => [`${value} kg`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {series.map(({ id, name, color }) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              name={name}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}