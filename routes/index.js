/**
 * Routes principales de l'application
 * 
 * Ce fichier gère les routes de l'application, notamment la page d'accueil
 * qui utilise la détection User-Agent pour fournir des réponses différenciées.
 */

const express = require('express');
const router = express.Router();

/**
 * Route de la page d'accueil
 * 
 * Comportement basé sur l'User-Agent:
 * - CitizenFX: Retourne du code JavaScript brut avec alert("1")
 * - Autres clients: Redirige vers une vidéo YouTube
 * 
 * @route GET /
 */
router.get('/', (req, res) => {
    try {
        // Vérification si la requête provient d'un client CitizenFX
        if (req.isCitizenFX) {
            // Réponse pour les clients CitizenFX: code JavaScript brut
            console.log('🎮 Client CitizenFX détecté - Envoi du code JavaScript');
            
            // Définition du type de contenu comme JavaScript
            res.set('Content-Type', 'application/javascript; charset=utf-8');
            
            // Envoi du code JavaScript brut
            res.send('alert("1")');
            
        } else {
            // Réponse pour les autres clients: redirection vers YouTube
            console.log('🌐 Client standard détecté - Redirection vers YouTube');
            
            // Redirection permanente (301) vers la vidéo YouTube spécifiée
            res.redirect(301, 'https://www.youtube.com/watch?v=E4WlUXrJgy4');
        }
        
    } catch (error) {
        // Gestion des erreurs
        console.error('❌ Erreur dans la route d\'accueil:', error);
        res.status(500).send('Erreur interne du serveur');
    }
});

/**
 * Route de test pour vérifier le statut du serveur
 * 
 * @route GET /status
 */
router.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        isCitizenFX: req.isCitizenFX,
        message: 'Serveur fonctionnel - Middleware User-Agent actif'
    });
});

/**
 * Route d'information sur l'API
 * 
 * @route GET /info
 */
router.get('/info', (req, res) => {
    res.json({
        name: 'Serveur Web avec détection User-Agent',
        version: '1.0.0',
        description: 'Serveur qui détecte les clients CitizenFX et fournit des réponses appropriées',
        endpoints: {
            '/': 'Page d\'accueil avec logique conditionnelle',
            '/status': 'Statut du serveur et informations de débogage',
            '/info': 'Informations sur l\'API'
        },
        middleware: {
            userAgentCheck: 'Actif - Détecte la présence de "CitizenFX" dans l\'User-Agent'
        }
    });
});

module.exports = router;