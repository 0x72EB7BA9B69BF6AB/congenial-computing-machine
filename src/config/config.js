/**
 * Configuration centrale du serveur
 */

module.exports = {
  // Configuration des ports
  ports: {
    websocket: process.env.WS_PORT || 3000,
    http: process.env.HTTP_PORT || 8080  // Note: Port 80 nécessite des privilèges root (sudo)
  },

  // Configuration de sécurité
  security: {
    whitelistFile: 'whitelist.local.txt',  // Utilisez whitelist.txt comme template
    allowedUserAgents: [
      'CitizenFX',
      'Mozilla',
      'Chrome', 
      'Safari',
      'Firefox'
    ],
    maxRetries: 5,
    reconnectBaseDelay: 1000
  },

  // Configuration des clients
  client: {
    pingInterval: 30000, // 30 secondes
    autoRefreshInterval: 5000 // 5 secondes pour l'admin
  },

  // Configuration des logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableTimestamp: true
  },

  // Messages du système
  messages: {
    welcome: 'Connexion établie avec succès',
    ipBlocked: 'IP dans la whitelist',
    ipAlreadyConnected: 'IP déjà connectée',
    jsExecuted: 'Code exécuté avec succès'
  }
};