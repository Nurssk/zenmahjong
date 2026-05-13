import { motion } from 'motion/react';
import { Trophy, Clock, Users, ArrowLeft, Medal, Crown } from 'lucide-react';

interface TournamentScreenProps {
  onNavigate: (screen: string) => void;
}

export function TournamentScreen({ onNavigate }: TournamentScreenProps) {
  const globalPlayers = [
    { rank: 1, name: 'DragonMaster', score: 9850, country: '🇯🇵', you: false },
    { rank: 2, name: 'ShadowNinja', score: 9720, country: '🇰🇷', you: false },
    { rank: 3, name: 'PhoenixRising', score: 9680, country: '🇨🇳', you: false },
    { rank: 4, name: 'ZenWarrior', score: 9540, country: '🇰🇿', you: true },
    { rank: 5, name: 'StormBreaker', score: 9320, country: '🇺🇸', you: false },
    { rank: 6, name: 'MysticSage', score: 9180, country: '🇹🇭', you: false },
    { rank: 7, name: 'IronTiger', score: 9050, country: '🇻🇳', you: false },
    { rank: 8, name: 'CrimsonFox', score: 8920, country: '🇬🇧', you: false },
  ];

  const kazakhstanPlayers = [
    { rank: 1, name: 'ZenWarrior', score: 9540, city: 'Almaty', you: true },
    { rank: 2, name: 'SteppeKnight', score: 8750, city: 'Nur-Sultan', you: false },
    { rank: 3, name: 'SilkMaster', score: 8420, city: 'Shymkent', you: false },
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
        {/* Tournament header */}
        <div className="relative mb-8 p-8 rounded-2xl overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff8800]/20 via-[#ff6600]/20 to-transparent blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-[#ff8800]" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ffaa00] to-[#ff6600] bg-clip-text text-transparent">
                Daily Tournament
              </h1>
              <span className="px-3 py-1 bg-red-500 text-xs font-bold rounded-full animate-pulse">
                LIVE
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <InfoCard
                icon={<Clock className="w-5 h-5" />}
                label="Time Remaining"
                value="2h 34m"
              />
              <InfoCard
                icon={<Users className="w-5 h-5" />}
                label="Participants"
                value="12,453"
              />
              <InfoCard
                icon={<Trophy className="w-5 h-5" />}
                label="Prize Pool"
                value="50,000 💎"
              />
            </div>
          </div>
        </div>

        {/* Prize preview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <PrizeCard
            rank={1}
            prize="20,000 💎"
            icon={<Crown className="w-8 h-8 text-yellow-500" />}
            gradient="from-yellow-500/20"
          />
          <PrizeCard
            rank={2}
            prize="15,000 💎"
            icon={<Medal className="w-8 h-8 text-gray-400" />}
            gradient="from-gray-400/20"
          />
          <PrizeCard
            rank={3}
            prize="10,000 💎"
            icon={<Medal className="w-8 h-8 text-amber-700" />}
            gradient="from-amber-700/20"
          />
        </div>

        {/* Leaderboards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Global Leaderboard */}
          <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#ff8800]" />
              Global Rankings
            </h2>

            <div className="space-y-2">
              {globalPlayers.map((player, index) => (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LeaderboardRow player={player} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Kazakhstan Leaderboard */}
          <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              🇰🇿 Kazakhstan Rankings
            </h2>

            <div className="space-y-2">
              {kazakhstanPlayers.map((player, index) => (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LeaderboardRow player={player} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Join tournament CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => onNavigate('game')}
            className="px-12 py-4 bg-gradient-to-r from-[#ff8800] to-[#ff6600] rounded-xl font-bold hover:shadow-[0_0_30px_rgba(255,136,0,0.4)] transition-all text-lg"
          >
            Join Tournament
          </button>
          <p className="text-sm text-[#888888] mt-3">
            Complete games to climb the leaderboard
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-[#1a1a1a] border border-[#ff8800]/20 rounded-xl">
      <div className="flex items-center gap-2 mb-2 text-[#ff8800]">{icon}</div>
      <p className="text-sm text-[#888888] mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function PrizeCard({
  rank,
  prize,
  icon,
  gradient,
}: {
  rank: number;
  prize: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="relative p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl text-center overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} to-transparent`} />
      <div className="relative">
        <div className="flex justify-center mb-3">{icon}</div>
        <p className="text-sm text-[#888888] mb-1">Rank #{rank}</p>
        <p className="text-xl font-bold">{prize}</p>
      </div>
    </div>
  );
}

interface LeaderboardRowProps {
  player: {
    rank: number;
    name: string;
    score: number;
    country?: string;
    city?: string;
    you: boolean;
  };
}

function LeaderboardRow({ player }: LeaderboardRowProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return (
      <span className="text-[#888888] font-bold w-5 text-center">{rank}</span>
    );
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
        player.you
          ? 'bg-gradient-to-r from-[#ff8800]/20 to-transparent border-l-4 border-[#ff8800]'
          : 'bg-[#1a1a1a] hover:bg-[#1f1f1f]'
      }`}
    >
      <div className="w-8 flex justify-center">{getRankIcon(player.rank)}</div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold">
            {player.name}
            {player.you && (
              <span className="ml-2 text-xs text-[#ff8800]">(You)</span>
            )}
          </span>
        </div>
        <p className="text-xs text-[#888888]">
          {player.country || player.city}
        </p>
      </div>

      <div className="text-right">
        <p className="font-bold text-[#ff8800]">{player.score.toLocaleString()}</p>
        <p className="text-xs text-[#888888]">points</p>
      </div>
    </div>
  );
}
