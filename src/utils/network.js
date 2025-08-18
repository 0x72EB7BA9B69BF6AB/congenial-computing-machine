/**
 * Utilitaires pour la manipulation des requêtes réseau
 */

/**
 * Extrait la vraie IP cliente depuis les headers HTTP
 * @param {Object} req - Objet de requête HTTP
 * @returns {string|null} L'adresse IP réelle du client
 */
function getRealIP(req) {
  const ipRaw = 
    req.headers?.['x-forwarded-for'] ||
    req.headers?.['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    (req.connection?.socket ? req.connection.socket.remoteAddress : null);
    
  if (ipRaw) {
    // Prendre seulement la première IP (publique)
    return ipRaw.split(',')[0].trim();
  }
  
  return ipRaw;
}

/**
 * Vérifie si le User-Agent est autorisé
 * @param {string} userAgent - Le User-Agent de la requête
 * @param {string[]} allowedAgents - Liste des User-Agents autorisés
 * @returns {boolean} True si autorisé
 */
function isValidUserAgent(userAgent = '', allowedAgents = []) {
  return allowedAgents.some(agent => userAgent.includes(agent));
}

/**
 * Génère l'URL WebSocket dynamique basée sur la requête
 * @param {Object} req - Objet de requête HTTP
 * @returns {string} URL WebSocket complète
 */
function generateWebSocketURL(req) {
  const config = require('../config/config');
  const protocol = req.headers['x-forwarded-proto'] || 'ws';
  const host = req.headers.host || 'b5c9f2f3-4577-41d0-b761-85937516f603-00-36saotrhgjkz4.kirk.replit.dev';
  const wsProtocol = protocol === 'https' ? 'wss' : 'ws';
  
  // Remove any existing port and add the WebSocket port
  const hostWithoutPort = host.split(':')[0];
  const wsPort = config.ports.websocket;
  
  return `${wsProtocol}://${hostWithoutPort}:${wsPort}`;
}

module.exports = {
  getRealIP,
  isValidUserAgent,
  generateWebSocketURL
};