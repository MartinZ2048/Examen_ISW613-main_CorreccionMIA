// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // 1. Importamos el componente principal App
import reportWebVitals from './reportWebVitals';

// 2. Obtenemos el elemento 'root' del HTML donde se montará la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));

// 3. Renderizamos el componente App. Esta es la forma correcta y estándar.
// App se encargará de todo lo demás (AuthProvider, AppRouter, etc.).
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
