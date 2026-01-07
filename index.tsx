import React from 'react';
import './firebaseConfig';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure your HTML file has a div with id="root"');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
