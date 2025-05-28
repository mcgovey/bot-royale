import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import MainMenu from './components/MainMenu';
import BotBuilder from './components/BotBuilder';
import Matchmaking from './components/Matchmaking';
import BattleArena from './components/BattleArena';
import ResultsScreen from './components/ResultsScreen';
import NotificationSystem from './components/NotificationSystem';
import LoadingScreen from './components/LoadingScreen';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  const { uiState, setPlayer, setConnected } = useGameStore();

  useEffect(() => {
    // Initialize player data (in a real app, this would come from authentication)
    const mockPlayer = {
      id: 'player_1',
      username: 'Commander',
      level: 5,
      rank: 'Bronze',
      stats: {
        gamesPlayed: 12,
        wins: 7,
        losses: 5,
        kills: 23,
        deaths: 18,
        damageDealt: 5420,
        damageTaken: 4230,
        winRate: 0.58,
        averageKDA: 1.28
      },
      isReady: false,
      isConnected: true
    };

    setPlayer(mockPlayer);
    setConnected(true);
  }, []); // Empty dependency array - only run once on mount

  const renderCurrentScreen = () => {
    switch (uiState.currentScreen) {
      case 'menu':
        return <MainMenu />;
      case 'bot_builder':
        return <BotBuilder />;
      case 'matchmaking':
        return <Matchmaking />;
      case 'battle':
        return <BattleArena />;
      case 'results':
        return <ResultsScreen />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="App h-full w-full bg-dark-bg text-white overflow-hidden">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Connection Status */}
      <ConnectionStatus />

      {/* Main Content */}
      <main className="relative z-10 h-full w-full">
        {uiState.isLoading ? <LoadingScreen /> : renderCurrentScreen()}
      </main>

      {/* Notification System */}
      <NotificationSystem />

      {/* Error Display */}
      {uiState.error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="panel-cyber bg-cyber-red/20 border-cyber-red text-cyber-red">
            <h3 className="font-bold">Error</h3>
            <p>{uiState.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
