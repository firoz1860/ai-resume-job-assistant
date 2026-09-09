import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { warmup } from './services/api.js';
import './index.css';

// Start waking the backend immediately (best-effort) so the first auth
// request isn't stuck behind a cold start.
warmup();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
