// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import keycloak from '../keycloak';
import { getMyProfile } from '../services/api'; // 1. IMPORTAMOS LA FUNCIÓN DE LA API

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 'user' ahora guardará el perfil COMPLETO de nuestra base de datos
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Usamos useCallback para evitar que esta función se recree en cada render
  const syncProfile = useCallback(async () => {
    try {
      // 2. LLAMAMOS AL ENDPOINT /api/auth/profile usando nuestro servicio
      const profileResponse = await getMyProfile();
      if (profileResponse.success) {
        // 3. GUARDAMOS EL PERFIL DE LA DB EN EL ESTADO
        // Este objeto 'user' ahora sí contiene el id numérico de tu base de datos.
        setUser(profileResponse.data);
      } else {
        throw new Error(profileResponse.message);
      }
    } catch (error) {
      console.error("Error sincronizando el perfil:", error);
      // Si falla, es mejor desloguear al usuario para evitar un estado inconsistente
      logout();
    }
  }, []);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({ onLoad: 'check-sso' });
        setIsAuthenticated(authenticated);

        if (authenticated) {
          // Si Keycloak dice que el usuario está autenticado,
          // sincronizamos su perfil con nuestro backend.
          await syncProfile();
        }
      } catch (error) {
        console.error('Error inicializando Keycloak:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, [syncProfile]); // syncProfile es una dependencia del efecto

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    setUser(null);
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const value = {
    isAuthenticated,
    user, // Este 'user' ahora tiene el id, nombre, email, etc., de tu DB
    isLoading,
    login,
    logout,
    // Ya no necesitamos exportar getToken o keycloak directamente
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
