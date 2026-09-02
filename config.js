/* ==========================================================================
   FINANCEFLOW - PRODUCTION ENVIRONMENT CONFIGURATION
   ========================================================================== */

window.ENV = {
  // If deployed decoupled (e.g. static Vercel frontend + Render backend API),
  // specify your deployed production backend API URL here:
  // API_URL: 'https://your-financeflow-backend.onrender.com/api'
  API_URL: window.location ? `${window.location.origin}/api` : 'http://localhost:5000/api'
};
