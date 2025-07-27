import React from "react";

export default function BookCard({ libro, onVerMas }) {
  return (
    <div style={{
      border: "1px solid #ddd", padding: "1rem", borderRadius: "8px", width: "200px"
    }}>
      <img src={libro.portadaURL} alt={libro.titulo} style={{ width: "100%", height: "300px", objectFit: "cover" }} />
      <h3>{libro.titulo}</h3>
      <p><strong>Autor:</strong> {libro.autor}</p>
      <button onClick={() => onVerMas(libro.id)}>Ver más</button>
    </div>
  );
}
