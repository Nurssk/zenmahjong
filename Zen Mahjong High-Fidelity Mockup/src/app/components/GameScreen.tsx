import { motion } from 'motion/react';
import { useState } from 'react';
import {
  ArrowLeft,
  Lightbulb,
  RotateCcw,
  Shuffle,
  Play,
  Pause,
  Timer,
} from 'lucide-react';

interface GameScreenProps {
  onNavigate: (screen: string) => void;
}

export function GameScreen({ onNavigate }: GameScreenProps) {
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(245);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tiles = Array.from({ length: 144 }, (_, i) => ({
    id: i,
    symbol: ['🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆'][i % 7],
    layer: Math.floor(i / 36),
    matched: i < 20,
  }));

  const handleVictory = () => {
    onNavigate('victory');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#ff8800] rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-[#ff8800]/20 bg-[#0f0f0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 text-[#888888] hover:text-[#ff8800] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Exit</span>
            </button>

            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-lg">
                <Timer className="w-4 h-4 text-[#ff8800]" />
                <span className="font-bold font-mono">{formatTime(timeElapsed)}</span>
              </div>

              {/* Score */}
              <div className="px-4 py-2 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-lg">
                <span className="text-sm text-[#888888] mr-2">Score:</span>
                <span className="font-bold text-[#ff8800]">2,450</span>
              </div>

              {/* Pause */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-lg hover:bg-[#1f1f1f] transition-all"
              >
                {isPaused ? (
                  <Play className="w-5 h-5" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,300px] gap-6">
          {/* Game board */}
          <div className="relative">
            {/* Board container */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-[#151515] to-[#0f0f0f] rounded-2xl border border-[#ff8800]/20 p-8 overflow-hidden">
              {/* Ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,136,0,0.05)_0%,transparent_60%)]" />

              {/* Mahjong tiles grid */}
              <div className="relative h-full flex items-center justify-center">
                <div className="grid grid-cols-8 gap-2">
                  {tiles.slice(0, 64).map((tile, index) => (
                    <MahjongTile
                      key={tile.id}
                      tile={tile}
                      isSelected={selectedTiles.includes(tile.id)}
                      onClick={() => {
                        if (!tile.matched) {
                          setSelectedTiles([...selectedTiles, tile.id]);
                          if (selectedTiles.length === 1) {
                            setTimeout(() => setSelectedTiles([]), 300);
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#888888]">Progress</span>
                  <span className="text-[#ff8800]">20/144 matched</span>
                </div>
                <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#ff8800] to-[#ff6600]"
                    initial={{ width: 0 }}
                    animate={{ width: '14%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <ActionButton icon={<Lightbulb />} label="Hint" count={3} />
              <ActionButton icon={<RotateCcw />} label="Undo" count={5} />
              <ActionButton icon={<Shuffle />} label="Shuffle" count={2} />
              <button
                onClick={handleVictory}
                className="ml-auto px-6 py-3 bg-[#ff8800] rounded-lg hover:bg-[#ff6600] transition-all font-bold text-sm"
              >
                Test Victory
              </button>
            </div>
          </div>

          {/* AI Trainer panel */}
          <div className="space-y-4">
            {/* Trainer card */}
            <div className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff8800]/30 to-[#ff6600]/30 border border-[#ff8800]/50 flex items-center justify-center">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-[#ff8800]"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(255,136,0,0.5)',
                          '0 0 40px rgba(255,136,0,0.8)',
                          '0 0 20px rgba(255,136,0,0.5)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#151515] rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold">Shadow Master</h3>
                  <p className="text-xs text-[#888888]">AI Trainer</p>
                </div>
              </div>

              {/* Dialogue */}
              <div className="p-4 bg-[#1a1a1a] border border-[#ff8800]/10 rounded-lg">
                <p className="text-sm text-[#e8e8e8] mb-3">
                  "Focus on clearing the top layers first. Look for matches at
                  the edges..."
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs bg-[#252525] hover:bg-[#2a2a2a] rounded transition-all">
                    Got it
                  </button>
                  <button className="px-3 py-1 text-xs text-[#ff8800] hover:text-[#ff6600] transition-colors">
                    More tips
                  </button>
                </div>
              </div>
            </div>

            {/* Match history */}
            <div className="p-4 bg-[#151515] border border-[#ff8800]/20 rounded-xl">
              <h4 className="text-sm font-bold mb-3">Recent Matches</h4>
              <div className="space-y-2">
                {[
                  { tiles: '🀀 🀀', points: '+50' },
                  { tiles: '🀄 🀄', points: '+50' },
                  { tiles: '🀅 🀅', points: '+50' },
                ].map((match, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm p-2 bg-[#1a1a1a] rounded"
                  >
                    <span>{match.tiles}</span>
                    <span className="text-[#ff8800]">{match.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Combo meter */}
            <div className="p-4 bg-gradient-to-br from-[#1f1f1f] to-[#151515] border border-[#ff8800]/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">Combo</span>
                <span className="text-2xl font-bold text-[#ff8800]">x3</span>
              </div>
              <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#ff8800] to-[#ff6600]"
                  animate={{ width: ['60%', '80%', '60%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MahjongTileProps {
  tile: { id: number; symbol: string; matched: boolean };
  isSelected: boolean;
  onClick: () => void;
}

function MahjongTile({ tile, isSelected, onClick }: MahjongTileProps) {
  if (tile.matched) {
    return <div className="aspect-[3/4] opacity-0" />;
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative aspect-[3/4] rounded-lg flex items-center justify-center
        text-2xl font-bold transition-all cursor-pointer
        ${
          isSelected
            ? 'bg-gradient-to-br from-[#ff8800] to-[#ff6600] shadow-[0_0_20px_rgba(255,136,0,0.5)] border-2 border-[#ffaa00]'
            : 'bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-[#ff8800]/20 hover:border-[#ff8800]/60'
        }
      `}
    >
      {isSelected && (
        <div className="absolute inset-0 bg-[#ff8800]/20 rounded-lg blur-sm" />
      )}
      <span className="relative">{tile.symbol}</span>
    </motion.button>
  );
}

function ActionButton({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button className="flex-1 flex flex-col items-center gap-2 p-4 bg-[#151515] border border-[#ff8800]/20 rounded-lg hover:border-[#ff8800]/40 hover:bg-[#1a1a1a] transition-all">
      <div className="text-[#ff8800]">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-[#888888]">{count} left</span>
    </button>
  );
}
