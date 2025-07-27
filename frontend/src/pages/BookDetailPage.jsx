import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLibroDetalle, solicitarPrestamo } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [libro, setLibro] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLibro = async () => {
      setIsLoading(true);
      try {
        const response = await getLibroDetalle(id);
        if (response.success) {
          setLibro(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibro();
  }, [id]); // Se vuelve a ejecutar si el ID de la URL cambia

  const handlePedirPrestamo = async () => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para pedir un préstamo.");
      return;
    }
    const ejemplarDisponible = libro.ejemplares.find(e => e.estado === 'disponible');
    if (!ejemplarDisponible) {
      alert("No hay ejemplares disponibles para este libro.");
      return;
    }
    try {
      const response = await solicitarPrestamo(ejemplarDisponible.id);
      if(response.success){
        alert("📥 Libro prestado correctamente. Serás redirigido a 'Mis Préstamos'.");
        navigate("/mis-prestamos");
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (err) {
      alert(`Error al solicitar el préstamo: ${err.message}`);
    }
  };

  if (isLoading) return <h2 style={{ padding: "2rem" }}>Cargando detalle del libro...</h2>;
  if (error) return <h2 style={{ padding: "2rem", color: "red" }}>Error: {error}</h2>;
  if (!libro) return <h2 style={{ padding: "2rem" }}>Libro no encontrado</h2>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{libro.titulo}</h1>
      <img src={libro.portadaURL} alt={libro.titulo} style={{ maxWidth: '300px', borderRadius: '8px' }} />
      <p><strong>Autor:</strong> {libro.autor}</p>
      <p><strong>Ejemplares disponibles:</strong> {libro.numEjemplaresDisponibles}</p>
      <button onClick={handlePedirPrestamo} disabled={!libro.disponible || !isAuthenticated}>
        {libro.disponible ? "📚 Pedir préstamo" : "❌ No disponible"}
      </button>
      {!isAuthenticated && <p><small>Inicia sesión para poder pedir préstamos.</small></p>}
    </div>
  );
}