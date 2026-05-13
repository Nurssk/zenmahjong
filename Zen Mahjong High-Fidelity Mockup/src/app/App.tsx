import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { TutorialScreen } from './components/TutorialScreen';
import { Dashboard } from './components/Dashboard';
import { GameScreen } from './components/GameScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { TournamentScreen } from './components/TournamentScreen';
import { StatisticsScreen } from './components/StatisticsScreen';
import { ShopScreen } from './components/ShopScreen';
import { BattlePassScreen } from './components/BattlePassScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('landing');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentScreen} />;
      case 'login':
        return <LoginScreen onNavigate={setCurrentScreen} />;
      case 'onboarding':
        return <OnboardingScreen onNavigate={setCurrentScreen} />;
      case 'tutorial':
        return <TutorialScreen onNavigate={setCurrentScreen} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentScreen} />;
      case 'game':
        return <GameScreen onNavigate={setCurrentScreen} />;
      case 'victory':
        return <VictoryScreen onNavigate={setCurrentScreen} />;
      case 'tournament':
        return <TournamentScreen onNavigate={setCurrentScreen} />;
      case 'stats':
        return <StatisticsScreen onNavigate={setCurrentScreen} />;
      case 'shop':
        return <ShopScreen onNavigate={setCurrentScreen} />;
      case 'battlepass':
        return <BattlePassScreen onNavigate={setCurrentScreen} />;
      default:
        return <LandingPage onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="size-full dark">
      {renderScreen()}
    </div>
  );
}