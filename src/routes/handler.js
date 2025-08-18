const url = require('url');
const TemplateManager = require('../services/templates');
const { validateJavaScript } = require('../utils/security');
const logger = require('../utils/logger');

/**
 * Gestionnaire des routes HTTP
 */
class RouteHandler {
  constructor(webSocketService) {
    this.wsService = webSocketService;
    this.templateManager = new TemplateManager();
  }

  /**
   * Route principale - Page d'accueil avec client WebSocket
   */
  handleHome(req, res) {
    try {
      const html = this.templateManager.generateHomePage(req);
      this._sendResponse(res, html, 'text/html');
    } catch (err) {
      logger.error(`Erreur génération page d'accueil: ${err.message}`);
      this._sendError(res, 500, 'Erreur interne du serveur');
    }
  }

  /**
   * Route administration - Interface de gestion des clients
   */
  handleAdmin(req, res) {
    try {
      const clients = this.wsService.getClients();
      const html = this.templateManager.generateAdminPage(clients);
      this._sendResponse(res, html, 'text/html');
    } catch (err) {
      logger.error(`Erreur génération page admin: ${err.message}`);
      this._sendError(res, 500, 'Erreur interne du serveur');
    }
  }

  /**
   * Route client JavaScript - Code avec randomisation potentielle
   */
  handleClientScript(req, res) {
    try {
      const clientCode = this.templateManager.serveClientCode(req);
      this._sendResponse(res, clientCode, 'text/javascript');
    } catch (err) {
      logger.error(`Erreur lecture client-browser.js: ${err.message}`);
      this._sendResponse(res, '// Erreur: Impossible de charger le code client', 'text/javascript', 500);
    }
  }

  /**
   * API de diffusion JavaScript
   */
  handleBroadcastAPI(req, res) {
    if (req.method !== 'POST') {
      return this._sendError(res, 405, 'Méthode non autorisée');
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Limite de taille pour éviter les attaques DoS
      if (body.length > 100000) { // 100KB
        req.connection.destroy();
        return;
      }
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const jsCode = data.code;

        if (!jsCode) {
          return this._sendJSONResponse(res, { 
            success: false, 
            error: 'Code JavaScript manquant' 
          }, 400);
        }

        const result = this.wsService.broadcastJavaScript(jsCode);
        this._sendJSONResponse(res, result);

      } catch (err) {
        logger.error(`Erreur broadcast API: ${err.message}`);
        this._sendJSONResponse(res, { 
          success: false, 
          error: 'JSON invalide' 
        }, 400);
      }
    });

    req.on('error', (err) => {
      logger.error(`Erreur requête broadcast: ${err.message}`);
      this._sendError(res, 400, 'Requête invalide');
    });
  }

  /**
   * Route client individuel (placeholder)
   */
  handleClientPage(req, res) {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Détails Client</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .nav { margin-bottom: 20px; }
        .nav a { margin-right: 15px; color: #007bff; text-decoration: none; }
        .nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="/">🏠 Accueil</a>
        <a href="/admin">🔧 Administration</a>
    </nav>
    <h1>🔍 Détails du Client</h1>
    <p>Fonctionnalité de détails clients en développement.</p>
    <p><em>Cette page affichera les informations détaillées d'un client spécifique.</em></p>
</body>
</html>`;
    this._sendResponse(res, html, 'text/html');
  }

  /**
   * Route 404 - Page non trouvée
   */
  handle404(req, res) {
    const html = this.templateManager.generate404Page();
    this._sendResponse(res, html, 'text/html', 404);
  }

  /**
   * Route API d'état du serveur
   */
  handleStatusAPI(req, res) {
    const clients = this.wsService.getClients();
    const status = {
      server: 'online',
      version: '1.0.0',
      uptime: process.uptime(),
      clients: {
        connected: clients.length,
        list: clients.map(c => ({
          uuid: c.uuid,
          ip: c.ip,
          connectedAt: c.connectedAt,
          lastSeen: c.lastSeen
        }))
      },
      timestamp: new Date().toISOString()
    };
    
    this._sendJSONResponse(res, status);
  }

  /**
   * Routeur principal
   */
  route(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Headers de sécurité
    this._setSecurityHeaders(res);

    // Routage
    switch (pathname) {
    case '/':
      this.handleHome(req, res);
      break;
      
    case '/admin':
      this.handleAdmin(req, res);
      break;
      
    case '/client-browser.js':
    case '/client-browser':
      this.handleClientScript(req, res);
      break;
      
    case '/api/broadcast':
      this.handleBroadcastAPI(req, res);
      break;
      
    case '/api/status':
      this.handleStatusAPI(req, res);
      break;
      
    default:
      if (pathname.startsWith('/client/')) {
        this.handleClientPage(req, res);
      } else {
        this.handle404(req, res);
      }
      break;
    }
  }

  /**
   * Envoie une réponse HTTP
   * @private
   */
  _sendResponse(res, content, contentType = 'text/html', statusCode = 200) {
    res.setHeader('Content-Type', `${contentType}; charset=utf-8`);
    res.writeHead(statusCode);
    res.end(content);
  }

  /**
   * Envoie une réponse JSON
   * @private
   */
  _sendJSONResponse(res, data, statusCode = 200) {
    this._sendResponse(res, JSON.stringify(data), 'application/json', statusCode);
  }

  /**
   * Envoie une erreur HTTP
   * @private
   */
  _sendError(res, statusCode, message) {
    res.writeHead(statusCode);
    res.end(`Erreur ${statusCode}: ${message}`);
  }

  /**
   * Configure les headers de sécurité
   * @private
   */
  _setSecurityHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Commented out to allow universal frame embedding
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
}

module.exports = RouteHandler;