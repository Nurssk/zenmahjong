import { motion } from 'motion/react';
import { useState } from 'react';
import { Check } from 'lucide-react';

interface OnboardingScreenProps {
  onNavigate: (screen: string) => void;
}

export function OnboardingScreen({ onNavigate }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [selectedTrainer, setSelectedTrainer] = useState('shadow-master');
  const [selectedSkin, setSelectedSkin] = useState('classic');

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onNavigate('tutorial');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 w-24 rounded-full transition-all ${
                i <= step
                  ? 'bg-gradient-to-r from-[#ff8800] to-[#ff6600]'
                  : 'bg-[#252525]'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Level Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#ffaa00] to-[#ff6600] bg-clip-text text-transparent">
              Choose Your Path
            </h2>
            <p className="text-[#888888] mb-12">
              Select your skill level to begin training
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  id: 'beginner',
                  title: 'Novice',
                  desc: 'New to Mahjong',
                  glow: 'from-blue-500/20',
                },
                {
                  id: 'intermediate',
                  title: 'Apprentice',
                  desc: 'Some experience',
                  glow: 'from-[#ff8800]/20',
                },
                {
                  id: 'expert',
                  title: 'Master',
                  desc: 'Skilled strategist',
                  glow: 'from-purple-500/20',
                },
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`relative p-8 rounded-xl border transition-all ${
                    selectedLevel === level.id
                      ? 'border-[#ff8800] bg-[#1f1f1f]'
                      : 'border-[#ff8800]/20 bg-[#151515] hover:border-[#ff8800]/40'
                  }`}
                >
                  {selectedLevel === level.id && (
                    <div className="absolute top-4 right-4">
                      <Check className="w-6 h-6 text-[#ff8800]" />
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${level.glow} to-transparent rounded-xl blur-xl`}
                  />
                  <div className="relative">
                    <h3 className="text-2xl font-bold mb-2">{level.title}</h3>
                    <p className="text-[#888888]">{level.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Trainer Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#ffaa00] to-[#ff6600] bg-clip-text text-transparent">
              Choose Your Master
            </h2>
            <p className="text-[#888888] mb-12">
              Select an AI trainer to guide you
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  id: 'shadow-master',
                  name: 'Shadow Master',
                  style: 'Aggressive',
                  specialty: 'Speed tactics',
                },
                {
                  id: 'zen-sage',
                  name: 'Zen Sage',
                  style: 'Balanced',
                  specialty: 'Pattern recognition',
                },
                {
                  id: 'fire-spirit',
                  name: 'Fire Spirit',
                  style: 'Risky',
                  specialty: 'Bold moves',
                },
                {
                  id: 'stone-guardian',
                  name: 'Stone Guardian',
                  style: 'Defensive',
                  specialty: 'Strategic thinking',
                },
              ].map((trainer) => (
                <button
                  key={trainer.id}
                  onClick={() => setSelectedTrainer(trainer.id)}
                  className={`relative group p-6 rounded-xl border transition-all ${
                    selectedTrainer === trainer.id
                      ? 'border-[#ff8800] bg-[#1f1f1f]'
                      : 'border-[#ff8800]/20 bg-[#151515] hover:border-[#ff8800]/40'
                  }`}
                >
                  {selectedTrainer === trainer.id && (
                    <div className="absolute top-4 right-4">
                      <Check className="w-6 h-6 text-[#ff8800]" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff8800]/20 to-[#ff6600]/20 border border-[#ff8800]/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#ff8800] blur-sm" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold">{trainer.name}</h3>
                      <p className="text-[#ff8800] text-sm">{trainer.style}</p>
                    </div>
                  </div>

                  <p className="text-[#888888] text-sm text-left">
                    Specialty: {trainer.specialty}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Board Skin Selection */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#ffaa00] to-[#ff6600] bg-clip-text text-transparent">
              Select Your Arena
            </h2>
            <p className="text-[#888888] mb-12">
              Choose your preferred board aesthetic
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { id: 'classic', name: 'Shadow Stone', theme: 'Dark & Minimal' },
                { id: 'fire', name: 'Ember Realm', theme: 'Orange Glow' },
                { id: 'mystic', name: 'Mystic Void', theme: 'Purple Energy' },
              ].map((skin) => (
                <button
                  key={skin.id}
                  onClick={() => setSelectedSkin(skin.id)}
                  className={`relative p-6 rounded-xl border transition-all ${
                    selectedSkin === skin.id
                      ? 'border-[#ff8800] bg-[#1f1f1f]'
                      : 'border-[#ff8800]/20 bg-[#151515] hover:border-[#ff8800]/40'
                  }`}
                >
                  {selectedSkin === skin.id && (
                    <div className="absolute top-4 right-4">
                      <Check className="w-6 h-6 text-[#ff8800]" />
                    </div>
                  )}

                  <div className="aspect-video rounded-lg bg-gradient-to-br from-[#1a1a1a] to-[#252525] mb-4 flex items-center justify-center border border-[#ff8800]/20">
                    <div className="text-4xl">🀄</div>
                  </div>

                  <h3 className="text-xl font-bold mb-1">{skin.name}</h3>
                  <p className="text-[#888888] text-sm">{skin.theme}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleContinue}
            className="px-12 py-4 bg-gradient-to-r from-[#ff8800] to-[#ff6600] rounded-xl font-bold hover:shadow-[0_0_30px_rgba(255,136,0,0.4)] transition-all"
          >
            {step === 3 ? 'Begin Training' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
