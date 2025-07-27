// frontend/src/services/api.js

import keycloak from '../keycloak';

// ⭐ CORRECCIÓN: La API ahora apunta al puerto 3000, donde corre el backend.
const API_URL = 'http://localhost:3000/api';

/**
 * Función "envoltorio" para fetch que se encarga de la lógica repetitiva:
 * 1. Construir la URL completa.
 * 2. Añadir el token de autenticación de Keycloak a las cabeceras.
 * 3. Configurar las cabeceras para enviar y recibir JSON.
 * 4. Manejar errores de red y respuestas no exitosas (como 404, 500, etc.).
 * @param {string} endpoint - La parte final de la URL (ej. '/libros', '/prestamos/devolver/5')
 * @param {object} options - Las opciones de configuración para fetch (method, body, etc.)
 * @returns {Promise<any>} - La respuesta de la API ya convertida a JSON.
 */
const apiFetch = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (keycloak.authenticated && keycloak.token) {
    headers['Authorization'] = `Bearer ${keycloak.token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
        message: 'Error desconocido en el servidor'
    }));
    throw new Error(errorData.message || `Error ${response.status}`);
  }

  return response.json();
};

// --- Exportamos funciones específicas para cada endpoint de la API ---

// --- LIBROS ---
export const getLibrosDisponibles = () => apiFetch('/libros');
export const getLibroDetalle = (id) => apiFetch(`/libros/${id}`);

// --- PRESTAMOS ---
export const solicitarPrestamo = (ejemplarId) => {
  return apiFetch('/prestamos', {
    method: 'POST',
    body: JSON.stringify({ ejemplarId }),
  });
};

export const getMisPrestamos = () => {
    return apiFetch('/prestamos/mis-prestamos');
};

export const devolverEjemplar = (ejemplarId) => {
  return apiFetch(`/prestamos/devolver/${ejemplarId}`, {
    method: 'POST',
  });
};

// --- AUTENTICACIÓN ---
export const getMyProfile = () => apiFetch('/auth/profile');