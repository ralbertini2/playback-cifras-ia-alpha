import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
