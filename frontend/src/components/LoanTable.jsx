import React from "react";
// Función para calcular si el préstamo está vencido
const estaVencido = (fechaDevolucion) => {
  const hoy = new Date();
  const fechaDev = new Date(fechaDevolucion);
  return hoy > fechaDev;
};

// Función para calcular días de multa
const diasRetraso = (fechaDevolucion) => {
  const hoy = new Date();
  const fechaDev = new Date(fechaDevolucion);
  const diferenciaMs = hoy - fechaDev;
  return Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
};

export default function LoanTable({ prestamos, onDevolver }) {
  return (
    <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "1rem" }}>
      <thead>
        <tr>
          <th>Título</th>
          <th>Fecha de inicio</th>
          <th>Fecha devolución</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {prestamos.map((prestamo) => {
          const vencido = estaVencido(prestamo.deberiaDevolverseEl);
          return (
            <tr
              key={prestamo.id}
              style={vencido ? { backgroundColor: "#f8d7da", color: "#721c24" } : {}}
            >
              <td>{prestamo.titulo}</td>
              <td>{prestamo.fechaInicio}</td>
              <td>{prestamo.deberiaDevolverseEl}</td>
              <td>
                <button onClick={() => onDevolver(prestamo.id)}>Devolver</button>
                {vencido && (
                  <div style={{ color: "#721c24", fontSize: "0.8em" }}>
                    {`🔴 ${diasRetraso(prestamo.deberiaDevolverseEl)} días de retraso`}
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
