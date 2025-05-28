import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const ResultsScreen: React.FC = () => {
  const {
    currentBattle,
    player,
    setCurrentScreen,
    leaveBattle,
    addNotification
  } = useGameStore();

  const isVictory = currentBattle?.result === 'victory';
  const battleStats = currentBattle?.stats;

  const handleReturnToMenu = () => {
    leaveBattle();
    setCurrentScreen('menu');
  };

  const handlePlayAgain = () => {
    leaveBattle();
    setCurrentScreen('matchmaking');
  };

  const handleViewReplay = () => {
    addNotification({
      type: 'info',
      title: 'Replay System',
      message: 'Replay system coming soon!',
      duration: 3000
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const statVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4
      }
    })
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Result Header */}
        <div className="text-center mb-8">
          <motion.div
            className={`text-8xl mb-4 ${isVictory ? 'text-cyber-green' : 'text-cyber-red'}`}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, isVictory ? 5 : -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {isVictory ? '🏆' : '💥'}
          </motion.div>

          <motion.h1
            className={`text-6xl font-bold mb-2 ${isVictory ? 'text-cyber-green' : 'text-cyber-red'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isVictory ? 'VICTORY!' : 'DEFEAT'}
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isVictory ? 'Your bot dominated the arena!' : 'Better luck next time, Commander.'}
          </motion.p>
        </div>

        {/* Battle Statistics */}
        <motion.div
          className="panel-cyber mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-cyber-blue">Battle Statistics</h2>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Damage Dealt', value: battleStats?.damageDealt || 0, suffix: ' HP' },
              { label: 'Damage Taken', value: battleStats?.damageTaken || 0, suffix: ' HP' },
              { label: 'Shots Fired', value: battleStats?.shotsFired || 0, suffix: '' },
              { label: 'Accuracy', value: battleStats?.accuracy || 0, suffix: '%' },
              { label: 'Battle Duration', value: battleStats?.duration || 0, suffix: 's' },
              { label: 'Distance Traveled', value: battleStats?.distanceTraveled || 0, suffix: 'm' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-dark-panel/50 p-4 rounded-lg border border-cyber-blue/30"
                custom={index}
                variants={statVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-cyber-blue">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rewards Section */}
        <motion.div
          className="panel-cyber mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-cyber-green">Rewards</h2>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">⚡</div>
              <div>
                <div className="text-lg font-bold">+{isVictory ? 150 : 50} XP</div>
                <div className="text-sm text-gray-400">Experience Points</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-3xl">🪙</div>
              <div>
                <div className="text-lg font-bold">+{isVictory ? 100 : 25} Credits</div>
                <div className="text-sm text-gray-400">Battle Currency</div>
              </div>
            </div>
          </div>

          {/* Player Stats Update */}
          {player && (
            <div className="text-sm text-gray-400 border-t border-gray-600 pt-4">
              <p>Commander {player.username} • Level {player.level} • {player.rank}</p>
              <p>Win Rate: {(player.stats.winRate * 100).toFixed(1)}% • Games Played: {player.stats.gamesPlayed}</p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <button
            onClick={handlePlayAgain}
            className="btn-cyber btn-cyber-primary flex-1"
          >
            <span className="text-xl mr-2">⚔️</span>
            Play Again
          </button>

          <button
            onClick={handleViewReplay}
            className="btn-cyber btn-cyber-secondary"
          >
            <span className="text-xl mr-2">📹</span>
            Replay
          </button>

          <button
            onClick={handleReturnToMenu}
            className="btn-cyber btn-cyber-secondary"
          >
            <span className="text-xl mr-2">🏠</span>
            Menu
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
