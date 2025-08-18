const config = require('../config/config');

/**
 * Système de logging centralisé
 */
class Logger {
  constructor() {
    this.level = config.logging.level;
    this.enableTimestamp = config.logging.enableTimestamp;
  }

  /**
   * Formate un message avec timestamp
   * @param {string} level - Niveau de log
   * @param {string} message - Message à logger
   * @returns {string} Message formaté
   */
  format(level, message) {
    const timestamp = this.enableTimestamp ? 
      `[${new Date().toISOString()}]` : '';
    return `${timestamp}[${level.toUpperCase()}] ${message}`;
  }

  /**
   * Log d'information
   * @param {string} message - Message à logger
   */
  info(message) {
    console.log(this.format('info', message));
  }

  /**
   * Log d'erreur
   * @param {string} message - Message à logger
   */
  error(message) {
    console.error(this.format('error', message));
  }

  /**
   * Log de debug
   * @param {string} message - Message à logger
   */
  debug(message) {
    if (this.level === 'debug') {
      console.log(this.format('debug', message));
    }
  }

  /**
   * Log d'avertissement
   * @param {string} message - Message à logger
   */
  warn(message) {
    console.warn(this.format('warn', message));
  }

  /**
   * Log spécialisé pour les connexions clients
   * @param {string} action - Action effectuée
   * @param {string} clientId - ID du client (tronqué)
   * @param {string} details - Détails supplémentaires
   */
  client(action, clientId, details = '') {
    const shortId = clientId ? clientId.substring(0, 8) + '...' : 'unknown';
    this.info(`[CLIENT] ${action}: ${shortId} ${details}`);
  }

  /**
   * Log spécialisé pour les opérations serveur
   * @param {string} message - Message du serveur
   */
  server(message) {
    this.info(`[SERVEUR] ${message}`);
  }

  /**
   * Log spécialisé pour la whitelist
   * @param {string} message - Message de la whitelist
   */
  whitelist(message) {
    this.warn(`[WHITELIST] ${message}`);
  }
}

module.exports = new Logger();