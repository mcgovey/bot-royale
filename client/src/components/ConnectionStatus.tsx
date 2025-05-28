import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionError } = useGameStore();

  if (isConnected && !connectionError) {
    return null; // Don't show anything when connected
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 z-40"
    >
      <div className={`
        panel-cyber p-3 flex items-center space-x-3
        ${isConnected
          ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
          : 'bg-cyber-red/20 border-cyber-red text-cyber-red'
        }
      `}>
        {/* Status Indicator */}
        <div className="relative">
          <div className={`
            w-3 h-3 rounded-full
            ${isConnected ? 'bg-cyber-green' : 'bg-cyber-red'}
          `} />
          {isConnected && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 w-3 h-3 bg-cyber-green rounded-full"
            />
          )}
        </div>

        {/* Status Text */}
        <div className="text-sm">
          {isConnected ? (
            <span>Connected to Server</span>
          ) : (
            <div>
              <div className="font-semibold">Connection Lost</div>
              {connectionError && (
                <div className="text-xs opacity-80">{connectionError}</div>
              )}
            </div>
          )}
        </div>

        {/* Reconnecting Animation */}
        {!isConnected && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-cyber-red/30 border-t-cyber-red rounded-full"
          />
        )}
      </div>
    </motion.div>
  );
};

export default ConnectionStatus;
