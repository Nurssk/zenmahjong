import { motion } from 'motion/react';
import { Trophy, Star, Zap, Target, Crown } from 'lucide-react';
import { useEffect } from 'react';

interface VictoryScreenProps {
  onNavigate: (screen: string) => void;
}

export function VictoryScreen({ onNavigate }: VictoryScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const confetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glowing particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#ff8800] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -50],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Victory card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-2xl w-full"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff8800] to-[#ff6600] rounded-3xl blur-3xl opacity-30" />

        {/* Card */}
        <div className="relative bg-[#151515]/90 backdrop-blur-xl border border-[#ff8800]/30 rounded-3xl p-8 md:p-12">
          {/* Trophy icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-[#ff8800] rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#ffaa00] to-[#ff6600] flex items-center justify-center">
                <Trophy className="w-12 h-12" />
              </div>
            </div>
          </motion.div>

          {/* Victory text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-[#ffaa00] via-[#ff8800] to-[#ff6600] bg-clip-text text-transparent">
              VICTORY
            </h1>
            <p className="text-[#888888] text-lg">
              You have mastered the board
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Zap className="w-5 h-5" />}
              label="Time"
              value="4:32"
              delay={0.5}
            />
            <StatCard
              icon={<Star className="w-5 h-5" />}
              label="Score"
              value="2,450"
              delay={0.6}
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="Accuracy"
              value="94%"
              delay={0.7}
            />
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Rank"
              value="S"
              delay={0.8}
            />
          </div>

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <h3 className="text-center text-sm text-[#888888] mb-4">
              REWARDS EARNED
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <RewardCard icon="🪙" label="Coins" value="+250" />
              <RewardCard icon="💎" label="Gems" value="+15" />
              <RewardCard icon="⚡" label="XP" value="+500" />
            </div>
          </motion.div>

          {/* Quests completed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-8 p-4 bg-[#1a1a1a] border border-[#ff8800]/20 rounded-xl"
          >
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              Quests Completed
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#888888]">Complete game under 5min</span>
                <span className="text-green-500 font-bold">+150 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#888888]">Win with S rank</span>
                <span className="text-green-500 font-bold">+200 XP</span>
              </div>
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={() => onNavigate('game')}
              className="flex-1 py-4 bg-gradient-to-r from-[#ff8800] to-[#ff6600] rounded-xl font-bold hover:shadow-[0_0_30px_rgba(255,136,0,0.4)] transition-all"
            >
              Play Again
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex-1 py-4 bg-[#1f1f1f] border border-[#ff8800]/30 rounded-xl font-bold hover:bg-[#252525] hover:border-[#ff8800]/60 transition-all"
            >
              Dashboard
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}

function StatCard({ icon, label, value, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 bg-[#1a1a1a] border border-[#ff8800]/20 rounded-xl text-center"
    >
      <div className="flex justify-center mb-2 text-[#ff8800]">{icon}</div>
      <p className="text-xs text-[#888888] mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </motion.div>
  );
}

function RewardCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] border border-[#ff8800]/30 rounded-xl text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-xs text-[#888888] mb-1">{label}</p>
      <p className="font-bold text-[#ff8800]">{value}</p>
    </div>
  );
}
