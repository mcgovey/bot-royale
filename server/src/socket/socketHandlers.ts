import { Socket, Server as SocketIOServer } from 'socket.io';
import { GameManager } from '../game/GameManager';
import { MatchmakingService } from '../services/MatchmakingService';
import { PlayerService } from '../services/PlayerService';
import {
  GameMessage,
  PlayerInput,
  MatchmakingRequest,
  BotConfiguration,
  GameMode
} from '../types/game';
import { logger } from '../utils/logger';

interface SocketServices {
  gameManager: GameManager;
  matchmakingService: MatchmakingService;
  playerService: PlayerService;
  io: SocketIOServer;
}

export function setupSocketHandlers(socket: Socket, services: SocketServices) {
  const { gameManager, matchmakingService, playerService, io } = services;

  // Player authentication and connection
  socket.on('player:authenticate', async (data: { username: string; token?: string }) => {
    try {
      // In a real app, validate the token here
      const player = playerService.createPlayer({
        username: data.username,
        level: 1,
        rank: 'Bronze'
      });

      playerService.setPlayerOnline(player, socket.id);

      socket.emit('player:authenticated', {
        success: true,
        player
      });

      // Join player to a general room for broadcasts
      socket.join('lobby');

      logger.info(`Player ${player.username} authenticated`);
    } catch (error) {
      socket.emit('player:authenticated', {
        success: false,
        error: 'Authentication failed'
      });
      logger.error('Authentication error:', error);
    }
  });

  // Bot configuration updates
  socket.on('bot:update', (botConfig: BotConfiguration) => {
    const player = playerService.getPlayerBySocket(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Player not found' });
      return;
    }

    const success = playerService.updatePlayerBot(player.id, botConfig);
    socket.emit('bot:updated', { success, botConfig });

    if (success) {
      logger.info(`Bot configuration updated for player ${player.username}`);
    }
  });

  // Matchmaking
  socket.on('matchmaking:join', (request: MatchmakingRequest) => {
    const player = playerService.getPlayerBySocket(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Player not found' });
      return;
    }

    if (!player.currentBot) {
      socket.emit('matchmaking:error', { message: 'No bot configuration found' });
      return;
    }

    // Update the request with the current player
    const fullRequest: MatchmakingRequest = {
      ...request,
      playerId: player.id,
      botConfiguration: player.currentBot
    };

    matchmakingService.addPlayerToQueue(player, fullRequest);

    socket.emit('matchmaking:queued', {
      gameMode: request.gameMode,
      estimatedWait: 30 // seconds
    });

    logger.info(`Player ${player.username} joined ${request.gameMode} queue`);
  });

  socket.on('matchmaking:leave', () => {
    const player = playerService.getPlayerBySocket(socket.id);
    if (!player) return;

    matchmakingService.removePlayerFromQueue(player.id);
    socket.emit('matchmaking:left');

    logger.info(`Player ${player.username} left matchmaking queue`);
  });

  socket.on('matchmaking:status', () => {
    const player = playerService.getPlayerBySocket(socket.id);
    if (!player) return;

    const status = matchmakingService.getQueueStatus(player.id);
    socket.emit('matchmaking:status', status);
  });

  // Battle events
  socket.on('battle:ready', () => {
    const player = playerService.getPlayerBySocket(socket.id);
    if (!player) return;

    playerService.setPlayerReady(player.id, true);

    const battleId = gameManager.getPlayerBattle(player.id);
    if (battleId) {
      // Notify other players in the battle
      const battle = gameManager.getBattle(battleId);
      if (battle) {
        const battleState = battle.getState();
        battleState.players.forEach(p => {
          if (p.id !== player.id) {
            const session = playerService.getPlayer(p.id);
            if (session?.isConnected) {
              io.to(battleId).emit('battle:player_ready', {
                playerId: player.id,
                username: player.username
              });
            }
          }
        });
      }
    }
  });

  socket.on('battle:input', (input: PlayerInput) => {
    const player = playerService.getPlayerBySocket(socket.id);
    if (!player) return;

    // Update activity
    playerService.updateActivity(socket.id);

    // Forward input to game manager
    gameManager.handlePlayerInput(player.id, input);
  });

  // Chat system
  socket.on('chat:message', (data: { message: string; channel?: string }) => {
    const player = playerService.getPlayerBySocket(socket.id);
    if (!player) return;

    const chatMessage = {
      id: `msg_${Date.now()}`,
      playerId: player.id,
      username: player.username,
      message: data.message,
      timestamp: Date.now(),
      channel: data.channel || 'lobby'
    };

    // Broadcast to appropriate channel
    if (data.channel === 'battle') {
      const battleId = gameManager.getPlayerBattle(player.id);
      if (battleId) {
        io.to(battleId).emit('chat:message', chatMessage);
      }
    } else {
      io.to('lobby').emit('chat:message', chatMessage);
    }

    logger.info(`Chat message from ${player.username}: ${data.message}`);
  });

  // Player status updates
  socket.on('player:status', () => {
    const player = playerService.getPlayerBySocket(socket.id);
    if (player) {
      socket.emit('player:status', player);
    }
  });

  // Leaderboard requests
  socket.on('leaderboard:get', (limit?: number) => {
    const leaderboard = playerService.getLeaderboard(limit);
    socket.emit('leaderboard:data', leaderboard);
  });

  // Server stats
  socket.on('server:stats', () => {
    const stats = {
      activeBattles: gameManager.getActiveBattleCount(),
      playersOnline: playerService.getPlayerCount().online,
      queueStats: matchmakingService.getQueueStats()
    };
    socket.emit('server:stats', stats);
  });

  // Spectator mode
  socket.on('spectate:join', (battleId: string) => {
    const battle = gameManager.getBattle(battleId);
    if (!battle) {
      socket.emit('spectate:error', { message: 'Battle not found' });
      return;
    }

    socket.join(`spectate_${battleId}`);
    socket.emit('spectate:joined', {
      battleId,
      battleState: battle.getState()
    });

    logger.info(`Socket ${socket.id} joined spectator mode for battle ${battleId}`);
  });

  socket.on('spectate:leave', (battleId: string) => {
    socket.leave(`spectate_${battleId}`);
    socket.emit('spectate:left');
  });

  // Error handling
  socket.on('error', (error: Error) => {
    logger.error(`Socket error from ${socket.id}:`, error);
  });

  // Heartbeat for connection monitoring
  socket.on('ping', () => {
    playerService.updateActivity(socket.id);
    socket.emit('pong');
  });
}

// Helper function to broadcast battle updates
export function broadcastBattleUpdate(io: SocketIOServer, battleId: string, battleState: any) {
  // Send to players in the battle
  io.to(battleId).emit('battle:update', battleState);

  // Send to spectators
  io.to(`spectate_${battleId}`).emit('battle:update', battleState);
}

// Helper function to notify match found
export function notifyMatchFound(io: SocketIOServer, playerService: PlayerService, matchData: any) {
  matchData.players.forEach((player: any) => {
    const session = playerService.getPlayer(player.id);
    if (session?.isConnected) {
      // Find the socket for this player and emit match found
      // This would require maintaining a socket mapping in PlayerService
      io.emit('matchmaking:found', matchData);
    }
  });
}
