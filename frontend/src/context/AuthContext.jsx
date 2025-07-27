import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import keycloak from '../keycloak';
import { getMyProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐ CORRECCIÓN KEYCLOAK: Usamos useRef para evitar la doble inicialización en React 18 Strict Mode
  const isRun = useRef(false);

  const syncProfile = useCallback(async () => {
    try {
      const profileResponse = await getMyProfile();
      if (profileResponse.success) {
        setUser(profileResponse.data);
      } else {
        throw new Error(profileResponse.message);
      }
    } catch (error) {
      console.error("Error sincronizando el perfil:", error);
      logout();
    }
  }, []);

  useEffect(() => {
    // Si ya se ejecutó una vez, no hacemos nada.
    if (isRun.current) return;
    isRun.current = true; // Marcamos que ya se ejecutó.

    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({ 
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false,
        });
        setIsAuthenticated(authenticated);

        if (authenticated) {
          await syncProfile();
        }
      } catch (error) {
        console.error('Error inicializando Keycloak:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, [syncProfile]);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    setUser(null);
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};