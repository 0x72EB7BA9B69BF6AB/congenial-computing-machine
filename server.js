/**
 * Serveur Web JavaScript - Application principale
 * 
 * Ce serveur utilise Express.js pour créer une application web avec un middleware
 * de détection User-Agent qui détermine le comportement de la page d'accueil.
 * 
 * Fonctionnalités:
 * - Middleware de vérification User-Agent
 * - Page d'accueil avec logique conditionnelle
 * - Redirection automatique basée sur le client
 */

const express = require('express');
const userAgentMiddleware = require('./middleware/userAgentCheck');
const indexRoutes = require('./routes/index');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Configuration des middlewares globaux
 */

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Middleware pour parser les données URL-encoded
app.use(express.urlencoded({ extended: true }));

// Middleware de logging des requêtes
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - User-Agent: ${req.get('User-Agent')}`);
    next();
});

/**
 * Application du middleware de vérification User-Agent
 * Ce middleware vérifie si la requête provient d'un client CitizenFX
 */
app.use(userAgentMiddleware);

/**
 * Configuration des routes
 */
app.use('/', indexRoutes);

/**
 * Middleware de gestion des erreurs 404
 */
app.use((req, res) => {
    res.status(404).send(`
        <h1>404 - Page Non Trouvée</h1>
        <p>La page que vous cherchez n'existe pas.</p>
        <a href="/">Retour à l'accueil</a>
    `);
});

/**
 * Middleware de gestion des erreurs globales
 */
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err.stack);
    res.status(500).send(`
        <h1>500 - Erreur Serveur</h1>
        <p>Une erreur interne du serveur s'est produite.</p>
    `);
});

/**
 * Démarrage du serveur
 */
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`⚡ Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log('💡 Middleware User-Agent activé pour détecter CitizenFX');
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Arrêt du serveur (Ctrl+C)...');
    process.exit(0);
});

module.exports = app;