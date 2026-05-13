import { motion } from 'motion/react';
import { Play, Trophy, Brain, Crown } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (screen: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#ff8800] rounded-full"
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

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,136,0,0.05)_0%,transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              className="absolute inset-0 blur-2xl bg-[#ff8800] opacity-30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />
            <h1 className="relative text-6xl md:text-8xl font-bold bg-gradient-to-b from-[#ffaa00] via-[#ff8800] to-[#ff6600] bg-clip-text text-transparent">
              ZEN MAHJONG
            </h1>
          </div>
          <p className="text-[#888888] text-lg md:text-xl max-w-md mx-auto">
            Master the ancient art of strategy in a legendary puzzle arena
          </p>
        </motion.div>

        {/* Main CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('dashboard')}
          className="group relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff8800] to-[#ff6600] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-[#ff8800] to-[#ff6600] rounded-2xl border border-[#ffaa00] shadow-[0_0_30px_rgba(255,136,0,0.3)]">
            <Play className="w-8 h-8" fill="currentColor" />
            <span className="text-2xl md:text-3xl font-bold">PLAY NOW</span>
          </div>
        </motion.button>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          <FeatureCard
            icon={<Trophy className="w-8 h-8" />}
            title="Daily Tournaments"
            description="Compete globally for legendary rewards"
            delay={0.5}
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="AI Masters"
            description="Train with mystical strategists"
            delay={0.6}
          />
          <FeatureCard
            icon={<Crown className="w-8 h-8" />}
            title="Battle Pass"
            description="Unlock exclusive seasonal content"
            delay={0.7}
          />
        </div>

        {/* Auth buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 flex gap-4"
        >
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-xl hover:bg-[#1f1f1f] hover:border-[#ff8800]/60 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-[#1f1f1f] border border-[#ff8800] rounded-xl hover:bg-[#252525] transition-all"
          >
            Create Account
          </button>
        </motion.div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#ff8800]/20 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-6 bg-[#151515]/80 backdrop-blur-sm border border-[#ff8800]/20 rounded-xl hover:border-[#ff8800]/40 transition-all">
        <div className="mb-4 text-[#ff8800]">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-[#888888] text-sm">{description}</p>
      </div>
    </motion.div>
  );
}
