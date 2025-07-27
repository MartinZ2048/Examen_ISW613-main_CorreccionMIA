const handlePedirPrestamo = () => {
  const nuevoPrestamo = {
    id: Date.now(),
    titulo: libro.titulo,
    fechaInicio: new Date().toISOString().split("T")[0],
    deberiaDevolverseEl: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  };

  const prestamosActuales = JSON.parse(localStorage.getItem("misPrestamos")) || [];
  prestamosActuales.push(nuevoPrestamo);
  localStorage.setItem("misPrestamos", JSON.stringify(prestamosActuales));

  alert("📥 Libro prestado correctamente");
};
