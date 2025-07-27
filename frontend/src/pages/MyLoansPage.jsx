import React, { useEffect, useState } from "react";
import prestamosData from "../mocks/prestamos.json";
import LoanTable from "../components/LoanTable";

export default function MyLoansPage() {
  const [prestamos, setPrestamos] = useState([]);

  useEffect(() => {
    // Simula un fetch desde el backend
    const prestamosGuardados = JSON.parse(localStorage.getItem("misPrestamos")) || [];
    setPrestamos(prestamosGuardados);
  }, []);

  const handleDevolver = (idPrestamo) => {
    const confirmacion = window.confirm("¿Estás seguro de devolver este libro?");
    if (confirmacion) {
      //setPrestamos((prev) => prev.filter((p) => p.id !== idPrestamo));
       const nuevosPrestamos = prestamos.filter((p) => p.id !== idPrestamo);
      setPrestamos(nuevosPrestamos);
      localStorage.setItem("misPrestamos", JSON.stringify(nuevosPrestamos));
    }
  };

  // Calcular días totales de multa
  const calcularMulta = () => {
    const hoy = new Date();
    return prestamos.reduce((total, p) => {
      const fechaDev = new Date(p.deberiaDevolverseEl);
      if (hoy > fechaDev) {
        const dias = Math.floor((hoy - fechaDev) / (1000 * 60 * 60 * 24));
        return total + dias;
      }
      return total;
    }, 0);
  };
  const diasMulta = calcularMulta();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📚 Mis préstamos</h1>
      {prestamos.length > 0 ? (
        <>
          <LoanTable prestamos={prestamos} onDevolver={handleDevolver} />
          {diasMulta > 0 && (
            <div style={{ marginTop: "1rem", color: "#dc3545", fontWeight: "bold" }}>
              ⚠️ Tienes una multa acumulada de {diasMulta} días.
            </div>
          )}
        </>
      ) : (
        <p>No tienes préstamos actualmente.</p>
      )}
    </div>
  );
}
