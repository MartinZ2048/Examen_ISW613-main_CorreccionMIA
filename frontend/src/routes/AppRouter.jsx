// frontend/src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BooksPage from '../pages/BooksPage';
import BookDetailPage from '../pages/BookDetailPage';
import MyLoansPage from '../pages/MyLoansPage';
import LoginPage from '../pages/LoginPage';
import { useAuth } from '../context/AuthContext';

// El componente PrivateRoute no necesita cambios.
// Se encarga de proteger las rutas que sí lo necesitan.
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* --- Rutas Públicas --- */}
        {/* Cualquiera puede ver la página de login, la lista de libros y el detalle */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/libros" element={<BooksPage />} />
        <Route path="/libros/:id" element={<BookDetailPage />} />

        {/* --- Rutas Privadas --- */}
        {/* Solo los usuarios autenticados pueden ver sus préstamos */}
        <Route 
          path="/mis-prestamos" 
          element={
            <PrivateRoute>
              <MyLoansPage />
            </PrivateRoute>
          } 
        />

        {/* --- Redirección y Ruta por Defecto --- */}
        {/* La página de inicio redirige a la lista de libros */}
        <Route path="/" element={<Navigate to="/libros" />} />

        {/* --- Ruta para página no encontrada --- */}
        {/* Esta ruta se muestra si ninguna de las anteriores coincide */}
        <Route path="*" element={
            <div style={{ padding: '2rem' }}>
                <h2>404 - Página no encontrada</h2>
                <p>La página que buscas no existe.</p>
            </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}