// frontend/src/App.js

import React from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

/**
 * Este es el componente raíz de la aplicación.
 * Su única responsabilidad es configurar los "proveedores" globales
 * que necesitan todos los demás componentes, como el AuthProvider
 * para la autenticación y el AppRouter para la navegación.
 */
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
