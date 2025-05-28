import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useBattleState, useGameStore } from '../store/gameStore';
import { BotState, ChassisStats } from '../types/game';
import { BattleManager } from '../game/BattleManager';

const BattleArena: React.FC = () => {
  const { currentBattle, leaveBattle, setBattleState } = useBattleState();
  const { player, currentBotConfig } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const battleManagerRef = useRef<BattleManager | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize the battle manager and start the game
  useEffect(() => {
    if (!canvasRef.current || !player || !currentBotConfig || isInitializedRef.current) {
      return;
    }

    // Create battle manager
    const battleManager = new BattleManager(canvasRef.current);
    battleManagerRef.current = battleManager;

    // Set up callbacks
    battleManager.setBattleUpdateCallback((battleState) => {
      setBattleState(battleState);
    });

    battleManager.setBattleEndCallback((result) => {
      console.log('Battle ended:', result);
      // Handle battle end (show results, etc.)
      setTimeout(() => {
        leaveBattle();
      }, 3000);
    });

    // Create and start a practice battle
    const practiceBattle = battleManager.createPracticeBattle(currentBotConfig);
    battleManager.startBattle(practiceBattle, player.id);
    setBattleState(practiceBattle);

    isInitializedRef.current = true;

    // Cleanup function
    return () => {
      if (battleManagerRef.current) {
        battleManagerRef.current.dispose();
        battleManagerRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [player, currentBotConfig, setBattleState, leaveBattle]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle escape key to exit pointer lock and show menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        if (battleManagerRef.current?.isInputLocked()) {
          battleManagerRef.current.exitPointerLock();
        } else {
          leaveBattle();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [leaveBattle]);

  if (!currentBattle) return null;

  const playerBot = currentBattle.bots.find((bot: BotState) => bot.playerId === player?.id);

  return (
    <div className="h-full w-full relative">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Player Stats */}
          <div className="panel-cyber p-3 bg-dark-surface/80 pointer-events-auto">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-xs text-gray-400">HEALTH</p>
                <div className="health-bar w-24 h-2">
                  <div
                    className="bg-cyber-green h-full transition-all duration-200"
                    style={{
                      width: `${Math.max(0, (playerBot?.health || 0) / (playerBot?.configuration.chassis.stats as ChassisStats).health * 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-white mt-1">
                  {Math.round(playerBot?.health || 0)}/{(playerBot?.configuration.chassis.stats as ChassisStats).health}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">ENERGY</p>
                <div className="energy-bar w-24 h-2">
                  <div
                    className="bg-cyber-blue h-full transition-all duration-200"
                    style={{
                      width: `${Math.max(0, (playerBot?.energy || 0) / (playerBot?.configuration.chassis.stats as ChassisStats).energyCapacity * 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-white mt-1">
                  {Math.round(playerBot?.energy || 0)}/{(playerBot?.configuration.chassis.stats as ChassisStats).energyCapacity}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">HEAT</p>
                <div className="armor-bar w-24 h-2">
                  <div
                    className="bg-cyber-orange h-full transition-all duration-200"
                    style={{
                      width: `${Math.max(0, (playerBot?.heat || 0) / 100 * 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-white mt-1">
                  {Math.round(playerBot?.heat || 0)}%
                </p>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="panel-cyber p-3 bg-dark-surface/80 pointer-events-auto">
            <p className="text-2xl font-bold text-cyber-blue">
              {Math.floor(currentBattle.timeRemaining / 60)}:{(Math.floor(currentBattle.timeRemaining) % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* Exit Button */}
          <button
            onClick={leaveBattle}
            className="btn-cyber-secondary pointer-events-auto"
          >
            Exit Battle
          </button>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="panel-cyber p-3 bg-dark-surface/80 text-sm">
          <h3 className="text-cyber-blue font-bold mb-2">Controls</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p><span className="text-cyber-green">WASD</span> - Move</p>
              <p><span className="text-cyber-green">Mouse</span> - Look</p>
              <p><span className="text-cyber-green">Shift</span> - Boost</p>
            </div>
            <div>
              <p><span className="text-cyber-orange">Left Click</span> - Fire</p>
              <p><span className="text-cyber-orange">Q</span> - Special</p>
              <p><span className="text-cyber-red">Esc</span> - Exit</p>
            </div>
          </div>
          <p className="text-gray-400 mt-2 text-xs">Click to lock mouse cursor</p>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="flex justify-center">
          <div className="panel-cyber p-3 bg-dark-surface/80">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-xs text-gray-400">PRIMARY</p>
                <p className="text-sm font-bold text-cyber-green">
                  {playerBot?.configuration.weapons[0]?.type.replace('_', ' ').toUpperCase() || 'NONE'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">DEFENSE</p>
                <p className="text-sm font-bold text-cyber-blue">
                  {playerBot?.configuration.defensiveModules[0]?.type.replace('_', ' ').toUpperCase() || 'NONE'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">UTILITY</p>
                <p className="text-sm font-bold text-cyber-purple">
                  {playerBot?.configuration.utilityModules[0]?.type.replace('_', ' ').toUpperCase() || 'NONE'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Effects */}
      {playerBot && (
        <div className="absolute top-20 left-4 z-10 pointer-events-none">
          <div className="space-y-2">
            {playerBot.status.isShielded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="panel-cyber p-2 bg-cyber-blue/20 border-cyber-blue text-cyber-blue text-sm"
              >
                🛡️ SHIELD ACTIVE
              </motion.div>
            )}
            {playerBot.status.isBoosting && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="panel-cyber p-2 bg-cyber-green/20 border-cyber-green text-cyber-green text-sm"
              >
                🚀 BOOST ACTIVE
              </motion.div>
            )}
            {playerBot.status.isOverheated && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="panel-cyber p-2 bg-cyber-red/20 border-cyber-red text-cyber-red text-sm"
              >
                🔥 OVERHEATED
              </motion.div>
            )}
            {!playerBot.status.isAlive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="panel-cyber p-4 bg-cyber-red/20 border-cyber-red text-cyber-red text-lg font-bold"
              >
                💀 DESTROYED
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Enemy Health (if visible) */}
      {currentBattle.bots.filter(bot => bot.playerId !== player?.id && bot.status.isAlive).map(enemyBot => (
        <div key={enemyBot.id} className="absolute top-32 right-4 z-10 pointer-events-none">
          <div className="panel-cyber p-3 bg-dark-surface/80">
            <p className="text-xs text-gray-400 mb-1">ENEMY</p>
            <div className="health-bar w-32 h-2 mb-1">
              <div
                className="bg-cyber-red h-full transition-all duration-200"
                style={{
                  width: `${Math.max(0, enemyBot.health / (enemyBot.configuration.chassis.stats as ChassisStats).health * 100)}%`
                }}
              />
            </div>
            <p className="text-xs text-white">
              {Math.round(enemyBot.health)}/{(enemyBot.configuration.chassis.stats as ChassisStats).health}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BattleArena;
