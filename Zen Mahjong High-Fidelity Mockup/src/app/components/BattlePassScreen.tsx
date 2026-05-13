import { motion } from 'motion/react';
import { ArrowLeft, Crown, Lock, Check, Star } from 'lucide-react';

interface BattlePassScreenProps {
  onNavigate: (screen: string) => void;
}

export function BattlePassScreen({ onNavigate }: BattlePassScreenProps) {
  const currentLevel = 8;
  const currentXP = 2450;
  const xpForNextLevel = 3000;

  const rewards = [
    { level: 1, free: '🪙 100', premium: '💎 50', unlocked: true },
    { level: 2, free: '🀄 Tile Skin', premium: '🎭 Avatar', unlocked: true },
    { level: 3, free: '🪙 150', premium: '💎 75', unlocked: true },
    { level: 4, free: '🎨 Board Theme', premium: '🔥 Effect', unlocked: true },
    { level: 5, free: '🪙 200', premium: '💎 100', unlocked: true },
    { level: 6, free: '🏆 Badge', premium: '👑 Exclusive Badge', unlocked: true },
    { level: 7, free: '🪙 250', premium: '💎 150', unlocked: true },
    { level: 8, free: '🎯 Quest', premium: '🎁 Mystery Box', unlocked: true },
    { level: 9, free: '🪙 300', premium: '💎 200', unlocked: false },
    { level: 10, free: '🎨 Skin', premium: '🤖 AI Trainer', unlocked: false },
    { level: 11, free: '🪙 350', premium: '💎 250', unlocked: false },
    { level: 12, free: '🏆 Trophy', premium: '👑 Legendary Frame', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515]">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-[#0f0f0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-[#888888] hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="relative mb-8 p-8 rounded-2xl overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-[#ff8800]/20 to-purple-500/20 blur-3xl" />
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-[#ff8800] to-purple-400 bg-clip-text text-transparent">
                Season 1: Shadow Warriors
              </h1>
            </div>

            <div className="grid md:grid-cols-[1fr,auto] gap-6 items-start">
              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#888888]">Level {currentLevel}</span>
                    <span className="text-[#888888]">
                      {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="h-4 bg-[#252525] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-[#ff8800]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(currentXP / xpForNextLevel) * 100}%`,
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                <p className="text-[#888888] mb-4">
                  Unlock exclusive rewards by completing games and quests. Premium
                  pass unlocks the legendary rewards track.
                </p>

                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-[#1a1a1a] border border-purple-500/30 rounded-lg">
                    <span className="text-sm text-[#888888]">Time left:</span>
                    <span className="ml-2 font-bold text-purple-400">
                      23 days
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-lg">
                    <span className="text-sm text-[#888888]">Next reward at:</span>
                    <span className="ml-2 font-bold text-[#ff8800]">
                      Level 9
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-[#ff8800]/20 rounded-2xl blur-xl" />
                <div className="relative p-6 bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] border-2 border-purple-500/50 rounded-2xl min-w-[280px]">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold">Unlock Premium</h3>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-400" />
                      <span>Double rewards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-400" />
                      <span>Exclusive AI trainer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-400" />
                      <span>Legendary cosmetics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-400" />
                      <span>Instant unlock Level 8</span>
                    </li>
                  </ul>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold">$9.99</span>
                      <span className="text-[#888888] line-through">$19.99</span>
                    </div>
                    <p className="text-xs text-purple-400">
                      50% off launch discount
                    </p>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all">
                    Get Premium Pass
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards track */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Rewards Track</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ff8800] rounded" />
                <span className="text-[#888888]">Free Pass</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded" />
                <span className="text-[#888888]">Premium Pass</span>
              </div>
            </div>
          </div>

          {/* Rewards grid */}
          <div className="grid md:grid-cols-6 gap-4">
            {rewards.map((reward) => (
              <RewardTier
                key={reward.level}
                level={reward.level}
                freeReward={reward.free}
                premiumReward={reward.premium}
                unlocked={reward.unlocked}
                current={reward.level === currentLevel}
              />
            ))}
          </div>
        </div>

        {/* Featured reward */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-[#151515] border border-purple-500/30 rounded-xl"
        >
          <div className="grid md:grid-cols-[auto,1fr] gap-6 items-center">
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-[#ff8800]/20 border border-purple-500/50 flex items-center justify-center">
              <div className="text-6xl">🤖</div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-bold text-purple-400">
                  LEVEL 10 PREMIUM REWARD
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Exclusive AI Trainer: Void Master</h3>
              <p className="text-[#888888] mb-4">
                A legendary AI strategist with unique abilities and personality.
                Only available in Season 1 Battle Pass.
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-[#1a1a1a] rounded-lg">
                  <span className="text-xs text-[#888888]">Style:</span>
                  <span className="ml-2 font-bold">Mysterious</span>
                </div>
                <div className="px-4 py-2 bg-[#1a1a1a] rounded-lg">
                  <span className="text-xs text-[#888888]">Rarity:</span>
                  <span className="ml-2 font-bold text-purple-400">
                    Legendary
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface RewardTierProps {
  level: number;
  freeReward: string;
  premiumReward: string;
  unlocked: boolean;
  current: boolean;
}

function RewardTier({
  level,
  freeReward,
  premiumReward,
  unlocked,
  current,
}: RewardTierProps) {
  return (
    <div
      className={`relative p-4 rounded-xl border ${
        current
          ? 'bg-gradient-to-b from-[#1f1f1f] to-[#1a1a1a] border-[#ff8800]'
          : 'bg-[#151515] border-[#ff8800]/20'
      }`}
    >
      {current && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <span className="px-2 py-0.5 bg-[#ff8800] text-xs font-bold rounded-full">
            CURRENT
          </span>
        </div>
      )}

      <div className="text-center mb-3">
        <span className="text-xs font-bold text-[#888888]">LEVEL {level}</span>
      </div>

      {/* Free reward */}
      <div
        className={`mb-2 p-2 rounded-lg ${
          unlocked
            ? 'bg-[#1f1f1f] border border-[#ff8800]/30'
            : 'bg-[#1a1a1a] border border-[#252525]'
        }`}
      >
        <div className="relative">
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
              <Lock className="w-4 h-4" />
            </div>
          )}
          <div className="text-center text-xs">
            <div className="mb-1">{freeReward}</div>
            <span className="text-[#888888]">Free</span>
          </div>
        </div>
      </div>

      {/* Premium reward */}
      <div
        className={`p-2 rounded-lg ${
          unlocked
            ? 'bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30'
            : 'bg-[#1a1a1a] border border-[#252525]'
        }`}
      >
        <div className="relative">
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
              <Crown className="w-4 h-4 text-[#888888]" />
            </div>
          )}
          <div className="text-center text-xs">
            <div className="mb-1">{premiumReward}</div>
            <span className="text-purple-400">Premium</span>
          </div>
        </div>
      </div>

      {unlocked && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-[#151515] rounded-full flex items-center justify-center">
          <Check className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
