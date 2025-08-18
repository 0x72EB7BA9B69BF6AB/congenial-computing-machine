/**
 * Gestionnaire de validation et sécurité des entrées
 */

/**
 * Valide et sanitise du code JavaScript
 * @param {string} code - Code JavaScript à valider
 * @returns {Object} Résultat de validation
 */
function validateJavaScript(code) {
  if (!code || typeof code !== 'string') {
    return {
      valid: false,
      error: 'Code JavaScript manquant ou invalide'
    };
  }

  const trimmedCode = code.trim();
  if (trimmedCode.length === 0) {
    return {
      valid: false,
      error: 'Code JavaScript vide'
    };
  }

  // Vérifications de sécurité basiques
  const dangerousPatterns = [
    /require\s*\(/i,
    /process\s*\./i,
    /global\s*\./i,
    /__dirname/i,
    /__filename/i,
    /fs\s*\./i,
    /child_process/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedCode)) {
      return {
        valid: false,
        error: 'Code contient des opérations potentiellement dangereuses'
      };
    }
  }

  return {
    valid: true,
    sanitized: trimmedCode
  };
}

/**
 * Valide une adresse IP
 * @param {string} ip - Adresse IP à valider
 * @returns {boolean} True si valide
 */
function validateIP(ip) {
  if (!ip || typeof ip !== 'string') return false;
  
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Sanitise une chaîne pour éviter les injections
 * @param {string} input - Chaîne à sanitiser
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Chaîne sanitisée
 */
function sanitizeString(input, maxLength = 1000) {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Supprime les balises HTML basiques
    .substring(0, maxLength)
    .trim();
}

/**
 * Valide un UUID v4
 * @param {string} uuid - UUID à valider
 * @returns {boolean} True si valide
 */
function validateUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Limite le taux de requêtes par IP
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Vérifie si une IP peut faire une requête
   * @param {string} ip - Adresse IP
   * @returns {boolean} True si autorisé
   */
  isAllowed(ip) {
    if (!validateIP(ip)) return false;

    const now = Date.now();
    const requests = this.requests.get(ip) || [];
    
    // Nettoie les anciennes requêtes
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(ip, validRequests);
    return true;
  }

  /**
   * Nettoie les anciennes entrées
   */
  cleanup() {
    const now = Date.now();
    for (const [ip, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validRequests);
      }
    }
  }
}

module.exports = {
  validateJavaScript,
  validateIP,
  sanitizeString,
  validateUUID,
  RateLimiter
};