# WebSocket Server - Architecture Modulaire Sécurisée

🌐 **Serveur WebSocket & HTTP avec gestion avancée de sécurité**

## 📋 Fonctionnalités

### 🔒 Sécurité
- **Whitelist IP** : Blocage automatique des adresses IP non autorisées
- **Validation User-Agent** : Restriction aux navigateurs et CitizenFX
- **Rate Limiting** : Protection contre les attaques par déni de service
- **Validation des entrées** : Sanitisation et validation de tous les inputs
- **Headers de sécurité** : Protection contre XSS, CSRF et autres attaques

### 📡 WebSocket
- Connexions sécurisées avec authentification
- Exécution de code JavaScript à distance
- Système de ping/pong pour maintenir les connexions
- Gestion automatique de la reconnexion
- Support de CitizenFX avec obfuscation des variables

### 🌍 Interface Web
- **Page d'accueil** : Client WebSocket intégré
- **Interface d'administration** : Gestion des clients connectés
- **API REST** : Endpoints pour la diffusion de code
- Design responsive et moderne

### 🛠️ Architecture
- **Modulaire** : Séparation claire des responsabilités
- **Extensible** : Ajout facile de nouvelles fonctionnalités
- **Maintenable** : Code organisé et documenté
- **Sécurisé** : Validation et logging complets

## 🚀 Installation

### Prérequis
- Node.js >= 16.0.0
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Configuration
Modifiez le fichier `src/config/config.js` selon vos besoins :

```javascript
module.exports = {
  ports: {
    websocket: 5000,  // Port WebSocket
    http: 80          // Port HTTP
  },
  security: {
    whitelistFile: 'whitelist.txt',
    allowedUserAgents: ['CitizenFX', 'Mozilla', 'Chrome', 'Safari', 'Firefox'],
    maxRetries: 5
  }
  // ...
};
```

### Whitelist IP
Éditez le fichier `whitelist.txt` pour ajouter les IPs à bloquer :
```
# IPs à bloquer (une par ligne)
192.168.1.100
10.0.0.50
# Les lignes commençant par # sont des commentaires
```

## 🔧 Utilisation

### Démarrage du serveur
```bash
# Production
npm start

# Développement (avec redémarrage automatique)
npm run dev
```

### Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## 📁 Structure du Projet

```
src/
├── config/           # Configuration
│   └── config.js
├── services/         # Services métier
│   ├── websocket.js  # Service WebSocket
│   └── templates.js  # Gestionnaire de templates
├── routes/           # Gestionnaire de routes HTTP
│   └── handler.js
├── utils/            # Utilitaires
│   ├── logger.js     # Système de logging
│   ├── network.js    # Utilitaires réseau
│   ├── security.js   # Validation et sécurité
│   ├── whitelist.js  # Gestion whitelist
│   └── randomizer.js # Obfuscation de variables
├── public/           # Ressources statiques
│   ├── css/         # Feuilles de style
│   └── js/          # Scripts client
└── server.js        # Point d'entrée principal
```

## 🌐 Endpoints

### Pages Web
- `GET /` - Page d'accueil avec client WebSocket
- `GET /admin` - Interface d'administration
- `GET /client-browser.js` - Script client (avec obfuscation pour CitizenFX)

### API REST
- `POST /api/broadcast` - Diffusion de code JavaScript
- `GET /api/status` - État du serveur et statistiques

## 🔍 Monitoring

### Logs
Les logs sont affichés dans la console avec différents niveaux :
- `INFO` : Informations générales
- `ERROR` : Erreurs
- `WARN` : Avertissements
- `DEBUG` : Debug (seulement si LOG_LEVEL=debug)

### Statistiques
L'interface d'administration affiche :
- Nombre de clients connectés
- Détails de chaque client (IP, User-Agent, temps de connexion)
- Statut en temps réel
- Historique des diffusions

## 🛡️ Sécurité

### Protection DDoS
- Rate limiting par IP
- Limitation de la taille des requêtes
- Timeout automatique des connexions

### Validation des entrées
- Sanitisation de toutes les chaînes
- Validation des UUIDs
- Filtrage du code JavaScript dangereux

### Headers de sécurité
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`

## 🔧 Variables d'environnement

```bash
# Port WebSocket (défaut: 5000)
WS_PORT=5000

# Port HTTP (défaut: 80)
HTTP_PORT=80

# Niveau de logging (défaut: info)
LOG_LEVEL=debug

# Environnement (défaut: development)
NODE_ENV=production
```

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche : `git checkout -b feature/nouvelle-fonctionnalite`
3. Committez : `git commit -m 'Ajout nouvelle fonctionnalité'`
4. Push : `git push origin feature/nouvelle-fonctionnalite`
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence Unlicense - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🔄 Changelog

### v1.0.0
- ✨ Architecture modulaire complète
- 🔒 Sécurité renforcée avec whitelist et rate limiting
- 🎨 Interface d'administration moderne
- 📡 Support CitizenFX avec obfuscation
- 📊 Logging et monitoring avancés
- 🛠️ Configuration centralisée

---

**Auteur :** 0x72EB7BA9B69BF6AB  
**Version :** 1.0.0