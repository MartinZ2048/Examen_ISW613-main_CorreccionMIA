import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { useNavigate } from "react-router-dom";
import { getLibrosDisponibles } from "../services/api"; // 1. Importar desde la API

export default function BooksPage() {
  const [libros, setLibros] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        // 2. Llamar a la función del servicio de API
        const response = await getLibrosDisponibles();
        if (response.success) {
          setLibros(response.data); // 3. Actualizar el estado con los datos reales
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibros();
  }, []); // El array vacío asegura que se ejecute solo una vez

  const verMas = (id) => {
    navigate(`/libros/${id}`);
  };

  if (isLoading) return <h2 style={{ padding: "2rem" }}>Cargando libros...</h2>;
  if (error) return <h2 style={{ padding: "2rem", color: "red" }}>Error: {error}</h2>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Biblioteca - Libros disponibles</h1>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {libros.map((libro) => (
          <BookCard key={libro.id} libro={libro} onVerMas={verMas} />
        ))}
      </div>
    </div>
  );
}
