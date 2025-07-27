import React, { useEffect, useState, useCallback } from "react";
import LoanTable from "../components/LoanTable";
import { useAuth } from "../context/AuthContext";
import { getMisPrestamos, devolverEjemplar } from "../services/api";

export default function MyLoansPage() {
  const { user, isAuthenticated } = useAuth();
  const [prestamos, setPrestamos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrestamos = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    try {
      const response = await getMisPrestamos();
      if (response.success) {
        setPrestamos(response.data.prestamosActivos || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchPrestamos();
  }, [fetchPrestamos]);

  const handleDevolver = async (ejemplarId) => {
    if (window.confirm("¿Estás seguro de que quieres devolver este libro?")) {
      try {
        const response = await devolverEjemplar(ejemplarId);
        if (response.success) {
          alert("Libro devuelto correctamente.");
          fetchPrestamos(); // Vuelve a cargar la lista para reflejar el cambio
        } else {
          alert(`Error: ${response.message}`);
        }
      } catch (err) {
        alert(`Error al devolver el libro: ${err.message}`);
      }
    }
  };

  if (isLoading) return <h2 style={{ padding: "2rem" }}>Cargando tus préstamos...</h2>;
  if (!isAuthenticated) return <h2 style={{ padding: "2rem" }}>Por favor, inicia sesión para ver tus préstamos.</h2>;
  if (error) return <h2 style={{ padding: "2rem", color: "red" }}>Error: {error}</h2>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📚 Mis préstamos</h1>
      {prestamos.length > 0 ? (
        <LoanTable prestamos={prestamos} onDevolver={handleDevolver} />
      ) : (
        <p>No tienes préstamos activos actualmente.</p>
      )}
    </div>
  );
}