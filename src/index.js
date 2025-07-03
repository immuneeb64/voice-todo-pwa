import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ✅ Register service worker BEFORE rendering App
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// ⚡️ Create root and render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ Call service worker register after render
serviceWorkerRegistration.register();
