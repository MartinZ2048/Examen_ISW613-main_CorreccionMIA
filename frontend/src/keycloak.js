// src/keycloak.js
import Keycloak from 'keycloak-js';

// Configuración de Keycloak
const keycloakConfig = {
    url: 'http://localhost:8080/',
    realm: 'biblioteca', 
    clientId: 'biblioteca-frontend'
   
};

// Inicialización de Keycloak
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;