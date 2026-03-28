import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // ✅ Production: register the service worker for offline support & SPA routing
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('SW registered'));
    });
  } else {
    // 🧹 Development: auto-unregister ANY previously registered service workers.
    // This prevents stale cached HTML from being served instead of Vite's live output,
    // which caused the blank page + hard-reload issue.
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(r => r.unregister());
      if (registrations.length > 0) {
        console.log(`[Dev] Unregistered ${registrations.length} service worker(s)`);
      }
    });
  }
}
