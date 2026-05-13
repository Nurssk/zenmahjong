import { motion } from 'motion/react';
import { useState } from 'react';
import { ArrowRight, Target, Lightbulb } from 'lucide-react';

interface TutorialScreenProps {
  onNavigate: (screen: string) => void;
}

export function TutorialScreen({ onNavigate }: TutorialScreenProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Zen Mahjong',
      description:
        'Learn the basics of Mahjong solitaire. Match pairs of identical tiles to clear the board.',
      highlight: 'board',
    },
    {
      title: 'Match Identical Tiles',
      description:
        'Click on two matching tiles to remove them. Only tiles that are free on at least one side can be selected.',
      highlight: 'tiles',
    },
    {
      title: 'Use Your Tools',
      description:
        'Stuck? Use hints to reveal possible matches, undo to take back moves, or shuffle to rearrange tiles.',
      highlight: 'tools',
    },
    {
      title: 'Train with AI Masters',
      description:
        'Your AI trainer will guide you with strategic tips and encouragement throughout your journey.',
      highlight: 'trainer',
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 opacity-10">
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

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Tutorial content */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4">
                <span className="text-sm text-[#888888]">
                  Step {step + 1} of {steps.length}
                </span>
              </div>

              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#ffaa00] to-[#ff6600] bg-clip-text text-transparent">
                {currentStep.title}
              </h2>

              <p className="text-lg text-[#888888] mb-8">
                {currentStep.description}
              </p>

              {/* Progress dots */}
              <div className="flex gap-2 mb-8">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === step
                        ? 'w-12 bg-gradient-to-r from-[#ff8800] to-[#ff6600]'
                        : i < step
                        ? 'w-2 bg-[#ff8800]'
                        : 'w-2 bg-[#252525]'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#ff8800] to-[#ff6600] rounded-xl font-bold hover:shadow-[0_0_30px_rgba(255,136,0,0.4)] transition-all"
                >
                  {step === steps.length - 1 ? "Let's Play" : 'Next'}
                  <ArrowRight className="w-5 h-5" />
                </button>

                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-8 py-4 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-xl font-bold hover:bg-[#1f1f1f] transition-all"
                  >
                    Back
                  </button>
                )}
              </div>

              <button
                onClick={() => onNavigate('dashboard')}
                className="mt-4 text-[#888888] hover:text-[#ff8800] transition-colors text-sm"
              >
                Skip tutorial
              </button>
            </motion.div>

            {/* Visual demonstration */}
            <motion.div
              key={`visual-${step}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {step === 0 && <BoardPreview />}
              {step === 1 && <TilesMatchingPreview />}
              {step === 2 && <ToolsPreview />}
              {step === 3 && <TrainerPreview />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardPreview() {
  return (
    <div className="relative p-8 bg-gradient-to-br from-[#151515] to-[#0f0f0f] rounded-2xl border border-[#ff8800]/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,136,0,0.05)_0%,transparent_60%)]" />
      <div className="relative grid grid-cols-6 gap-2">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-[#ff8800]/20 rounded-lg flex items-center justify-center text-xl"
          >
            {['🀀', '🀁', '🀂', '🀃', '🀄'][i % 5]}
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-3 bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#ff8800]/30 rounded-lg">
          <p className="text-sm text-center">
            <Target className="inline w-4 h-4 mr-2 text-[#ff8800]" />
            Clear all tiles to win
          </p>
        </div>
      </div>
    </div>
  );
}

function TilesMatchingPreview() {
  return (
    <div className="relative p-8 bg-gradient-to-br from-[#151515] to-[#0f0f0f] rounded-2xl border border-[#ff8800]/20">
      <div className="flex justify-center gap-8 mb-8">
        <motion.div
          className="w-24 h-32 bg-gradient-to-br from-[#ff8800] to-[#ff6600] border-2 border-[#ffaa00] rounded-lg flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(255,136,0,0.5)]"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          🀄
        </motion.div>
        <motion.div
          className="w-24 h-32 bg-gradient-to-br from-[#ff8800] to-[#ff6600] border-2 border-[#ffaa00] rounded-lg flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(255,136,0,0.5)]"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.3,
          }}
        >
          🀄
        </motion.div>
      </div>

      <div className="grid grid-cols-6 gap-2 opacity-30">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-[#ff8800]/20 rounded-lg flex items-center justify-center text-sm"
          >
            {['🀀', '🀁', '🀂'][i % 3]}
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-3 bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#ff8800]/30 rounded-lg">
          <p className="text-sm text-center">
            <span className="text-[#ff8800] font-bold">+50 points</span> for each
            match!
          </p>
        </div>
      </div>
    </div>
  );
}

function ToolsPreview() {
  return (
    <div className="space-y-4">
      <ToolCard
        icon={<Lightbulb className="w-6 h-6" />}
        title="Hint"
        description="Reveals a possible match on the board"
        count={3}
      />
      <ToolCard
        icon="↩️"
        title="Undo"
        description="Take back your last move"
        count={5}
      />
      <ToolCard
        icon="🔀"
        title="Shuffle"
        description="Rearrange remaining tiles"
        count={2}
      />
    </div>
  );
}

function ToolCard({
  icon,
  title,
  description,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-6 bg-[#151515] border border-[#ff8800]/20 rounded-xl hover:border-[#ff8800]/40 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] border border-[#ff8800]/30 flex items-center justify-center text-[#ff8800]">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold">{title}</h4>
            <span className="text-sm text-[#888888]">{count} uses</span>
          </div>
          <p className="text-sm text-[#888888]">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function TrainerPreview() {
  return (
    <div className="p-8 bg-[#151515] border border-[#ff8800]/20 rounded-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff8800]/30 to-[#ff6600]/30 border-2 border-[#ff8800]/50 flex items-center justify-center">
            <motion.div
              className="w-10 h-10 rounded-full bg-[#ff8800]"
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
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-[#151515] rounded-full" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Shadow Master</h3>
          <p className="text-sm text-[#888888]">AI Trainer</p>
        </div>
      </div>

      <div className="space-y-4">
        <DialogueBubble
          text="Welcome, warrior. I will guide you on your path to mastery."
          delay={0}
        />
        <DialogueBubble
          text="Focus on the tiles at the top layers first. Strategy is key."
          delay={0.5}
        />
        <DialogueBubble
          text="You're doing well. Keep your eyes on the edges."
          delay={1}
        />
      </div>

      <div className="mt-6 pt-6 border-t border-[#ff8800]/20">
        <p className="text-sm text-center text-[#888888]">
          Your trainer adapts to your playstyle
        </p>
      </div>
    </div>
  );
}

function DialogueBubble({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="p-4 bg-[#1a1a1a] border border-[#ff8800]/10 rounded-lg"
    >
      <p className="text-sm">{text}</p>
    </motion.div>
  );
}
