import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getSevenDayXpHistory, XpHistoryPoint } from '../utils/xpHistory';
import { sounds } from '../utils/audio';

interface XpProgressChartProps {
  currentXp: number;
  level: number;
  savedHistory?: XpHistoryPoint[];
}

export const XpProgressChart: React.FC<XpProgressChartProps> = ({
  currentXp,
  level,
  savedHistory,
}) => {
  const [chartMode, setChartMode] = useState<'cumulative' | 'daily'>('cumulative');

  const data: XpHistoryPoint[] = useMemo(() => {
    return getSevenDayXpHistory(currentXp, savedHistory);
  }, [currentXp, savedHistory]);

  const startXp = data[0]?.xp || 0;
  const totalGain = Math.max(0, currentXp - startXp);
  const todayGain = data[data.length - 1]?.xpGained || 0;

  return (
    <div className="jelly-pod rounded-3xl p-4 mb-4 border-2 border-indigo-200/90 shadow-md relative overflow-hidden bg-gradient-to-b from-white/95 to-indigo-50/40">
      {/* Atmosphere Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-gradient-to-bl from-purple-300/20 to-pink-300/10 blur-xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm shadow-xs font-black">
            📈
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-extrabold text-sm text-stone-900">
                7-Day XP Growth
              </h3>
              <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                Recharts
              </span>
            </div>
            <p className="text-[10.5px] text-stone-500 font-semibold">
              Player experience points tracked over the past week
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setChartMode('cumulative');
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-display font-extrabold transition-all cursor-pointer ${
              chartMode === 'cumulative'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Total XP
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setChartMode('daily');
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-display font-extrabold transition-all cursor-pointer ${
              chartMode === 'daily'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Daily Gains
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-2 mb-3 relative z-10">
        <div className="p-2 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-center">
          <span className="text-[9px] font-black uppercase text-indigo-500 block tracking-wider">
            Current XP
          </span>
          <span className="font-display font-black text-sm text-indigo-900">
            {currentXp.toLocaleString()}
          </span>
        </div>

        <div className="p-2 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-center">
          <span className="text-[9px] font-black uppercase text-purple-500 block tracking-wider">
            7-Day Gain
          </span>
          <span className="font-display font-black text-sm text-purple-900">
            +{totalGain.toLocaleString()}
          </span>
        </div>

        <div className="p-2 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center">
          <span className="text-[9px] font-black uppercase text-emerald-600 block tracking-wider">
            Today’s Gain
          </span>
          <span className="font-display font-black text-sm text-emerald-900">
            +{todayGain.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-44 bg-white/80 rounded-2xl border border-stone-200/80 pt-2 pb-1 pr-2 shadow-inner relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'cumulative' ? (
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="xpAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as XpHistoryPoint;
                    return (
                      <div className="bg-stone-900/90 text-white backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-lg border border-purple-400/40 text-xs">
                        <div className="flex items-center gap-1.5 font-display font-black">
                          <span>{label}</span>
                          <span className="text-stone-400 font-normal text-[10px]">({item.date})</span>
                        </div>
                        <div className="text-amber-300 font-extrabold text-[11px] mt-0.5">
                          ⚡ Total XP: {Number(payload[0].value).toLocaleString()}
                        </div>
                        <div className="text-emerald-400 font-bold text-[10px]">
                          +{item.xpGained} earned that day
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="xp"
                name="Total XP"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#xpAreaGradient)"
                dot={{ r: 3.5, fill: '#ec4899', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={true}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="xpBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as XpHistoryPoint;
                    return (
                      <div className="bg-stone-900/90 text-white backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-lg border border-purple-400/40 text-xs">
                        <div className="font-display font-black">
                          {label} <span className="text-stone-400 font-normal text-[10px]">({item.date})</span>
                        </div>
                        <div className="text-emerald-400 font-black text-[11px] mt-0.5">
                          +{Number(payload[0].value).toLocaleString()} XP Gained
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="xpGained"
                name="XP Gained"
                fill="url(#xpBarGradient)"
                radius={[6, 6, 0, 0]}
                isAnimationActive={true}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Milestone */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold mt-2.5 px-0.5">
        <span className="flex items-center gap-1">
          <span>🐾</span>
          <span>Level {level} Companion</span>
        </span>
        <span className="text-indigo-600 font-bold">
          ⚡ Forage or feed to boost XP!
        </span>
      </div>
    </div>
  );
};
