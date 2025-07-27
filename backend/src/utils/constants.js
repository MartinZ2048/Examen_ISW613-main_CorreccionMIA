// src/utils/constants.js
const DIAS_PRESTAMO_POR_ROL = {
  'alumno': 7,     
  'profesor': 30  
};

const MAX_PRESTAMOS_POR_ROL = {
  'alumno': 5,    
  'profesor': 8   
};

const COSTO_MULTA_POR_DIA = 1.0; // Define un costo por día de retraso. 
const DIAS_PENALIZACION_MULTA_FACTOR = 2; // Penalización del doble de días de desfase 

module.exports = {
  DIAS_PRESTAMO_POR_ROL,
  MAX_PRESTAMOS_POR_ROL,
  COSTO_MULTA_POR_DIA,
  DIAS_PENALIZACION_MULTA_FACTOR
};