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
 * @param {number} wsPort - Port du serveur WebSocket
 * @returns {string} URL WebSocket complète
 */
function generateWebSocketURL(req, wsPort) {
  const protocol = req.headers['x-forwarded-proto'] || 'ws';
  const host = req.headers.host || `localhost:${wsPort}`;
  const wsProtocol = protocol === 'https' ? 'wss' : 'ws';
  return `${wsProtocol}://${host}`;
}

module.exports = {
  getRealIP,
  isValidUserAgent,
  generateWebSocketURL
};