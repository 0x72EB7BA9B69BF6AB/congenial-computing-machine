/**
 * Configuration centrale du serveur
 */

module.exports = {
  // Configuration des ports
  ports: {
    websocket: process.env.WS_PORT || 5000,
    http: process.env.HTTP_PORT || 3000
  },

  // Configuration de sécurité
  security: {
    whitelistFile: 'whitelist.txt',
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