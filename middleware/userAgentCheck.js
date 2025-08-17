/**
 * Middleware de vérification User-Agent
 * 
 * Ce middleware analyse l'en-tête User-Agent des requêtes entrantes
 * pour détecter si elles proviennent d'un client CitizenFX.
 * 
 * Comportement:
 * - Ajoute une propriété 'isCitizenFX' à l'objet request
 * - Cette propriété est utilisée par les routes pour déterminer la réponse appropriée
 */

/**
 * Middleware pour détecter les clients CitizenFX
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express  
 * @param {Function} next - Fonction next pour passer au middleware suivant
 */
function checkUserAgent(req, res, next) {
    // Récupération de l'en-tête User-Agent
    const userAgent = req.get('User-Agent') || '';
    
    // Vérification si l'User-Agent contient "CitizenFX"
    // La recherche est insensible à la casse pour plus de flexibilité
    const isCitizenFX = userAgent.toLowerCase().includes('citizenfx');
    
    // Ajout de la propriété à l'objet request pour utilisation dans les routes
    req.isCitizenFX = isCitizenFX;
    
    // Log pour le débogage (peut être désactivé en production)
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🔍 User-Agent Check: ${isCitizenFX ? 'CitizenFX détecté' : 'Client standard'}`);
        console.log(`📱 User-Agent: ${userAgent}`);
    }
    
    // Passage au middleware/route suivant
    next();
}

module.exports = checkUserAgent;