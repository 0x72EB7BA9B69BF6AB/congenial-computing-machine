# Serveur Web JavaScript avec Détection User-Agent

Un serveur web Node.js/Express avec middleware de détection User-Agent qui fournit des réponses différenciées selon le type de client.

## 🚀 Fonctionnalités

- **Détection User-Agent** : Middleware qui détecte les clients CitizenFX
- **Réponses conditionnelles** : 
  - Clients CitizenFX → Code JavaScript brut : `alert("1")`
  - Autres clients → Redirection vers YouTube
- **Architecture modulaire** : Structure organisée avec middlewares et routes séparés
- **Logging complet** : Suivi des requêtes et débogage
- **Gestion d'erreurs** : Middleware de gestion des erreurs 404 et 500

## 📁 Structure du Projet

```
congenial-computing-machine/
├── server.js                 # Application principale
├── package.json              # Configuration Node.js
├── middleware/
│   └── userAgentCheck.js     # Middleware de détection User-Agent
├── routes/
│   └── index.js              # Routes de l'application
├── README.md                 # Documentation
└── LICENSE                   # Licence
```

## 🛠️ Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/0x72EB7BA9B69BF6AB/congenial-computing-machine.git
   cd congenial-computing-machine
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur**
   ```bash
   npm start
   ```

Le serveur sera accessible sur `http://localhost:3000`

## 🎯 Utilisation

### Page d'accueil (`/`)

Le comportement dépend de l'User-Agent :

**Client CitizenFX :**
```bash
curl -H "User-Agent: CitizenFX/1.0" http://localhost:3000/
# Réponse: alert("1")
# Content-Type: application/javascript
```

**Autres clients :**
```bash
curl http://localhost:3000/
# Réponse: Redirection 301 vers https://www.youtube.com/watch?v=E4WlUXrJgy4
```

### Endpoints disponibles

- `GET /` - Page d'accueil avec logique conditionnelle
- `GET /status` - Statut du serveur et informations de débogage
- `GET /info` - Informations sur l'API

## 🔧 Configuration

### Variables d'environnement

- `PORT` : Port du serveur (défaut: 3000)
- `NODE_ENV` : Environnement (development/production)

### Exemples

```bash
# Démarrer sur le port 8080
PORT=8080 npm start

# Mode production (logs réduits)
NODE_ENV=production npm start
```

## 🧪 Tests

### Test avec CitizenFX User-Agent

```bash
curl -H "User-Agent: Mozilla/5.0 (CitizenFX) AppleWebKit/537.36" http://localhost:3000/
```

### Test avec navigateur standard

```bash
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" http://localhost:3000/
```

### Vérifier le statut

```bash
curl http://localhost:3000/status
```

## 📋 API Reference

### GET /

**Description :** Page d'accueil avec détection User-Agent

**Réponses :**
- **CitizenFX détecté :**
  - Code: 200
  - Content-Type: `application/javascript`
  - Body: `alert("1")`

- **Autre client :**
  - Code: 301 (Redirection permanente)
  - Location: `https://www.youtube.com/watch?v=E4WlUXrJgy4`

### GET /status

**Description :** Informations de statut et débogage

**Réponse :**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "isCitizenFX": false,
  "message": "Serveur fonctionnel - Middleware User-Agent actif"
}
```

## 🏗️ Architecture

### Middleware User-Agent

Le middleware `userAgentCheck.js` :
1. Analyse l'en-tête `User-Agent`
2. Recherche la chaîne "CitizenFX" (insensible à la casse)
3. Ajoute la propriété `req.isCitizenFX` pour les routes

### Routes

Le fichier `routes/index.js` contient :
- Route principale (`/`) avec logique conditionnelle
- Route de statut (`/status`) pour le monitoring
- Route d'information (`/info`) sur l'API

## 📝 Logs

Le serveur produit des logs détaillés :

```
🚀 Serveur démarré sur le port 3000
📡 URL: http://localhost:3000
⚡ Mode: development
💡 Middleware User-Agent activé pour détecter CitizenFX

[2024-01-01T12:00:00.000Z] GET / - User-Agent: CitizenFX/1.0
🔍 User-Agent Check: CitizenFX détecté
🎮 Client CitizenFX détecté - Envoi du code JavaScript
```

## 🐛 Débogage

### Problèmes courants

1. **Port déjà utilisé :**
   ```bash
   PORT=3001 npm start
   ```

2. **Problème de dépendances :**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence libre. Voir le fichier [LICENSE](LICENSE) pour plus de détails.