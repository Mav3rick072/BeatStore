import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

ReactDOM.createRoot(document.getElementById("import") ? document.getElementById("import") : document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);