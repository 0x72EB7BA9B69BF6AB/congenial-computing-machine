const fs = require('fs');
const path = require('path');
const { generateWebSocketURL } = require('../utils/network');
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
    const wsUrl = generateWebSocketURL(req);
    const clientCode = this._getClientCode();
    const clientCSS = this._readFile(path.join(this.publicPath, 'css/client.css'));

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
    <div id="connectionStatus" class="connection-status connecting">Connexion...</div>
    <button class="debug-toggle" onclick="toggleDebug()">Debug</button>
    <div id="debugConsole" class="debug-console"></div>
    
    <script>
${clientCode.replace(/'wss?:\/\/[^']+'/, `'${wsUrl}'`)}

// Interface de debug améliorée
let debugVisible = false;

function toggleDebug() {
    debugVisible = !debugVisible;
    const console = document.getElementById('debugConsole');
    console.classList.toggle('visible', debugVisible);
}

function updateConnectionStatus(status) {
    const element = document.getElementById('connectionStatus');
    element.className = 'connection-status ' + status;
    switch(status) {
        case 'connecting': element.textContent = 'Connexion...'; break;
        case 'connected': element.textContent = 'Connecté'; break;
        case 'disconnected': element.textContent = 'Déconnecté'; break;
        case 'reconnecting': element.textContent = 'Reconnexion...'; break;
    }
}

function addDebugLog(message, type = 'info') {
    const console = document.getElementById('debugConsole');
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;
    entry.textContent = new Date().toLocaleTimeString() + ' - ' + message;
    console.appendChild(entry);
    console.scrollTop = console.scrollHeight;
}

// Interception des logs pour le debug
const originalLog = console.log;
console.log = function(...args) {
    originalLog.apply(console, args);
    addDebugLog(args.join(' '), 'info');
};

const originalError = console.error;
console.error = function(...args) {
    originalError.apply(console, args);
    addDebugLog(args.join(' '), 'error');
};

// Override des méthodes du client pour les status
if (window.clientInstance5x3m) {
    const originalConnect = window.clientInstance5x3m.connect;
    window.clientInstance5x3m.connect = function() {
        updateConnectionStatus('connecting');
        return originalConnect.call(this);
    };
}

// Mise à jour des status via les événements WebSocket
window.addEventListener('load', () => {
    if (window.clientInstance5x3m && window.clientInstance5x3m.socketConn7x1q) {
        const ws = window.clientInstance5x3m.socketConn7x1q;
        ws.addEventListener('open', () => updateConnectionStatus('connected'));
        ws.addEventListener('close', () => updateConnectionStatus('disconnected'));
        ws.addEventListener('error', () => updateConnectionStatus('disconnected'));
    }
});
    </script>
</body>
</html>`;
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
   * Lit le code client JavaScript
   * @private
   */
  _getClientCode() {
    return this._readFile(path.join(this.publicPath, 'js/client.js'));
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
    let clientCode = this._getClientCode();
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