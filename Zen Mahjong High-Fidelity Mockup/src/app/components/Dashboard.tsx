import { motion } from 'motion/react';
import {
  Play,
  Trophy,
  TrendingUp,
  Crown,
  Target,
  ShoppingBag,
  Flame,
  Clock,
  Star,
  Zap,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515]">
      {/* Header */}
      <header className="border-b border-[#ff8800]/20 bg-[#0f0f0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ffaa00] to-[#ff6600] bg-clip-text text-transparent">
            ZEN MAHJONG
          </h1>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ffaa00] to-[#ff6600]" />
              <span className="font-bold">2,450</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-purple-500/30 rounded-lg">
              <Star className="w-5 h-5 text-purple-400" fill="currentColor" />
              <span className="font-bold">180</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome back */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, Warrior</h2>
          <p className="text-[#888888]">Continue your path to mastery</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Play CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('game')}
              className="group relative w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff8800] to-[#ff6600] rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative flex items-center justify-between p-8 bg-gradient-to-r from-[#ff8800] to-[#ff6600] rounded-2xl border border-[#ffaa00]">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center">
                    <Play className="w-8 h-8" fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-3xl font-bold">PLAY NOW</h3>
                    <p className="text-black/70">Start a new game</p>
                  </div>
                </div>
                <Zap className="w-12 h-12 opacity-50" />
              </div>
            </motion.button>

            {/* Quick actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <ActionCard
                icon={<Clock className="w-6 h-6" />}
                title="Continue Game"
                subtitle="Resume your progress"
                onClick={() => onNavigate('game')}
              />
              <ActionCard
                icon={<Trophy className="w-6 h-6" />}
                title="Daily Tournament"
                subtitle="2h 34m remaining"
                badge="Live"
                onClick={() => onNavigate('tournament')}
              />
            </div>

            {/* Daily quests */}
            <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#ff8800]" />
                  Daily Quests
                </h3>
                <span className="text-sm text-[#888888]">3/5 Complete</span>
              </div>

              <div className="space-y-3">
                <QuestItem
                  title="Win 3 games"
                  progress={2}
                  total={3}
                  reward={100}
                />
                <QuestItem
                  title="Complete a game in under 5 minutes"
                  progress={1}
                  total={1}
                  reward={150}
                  completed
                />
                <QuestItem
                  title="Use hint 0 times"
                  progress={0}
                  total={1}
                  reward={200}
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Battle Pass */}
            <div
              onClick={() => onNavigate('battlepass')}
              className="group cursor-pointer relative overflow-hidden p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-purple-500/30 rounded-xl hover:border-purple-500/60 transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-bold text-purple-400">
                    BATTLE PASS
                  </span>
                </div>
                <h4 className="font-bold mb-2">Season 1: Shadow Warriors</h4>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#888888]">Level 8</span>
                    <span className="text-[#888888]">2,450 / 3,000 XP</span>
                  </div>
                  <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                      style={{ width: '82%' }}
                    />
                  </div>
                </div>
                <p className="text-xs text-purple-400">23 days remaining</p>
              </div>
            </div>

            {/* Stats preview */}
            <div
              onClick={() => onNavigate('stats')}
              className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl hover:border-[#ff8800]/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#ff8800]" />
                <h4 className="font-bold">Your Stats</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Win Rate" value="68%" />
                <StatBox label="Streak" value="5" icon={<Flame className="w-4 h-4 text-orange-500" />} />
                <StatBox label="Games" value="234" />
                <StatBox label="Rank" value="#142" />
              </div>
            </div>

            {/* Shop CTA */}
            <button
              onClick={() => onNavigate('shop')}
              className="w-full p-6 bg-gradient-to-br from-[#1f1f1f] to-[#151515] border border-[#ff8800]/30 rounded-xl hover:border-[#ff8800]/60 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="w-5 h-5 text-[#ff8800]" />
                <h4 className="font-bold">Shop</h4>
              </div>
              <p className="text-sm text-[#888888]">
                New trainer packs available
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}

function ActionCard({ icon, title, subtitle, badge, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative group p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl hover:border-[#ff8800]/40 hover:bg-[#1a1a1a] transition-all text-left"
    >
      {badge && (
        <span className="absolute top-4 right-4 px-2 py-1 bg-red-500 text-xs font-bold rounded">
          {badge}
        </span>
      )}
      <div className="mb-3 text-[#ff8800]">{icon}</div>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-[#888888]">{subtitle}</p>
    </button>
  );
}

interface QuestItemProps {
  title: string;
  progress: number;
  total: number;
  reward: number;
  completed?: boolean;
}

function QuestItem({ title, progress, total, reward, completed }: QuestItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
      <div className="flex-1">
        <p className={`text-sm mb-1 ${completed ? 'line-through text-[#888888]' : ''}`}>
          {title}
        </p>
        <div className="h-1.5 bg-[#252525] rounded-full overflow-hidden">
          <div
            className={`h-full ${
              completed ? 'bg-green-500' : 'bg-[#ff8800]'
            }`}
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </div>
      <div className="ml-4 flex items-center gap-1 px-2 py-1 bg-[#252525] rounded">
        <span className="text-xs font-bold">+{reward}</span>
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#ffaa00] to-[#ff6600]" />
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="p-3 bg-[#1a1a1a] rounded-lg">
      <p className="text-xs text-[#888888] mb-1">{label}</p>
      <div className="flex items-center gap-1">
        <p className="text-xl font-bold">{value}</p>
        {icon}
      </div>
    </div>
  );
}
