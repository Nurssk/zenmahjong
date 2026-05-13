import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Flame, Target, Trophy, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StatisticsScreenProps {
  onNavigate: (screen: string) => void;
}

export function StatisticsScreen({ onNavigate }: StatisticsScreenProps) {
  const performanceData = [
    { day: 'Mon', score: 2100 },
    { day: 'Tue', score: 2350 },
    { day: 'Wed', score: 2200 },
    { day: 'Thu', score: 2650 },
    { day: 'Fri', score: 2450 },
    { day: 'Sat', score: 2800 },
    { day: 'Sun', score: 2900 },
  ];

  const winRateData = [
    { week: 'W1', rate: 55 },
    { week: 'W2', rate: 62 },
    { week: 'W3', rate: 68 },
    { week: 'W4', rate: 71 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515]">
      {/* Header */}
      <header className="border-b border-[#ff8800]/20 bg-[#0f0f0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-[#888888] hover:text-[#ff8800] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#ffaa00] to-[#ff6600] bg-clip-text text-transparent flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-[#ff8800]" />
            Your Statistics
          </h1>
          <p className="text-[#888888]">Track your progress and achievements</p>
        </div>

        {/* Key stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <KeyStatCard
            icon={<Trophy className="w-6 h-6" />}
            label="Total Games"
            value="234"
            change="+12 this week"
            positive
          />
          <KeyStatCard
            icon={<Target className="w-6 h-6" />}
            label="Win Rate"
            value="68%"
            change="+3% from last week"
            positive
          />
          <KeyStatCard
            icon={<Flame className="w-6 h-6" />}
            label="Current Streak"
            value="5 wins"
            change="Personal best: 12"
          />
          <KeyStatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Global Rank"
            value="#142"
            change="↑ 8 positions"
            positive
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Performance chart */}
          <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
            <h3 className="text-xl font-bold mb-6">Weekly Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <XAxis
                  dataKey="day"
                  stroke="#888888"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#888888" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255, 136, 0, 0.3)',
                    borderRadius: '8px',
                    color: '#e8e8e8',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#ff8800"
                  strokeWidth={3}
                  dot={{ fill: '#ff8800', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Win rate chart */}
          <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
            <h3 className="text-xl font-bold mb-6">Win Rate Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={winRateData}>
                <XAxis
                  dataKey="week"
                  stroke="#888888"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#888888" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255, 136, 0, 0.3)',
                    borderRadius: '8px',
                    color: '#e8e8e8',
                  }}
                />
                <Bar dataKey="rate" fill="#ff8800" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Playtime */}
          <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#ff8800]" />
              <h3 className="text-xl font-bold">Playtime</h3>
            </div>
            <div className="space-y-4">
              <StatRow label="Total" value="42h 18m" />
              <StatRow label="This Week" value="5h 32m" />
              <StatRow label="Average/Day" value="47m" />
              <StatRow label="Longest Session" value="2h 15m" />
            </div>
          </div>

          {/* Best Records */}
          <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-[#ff8800]" />
              <h3 className="text-xl font-bold">Best Records</h3>
            </div>
            <div className="space-y-4">
              <StatRow label="Fastest Win" value="3:24" highlight />
              <StatRow label="Highest Score" value="3,850" highlight />
              <StatRow label="Perfect Games" value="12" />
              <StatRow label="No-Hint Wins" value="48" />
            </div>
          </div>

          {/* Rankings */}
          <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#ff8800]" />
              <h3 className="text-xl font-bold">Rankings</h3>
            </div>
            <div className="space-y-4">
              <StatRow label="Global" value="#142" badge="↑ 8" />
              <StatRow label="Kazakhstan" value="#1" badge="🇰🇿" />
              <StatRow label="Friends" value="#3" />
              <StatRow label="Peak Rank" value="#87" />
            </div>
          </div>
        </div>

        {/* Achievements preview */}
        <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
          <h3 className="text-xl font-bold mb-6">Recent Achievements</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <AchievementBadge
              icon="🏆"
              title="Speed Demon"
              description="Win in under 4 minutes"
              unlocked
            />
            <AchievementBadge
              icon="🔥"
              title="Hot Streak"
              description="Win 5 games in a row"
              unlocked
            />
            <AchievementBadge
              icon="💎"
              title="Perfectionist"
              description="10 perfect games"
              unlocked
            />
            <AchievementBadge
              icon="👑"
              title="Master"
              description="Reach top 100"
              locked
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface KeyStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive?: boolean;
}

function KeyStatCard({ icon, label, value, change, positive }: KeyStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl"
    >
      <div className="flex items-center gap-2 mb-3 text-[#ff8800]">{icon}</div>
      <p className="text-sm text-[#888888] mb-1">{label}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p
        className={`text-xs ${
          positive ? 'text-green-500' : 'text-[#888888]'
        }`}
      >
        {change}
      </p>
    </motion.div>
  );
}

function StatRow({
  label,
  value,
  badge,
  highlight,
}: {
  label: string;
  value: string;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#888888] text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`font-bold ${
            highlight ? 'text-[#ff8800]' : 'text-[#e8e8e8]'
          }`}
        >
          {value}
        </span>
        {badge && (
          <span className="text-xs px-2 py-0.5 bg-[#1a1a1a] rounded">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function AchievementBadge({
  icon,
  title,
  description,
  unlocked,
  locked,
}: {
  icon: string;
  title: string;
  description: string;
  unlocked?: boolean;
  locked?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl text-center ${
        locked
          ? 'bg-[#1a1a1a] border border-[#252525] opacity-50'
          : 'bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] border border-[#ff8800]/30'
      }`}
    >
      <div className="text-4xl mb-2">{locked ? '🔒' : icon}</div>
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-xs text-[#888888]">{description}</p>
    </div>
  );
}
