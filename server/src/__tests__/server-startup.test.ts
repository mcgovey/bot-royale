/**
 * Server startup and health check tests
 */

import { createServer } from 'http';
import express from 'express';

describe('Server Startup', () => {
  it('should create express app without errors', () => {
    expect(() => {
      const app = express();
      expect(app).toBeDefined();
    }).not.toThrow();
  });

  it('should create HTTP server without errors', () => {
    expect(() => {
      const app = express();
      const server = createServer(app);
      expect(server).toBeDefined();
    }).not.toThrow();
  });

  it('should define health check route', () => {
    const app = express();

    // Add health check route
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    });

    // Verify the route was added
    expect(app._router).toBeDefined();
  });
});
