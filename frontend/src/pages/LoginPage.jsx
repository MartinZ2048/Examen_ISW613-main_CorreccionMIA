// src/pages/LoginPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { isAuthenticated, login, user, isLoading } = useAuth();

  // Si ya está autenticado, redirigir a libros
  if (isAuthenticated) {
    return <Navigate to="/libros" replace />;
  }

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <h3>Cargando...</h3>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔐 Iniciar Sesión</h1>
        <p style={styles.description}>
          Accede a tu cuenta para gestionar tus préstamos de libros
        </p>
        
        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📚</span>
            <span>Acceso a todos los libros</span>
          </div>
          
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📋</span>
            <span>Gestiona tus préstamos</span>
          </div>
          
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🔒</span>
            <span>Sesión segura con Keycloak</span>
          </div>
        </div>

        <button onClick={login} style={styles.loginButton}>
          Iniciar Sesión con Keycloak
        </button>

        <div style={styles.info}>
          <p style={styles.infoText}>
            💡 Serás redirigido a nuestro servidor de autenticación seguro
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
  },
  card: {
    backgroundColor: '#fff',
    padding: '3rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '1rem',
    fontSize: '2rem',
  },
  description: {
    color: '#7f8c8d',
    marginBottom: '2rem',
    fontSize: '1.1rem',
    lineHeight: '1.5',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  featureIcon: {
    fontSize: '1.2rem',
  },
  loginButton: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '14px 32px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    width: '100%',
    marginBottom: '1rem',
  },
  info: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
  },
  infoText: {
    margin: 0,
    color: '#1976d2',
    fontSize: '14px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
};