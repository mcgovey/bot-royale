import React from 'react';
import { motion } from 'framer-motion';
import { GameMode } from '../types/game';
import { useGameStore } from '../store/gameStore';

const MainMenu: React.FC = () => {
  const { setCurrentScreen, startMatchmaking, player } = useGameStore();

  const menuItems = [
    {
      title: 'Bot Builder',
      description: 'Design and customize your battle bot',
      action: () => setCurrentScreen('bot_builder'),
      icon: '🤖',
      color: 'cyber-blue'
    },
    {
      title: 'Quick Match',
      description: 'Jump into a fast 1v1 battle',
      action: () => startMatchmaking(GameMode.QUICK_MATCH),
      icon: '⚡',
      color: 'cyber-green'
    },
    {
      title: 'Ranked Battle',
      description: 'Compete for ranking points',
      action: () => startMatchmaking(GameMode.RANKED),
      icon: '🏆',
      color: 'cyber-orange'
    },
    {
      title: 'Practice Arena',
      description: 'Train against AI opponents',
      action: () => startMatchmaking(GameMode.PRACTICE),
      icon: '🎯',
      color: 'cyber-purple'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-glow text-cyber-blue mb-4">
          BattleBot Arena
        </h1>
        <p className="text-xl text-gray-300">
          Design. Battle. Dominate.
        </p>
      </motion.div>

      {/* Player Info */}
      {player && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="panel-cyber mb-8 p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">{player.username[0]}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-cyber-blue">{player.username}</h3>
              <p className="text-sm text-gray-400">Level {player.level} • {player.rank}</p>
            </div>
            <div className="ml-8 text-right">
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="text-lg font-bold text-cyber-green">{(player.stats.winRate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={item.action}
            className={`panel-cyber p-6 text-left hover:border-${item.color} transition-all duration-300 group`}
          >
            <div className="flex items-center space-x-4">
              <div className={`text-4xl group-hover:animate-pulse`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold text-${item.color} mb-2`}>
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-12 text-center text-gray-500 text-sm"
      >
        <p>Press ESC at any time to return to this menu</p>
      </motion.div>
    </div>
  );
};

export default MainMenu;
