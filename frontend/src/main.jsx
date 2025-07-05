// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // This line imports our global CSS, which now includes Tailwind's styles.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* React.StrictMode is a development-only tool that checks for potential problems in your app. */}
    <App />
  </React.StrictMode>,
);