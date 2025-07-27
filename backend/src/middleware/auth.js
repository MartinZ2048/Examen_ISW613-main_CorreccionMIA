const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { promisify } = require('util');

const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_AUTH_SERVER_URL = process.env.KEYCLOAK_AUTH_SERVER_URL;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID; 

const jwksUri = `${KEYCLOAK_AUTH_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`;

const client = jwksClient({
  jwksUri: jwksUri,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      console.error("[Auth Middleware] Error al obtener la clave de firma JWKS:", err);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autorización no proporcionado o mal formado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verifyAsync = promisify(jwt.verify);
    const issuerUrl = `${KEYCLOAK_AUTH_SERVER_URL}/realms/${KEYCLOAK_REALM}`;

    const decoded = await verifyAsync(token, getKey, {
      audience: KEYCLOAK_CLIENT_ID,
      issuer: issuerUrl,
    });

    req.user = decoded;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error de verificación JWT:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    if (error.name === 'JsonWebTokenError' && error.message.includes('audience invalid')) {
      return res.status(401).json({ message: 'Token inválido: Audiencia no coincide. Asegúrese de que el cliente de Keycloak emita el "aud" claim correctamente.' });
    }
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

// --- FUNCIÓN HELPER PARA OBTENER ROLES ---
// Esta función extraerá los roles del lugar correcto en el token
const getUserRoles = (decodedToken) => {
  if (!decodedToken) return [];
  
  // Roles de cliente (recomendado si los has definido bajo tu cliente en Keycloak)
  if (decodedToken.resource_access && decodedToken.resource_access[KEYCLOAK_CLIENT_ID] && decodedToken.resource_access[KEYCLOAK_CLIENT_ID].roles) {
    return decodedToken.resource_access[KEYCLOAK_CLIENT_ID].roles;
  }
  
  // Roles de Realm (si decidiste usar roles de Realm en lugar de cliente)
  if (decodedToken.realm_access && decodedToken.realm_access.roles) {
    return decodedToken.realm_access.roles;
  }

  return [];
};


// Middleware por rol: isUser
const isUser = (req, res, next) => {
  const userRoles = getUserRoles(req.user);

  if (userRoles.length === 0) {
    return res.status(403).json({ message: 'Acceso denegado. Roles de usuario no encontrados en el token.' });
  }

  // Verifica si el usuario tiene el rol 'USER' o 'ADMIN'
  if (userRoles.includes('USER') || userRoles.includes('ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol USER.' });
  }
};

// Middleware por rol: isAdmin
const isAdmin = (req, res, next) => {
  const userRoles = getUserRoles(req.user);

  if (userRoles.length === 0) {
    return res.status(403).json({ message: 'Acceso denegado. Roles de usuario no encontrados en el token.' });
  }

  if (userRoles.includes('ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol ADMIN.' });
  }
};

module.exports = {
  authenticateJWT,
  isUser,
  isAdmin,
};