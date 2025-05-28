import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { GameManager } from './game/GameManager';
import { MatchmakingService } from './services/MatchmakingService';
import { PlayerService } from './services/PlayerService';
import { setupSocketHandlers } from './socket/socketHandlers';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Services
const gameManager = new GameManager();
const matchmakingService = new MatchmakingService(gameManager);
const playerService = new PlayerService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeBattles: gameManager.getActiveBattleCount(),
    connectedPlayers: io.engine.clientsCount
  });
});

// API Routes
app.get('/api/stats', (req, res) => {
  res.json({
    activeBattles: gameManager.getActiveBattleCount(),
    playersOnline: io.engine.clientsCount,
    totalGamesPlayed: gameManager.getTotalGamesPlayed(),
    serverUptime: process.uptime()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Player connected: ${socket.id}`);

  setupSocketHandlers(socket, {
    gameManager,
    matchmakingService,
    playerService,
    io
  });

  socket.on('disconnect', (reason) => {
    logger.info(`Player disconnected: ${socket.id}, reason: ${reason}`);

    // Clean up player from active games and matchmaking
    gameManager.handlePlayerDisconnect(socket.id);
    matchmakingService.removePlayerFromQueue(socket.id);
    playerService.setPlayerOffline(socket.id);
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`🚀 BattleBot Arena server running on port ${PORT}`);
  logger.info(`🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});
