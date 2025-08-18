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
 * Génère l'URL WebSocket fixe (non dynamique selon les exigences)
 * @param {Object} _req - Objet de requête HTTP (ignoré pour URL fixe)
 * @returns {string} URL WebSocket fixe
 */
function generateWebSocketURL(_req) {
  // URL fixe comme demandé - ne change plus dynamiquement
  return 'wss://b5c9f2f3-4577-41d0-b761-85937516f603-00-36saotrhgjkz4.kirk.replit.dev:3000';
}

module.exports = {
  getRealIP,
  isValidUserAgent,
  generateWebSocketURL
};