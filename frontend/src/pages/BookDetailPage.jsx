import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import librosData from "../mocks/libros.json";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [libro, setLibro] = useState(null);
  const [prestamosActuales, setPrestamosActuales] = useState([]);
  const [yaPrestado, setYaPrestado] = useState(false);

  useEffect(() => {
    const found = librosData.find((l) => l.id === parseInt(id));
    setLibro(found);

    const prestamosGuardados = JSON.parse(localStorage.getItem("misPrestamos")) || [];
    setPrestamosActuales(prestamosGuardados);

    const estaPrestado = prestamosGuardados.some(
      (p) => p.titulo === found?.titulo
    );
    setYaPrestado(estaPrestado);
  }, [id]);

  if (!libro) {
    return <h2>Libro no encontrado</h2>;
  }

  const handlePedirPrestamo = () => {
    const nuevoPrestamo = {
      id: Date.now(),
      titulo: libro.titulo,
      fechaInicio: new Date().toISOString().split("T")[0],
      deberiaDevolverseEl: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    const nuevosPrestamos = [...prestamosActuales, nuevoPrestamo];
    localStorage.setItem("misPrestamos", JSON.stringify(nuevosPrestamos));
    setPrestamosActuales(nuevosPrestamos);
    setYaPrestado(true);

    alert("📥 Libro prestado correctamente");
    navigate("/mis-prestamos");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{libro.titulo}</h1>
      <img
        src={libro.portadaURL}
        alt={libro.titulo}
        style={{ width: "300px", height: "auto", marginBottom: "1rem" }}
      />
      <p><strong>Autor:</strong> {libro.autor}</p>
      <p><strong>Páginas:</strong> {libro.numPaginas}</p>
      <p><strong>Ejemplares disponibles:</strong> {libro.numEjemplaresDisponibles}</p>
      <button onClick={handlePedirPrestamo} disabled={yaPrestado}>
        {yaPrestado ? "✔️ Ya prestado" : "📚 Pedir préstamo"}
      </button>
    </div>
  );
}
