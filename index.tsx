
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// El punto de entrada ahora simplemente monta App.tsx
// La lógica de negocio está separada en servicios y páginas para máxima eficiencia.

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
