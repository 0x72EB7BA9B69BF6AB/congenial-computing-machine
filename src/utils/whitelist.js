const fs = require('fs');
const path = require('path');
const config = require('../config/config');

/**
 * Utilitaires pour la gestion de la whitelist IP
 */
class WhitelistManager {
  constructor() {
    this.whitelistPath = path.join(process.cwd(), config.security.whitelistFile);
  }

  /**
   * Charge la whitelist depuis le fichier
   * @returns {string[]} Liste des IPs dans la whitelist
   */
  load() {
    try {
      if (!fs.existsSync(this.whitelistPath)) {
        return [];
      }
      
      const content = fs.readFileSync(this.whitelistPath, 'utf8');
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    } catch (err) {
      console.error(`[WHITELIST] Erreur chargement: ${err.message}`);
      return [];
    }
  }

  /**
   * Vérifie si une IP est dans la whitelist
   * @param {string} ip - L'adresse IP à vérifier
   * @returns {boolean} True si l'IP est whitelistée
   */
  isBlocked(ip) {
    const whitelist = this.load();
    return ip && whitelist.includes(ip);
  }
}

module.exports = WhitelistManager;