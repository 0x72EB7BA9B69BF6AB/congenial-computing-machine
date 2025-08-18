const http = require('http');
const WebSocketService = require('./services/websocket');
const RouteHandler = require('./routes/handler');
const logger = require('./utils/logger');
const config = require('./config/config');

/**
 * Serveur principal WebSocket et HTTP
 * Architecture modulaire avec séparation des préoccupations
 */
class Server {
  constructor() {
    this.wsService = new WebSocketService();
    this.routeHandler = new RouteHandler(this.wsService);
    this.httpServer = null;
  }

  /**
   * Démarre tous les services
   */
  async start() {
    try {
      // Démarrage du serveur WebSocket
      this.wsService.start();
      
      // Démarrage du serveur HTTP
      this.startHTTPServer();
      
      // Gestion des signaux système
      this.setupGracefulShutdown();
      
      logger.server('Système initialisé avec succès');
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Process ID: ${process.pid}`);
      
    } catch (error) {
      logger.error(`Erreur démarrage serveur: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Démarre le serveur HTTP
   * @private
   */
  startHTTPServer() {
    this.httpServer = http.createServer((req, res) => {
      this.handleHTTPRequest(req, res);
    });

    this.httpServer.listen(config.ports.http, '0.0.0.0', () => {
      logger.server(`HTTP démarré sur http://0.0.0.0:${config.ports.http}`);
    });

    this.httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.ports.http} déjà utilisé`);
      } else {
        logger.error(`Erreur serveur HTTP: ${error.message}`);
      }
      process.exit(1);
    });
  }

  /**
   * Traite les requêtes HTTP
   * @private
   */
  handleHTTPRequest(req, res) {
    const startTime = Date.now();
    
    // Log de la requête
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logger.debug(`${req.method} ${req.url} - ${ip}`);

    // Traitement de la requête
    try {
      this.routeHandler.route(req, res);
    } catch (error) {
      logger.error(`Erreur traitement requête: ${error.message}`);
      res.writeHead(500);
      res.end('Erreur interne du serveur');
    }

    // Log du temps de réponse
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.debug(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });
  }

  /**
   * Configure l'arrêt gracieux du serveur
   * @private
   */
  setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
      logger.info(`Signal ${signal} reçu, arrêt en cours...`);
      
      // Arrêt du serveur HTTP
      if (this.httpServer) {
        this.httpServer.close(() => {
          logger.server('Serveur HTTP arrêté');
        });
      }
      
      // Arrêt du serveur WebSocket
      this.wsService.stop();
      
      // Sortie propre
      setTimeout(() => {
        logger.info('Arrêt terminé');
        process.exit(0);
      }, 1000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
      logger.error(`Exception non gérée: ${error.message}`);
      logger.error(error.stack);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Promise rejetée non gérée: ${reason}`);
      logger.error(`Promise: ${promise}`);
      process.exit(1);
    });
  }

  /**
   * Arrête le serveur
   */
  stop() {
    logger.info('Arrêt du serveur demandé...');
    
    if (this.httpServer) {
      this.httpServer.close();
    }
    
    this.wsService.stop();
  }
}

// Point d'entrée principal
if (require.main === module) {
  // ASCII Art de démarrage
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    🌐 WebSocket Server v1.0                      ║
║                   Architecture Modulaire Sécurisée               ║
╠══════════════════════════════════════════════════════════════════╣
║  📡 WebSocket: Port ${config.ports.websocket.toString().padEnd(47)} ║
║  🌍 HTTP: Port ${config.ports.http.toString().padEnd(51)} ║
║  🔒 Sécurité: Whitelist IP + User-Agent + Rate Limiting         ║
║  📊 Features: Remote JS Execution + Admin Interface             ║
╚══════════════════════════════════════════════════════════════════╝
  `);

  const server = new Server();
  server.start();
}

module.exports = Server;