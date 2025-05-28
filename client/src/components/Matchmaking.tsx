import React from 'react';
import { motion } from 'framer-motion';
import { useMatchmaking, useGameStore } from '../store/gameStore';

const Matchmaking: React.FC = () => {
  const { isMatchmaking, mode, waitTime, cancelMatchmaking } = useMatchmaking();
  const { setCurrentScreen } = useGameStore();

  const handleCancel = () => {
    cancelMatchmaking();
    setCurrentScreen('menu');
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Searching Animation */}
        <motion.div
          className="text-6xl mb-6"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🔍
        </motion.div>

        {/* Status */}
        <h1 className="text-3xl font-bold text-cyber-blue mb-4">
          {isMatchmaking ? 'Searching for Match' : 'Preparing Match'}
        </h1>

        <p className="text-gray-300 mb-2">
          Mode: <span className="text-cyber-green font-semibold">{mode?.replace('_', ' ')}</span>
        </p>

        <p className="text-gray-300 mb-6">
          Estimated wait time: <span className="text-cyber-orange font-semibold">{waitTime}s</span>
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-dark-surface rounded-full h-2 mb-6">
          <motion.div
            className="bg-cyber-blue h-2 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: waitTime,
              ease: "linear"
            }}
          />
        </div>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="btn-cyber-secondary"
        >
          Cancel Search
        </button>
      </motion.div>
    </div>
  );
};

export default Matchmaking;
