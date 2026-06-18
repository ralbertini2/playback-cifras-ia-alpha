import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles/global.css';

document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
