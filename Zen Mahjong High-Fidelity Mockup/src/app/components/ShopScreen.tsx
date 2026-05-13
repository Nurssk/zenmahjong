import { motion } from 'motion/react';
import { ArrowLeft, ShoppingBag, Star, Sparkles, Crown } from 'lucide-react';

interface ShopScreenProps {
  onNavigate: (screen: string) => void;
}

export function ShopScreen({ onNavigate }: ShopScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515]">
      {/* Header */}
      <header className="border-b border-[#ff8800]/20 bg-[#0f0f0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 text-[#888888] hover:text-[#ff8800] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#ffaa00] to-[#ff6600]" />
                <span className="font-bold">2,450</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-purple-500/30 rounded-lg">
                <Star className="w-4 h-4 text-purple-400" fill="currentColor" />
                <span className="font-bold">180</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#ffaa00] to-[#ff6600] bg-clip-text text-transparent flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-[#ff8800]" />
            Shop
          </h1>
          <p className="text-[#888888]">
            Enhance your experience with premium content
          </p>
        </div>

        {/* Featured offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 p-8 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-[#ff8800]/20 to-purple-500/20 blur-2xl" />
          <div className="relative bg-gradient-to-r from-[#1f1f1f] to-[#1a1a1a] border-2 border-purple-500/50 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-bold text-purple-400">
                LIMITED OFFER
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-3">
                  Legendary Trainer Bundle
                </h2>
                <p className="text-[#888888] mb-4">
                  Unlock 3 exclusive AI masters with unique strategies and
                  personality
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-[#ff8800]">
                    499
                  </span>
                  <Star
                    className="w-6 h-6 text-purple-400"
                    fill="currentColor"
                  />
                  <span className="text-[#888888] line-through ml-2">799</span>
                </div>
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all">
                  Get Bundle
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <TrainerPreview name="Crimson Fury" />
                <TrainerPreview name="Ice Sage" />
                <TrainerPreview name="Storm Lord" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <div className="space-y-8">
          {/* Trainers */}
          <div>
            <h2 className="text-2xl font-bold mb-4">AI Trainers</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <ShopItemCard
                title="Shadow Master"
                description="Aggressive strategy expert"
                price={150}
                currency="gem"
                rarity="legendary"
              />
              <ShopItemCard
                title="Zen Sage"
                description="Balanced tactical guide"
                price={120}
                currency="gem"
                rarity="epic"
              />
              <ShopItemCard
                title="Fire Spirit"
                description="Bold risk-taker"
                price={120}
                currency="gem"
                rarity="epic"
              />
              <ShopItemCard
                title="Stone Guardian"
                description="Defensive master"
                price={90}
                currency="gem"
                rarity="rare"
              />
            </div>
          </div>

          {/* Board Skins */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Board Skins</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <ShopItemCard
                title="Ember Realm"
                description="Fiery orange atmosphere"
                price={500}
                currency="coin"
                rarity="rare"
              />
              <ShopItemCard
                title="Mystic Void"
                description="Purple energy theme"
                price={500}
                currency="coin"
                rarity="rare"
              />
              <ShopItemCard
                title="Jade Temple"
                description="Traditional elegance"
                price={750}
                currency="coin"
                rarity="epic"
              />
              <ShopItemCard
                title="Shadow Arena"
                description="Pure darkness"
                price={300}
                currency="coin"
                rarity="common"
              />
            </div>
          </div>

          {/* Currency Packs */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Currency Packs</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <CurrencyPack
                title="Starter Pack"
                coins={1000}
                gems={50}
                price="$4.99"
              />
              <CurrencyPack
                title="Premium Pack"
                coins={3000}
                gems={150}
                price="$9.99"
                popular
              />
              <CurrencyPack
                title="Ultimate Pack"
                coins={10000}
                gems={600}
                price="$29.99"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainerPreview({ name }: { name: string }) {
  return (
    <div className="aspect-square rounded-xl bg-gradient-to-br from-[#252525] to-[#1f1f1f] border border-[#ff8800]/30 flex flex-col items-center justify-center p-2">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff8800]/30 to-[#ff6600]/30 border border-[#ff8800]/50 flex items-center justify-center mb-2">
        <div className="w-6 h-6 rounded-full bg-[#ff8800]" />
      </div>
      <p className="text-xs text-center font-medium">{name}</p>
    </div>
  );
}

interface ShopItemCardProps {
  title: string;
  description: string;
  price: number;
  currency: 'coin' | 'gem';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

function ShopItemCard({
  title,
  description,
  price,
  currency,
  rarity,
}: ShopItemCardProps) {
  const rarityColors = {
    common: 'from-gray-500/20',
    rare: 'from-blue-500/20',
    epic: 'from-purple-500/20',
    legendary: 'from-[#ff8800]/20',
  };

  const rarityBorders = {
    common: 'border-gray-500/30',
    rare: 'border-blue-500/30',
    epic: 'border-purple-500/30',
    legendary: 'border-[#ff8800]/30',
  };

  return (
    <div
      className={`group relative p-4 bg-[#151515] border ${rarityBorders[rarity]} rounded-xl hover:border-opacity-60 transition-all cursor-pointer`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-b ${rarityColors[rarity]} to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity`}
      />
      <div className="relative">
        <div className="aspect-square rounded-lg bg-gradient-to-br from-[#252525] to-[#1f1f1f] mb-3 flex items-center justify-center">
          <div className="text-4xl">🀄</div>
        </div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-xs text-[#888888] mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-bold">{price}</span>
            {currency === 'coin' ? (
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#ffaa00] to-[#ff6600]" />
            ) : (
              <Star className="w-4 h-4 text-purple-400" fill="currentColor" />
            )}
          </div>
          <button className="px-4 py-1.5 bg-[#ff8800] rounded-lg text-sm font-bold hover:bg-[#ff6600] transition-colors">
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

function CurrencyPack({
  title,
  coins,
  gems,
  price,
  popular,
}: {
  title: string;
  coins: number;
  gems: number;
  price: string;
  popular?: boolean;
}) {
  return (
    <div
      className={`relative p-6 rounded-xl border ${
        popular
          ? 'bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] border-[#ff8800]'
          : 'bg-[#151515] border-[#ff8800]/20'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-[#ff8800] text-xs font-bold rounded-full">
            BEST VALUE
          </span>
        </div>
      )}
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ffaa00] to-[#ff6600]" />
          <span>
            <span className="font-bold">{coins.toLocaleString()}</span> Coins
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-purple-400" fill="currentColor" />
          <span>
            <span className="font-bold">{gems}</span> Gems
          </span>
        </div>
      </div>
      <button
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          popular
            ? 'bg-gradient-to-r from-[#ff8800] to-[#ff6600] hover:shadow-[0_0_30px_rgba(255,136,0,0.4)]'
            : 'bg-[#1f1f1f] border border-[#ff8800]/30 hover:bg-[#252525]'
        }`}
      >
        {price}
      </button>
    </div>
  );
}
