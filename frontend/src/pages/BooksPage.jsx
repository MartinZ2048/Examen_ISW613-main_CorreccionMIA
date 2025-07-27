import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import librosData from "../mocks/libros.json";
import { useNavigate } from "react-router-dom";

export default function BooksPage() {
  const [libros, setLibros] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulamos fetch
    setLibros(librosData);
  }, []);

  const verMas = (id) => {
    navigate(`/libros/${id}`);
  };

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
