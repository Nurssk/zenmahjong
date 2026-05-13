"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const scoreData = [
  { day: "Пн", score: 9200, wins: 4 },
  { day: "Вт", score: 11400, wins: 5 },
  { day: "Ср", score: 9800, wins: 3 },
  { day: "Чт", score: 13800, wins: 6 },
  { day: "Пт", score: 15100, wins: 7 },
  { day: "Сб", score: 17600, wins: 8 },
  { day: "Вс", score: 18420, wins: 9 },
];

const tooltipStyle = {
  background: "#151515",
  border: "1px solid rgba(255, 136, 0, 0.25)",
  borderRadius: "12px",
  color: "#e8e8e8",
};

export function PerformanceChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-2xl border border-primary/15 bg-card/80 p-4 shadow-premium">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Очки за неделю</p>
          <h3 className="mt-1 text-xl font-black">Турнирный темп</h3>
        </div>
        <div className="h-72 min-w-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#ff8800" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#ff8800" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#888888", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#888888", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#ff8800", strokeOpacity: 0.2 }} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#ff8800"
                  strokeWidth={3}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-xl bg-popover/70" />
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-primary/15 bg-card/80 p-4 shadow-premium">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-energy">Победы</p>
          <h3 className="mt-1 text-xl font-black">Ежедневные зачистки</h3>
        </div>
        <div className="h-72 min-w-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#888888", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#888888", fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,136,0,0.08)" }} />
                <Bar dataKey="wins" fill="#aa44ff" radius={[8, 8, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-xl bg-popover/70" />
          )}
        </div>
      </div>
    </div>
  );
}
