const express = require('express');
const path = require('path');

const app = express();
const PORT = 3004;

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve debug page
app.get('/debug', (req, res) => {
  res.sendFile(path.join(__dirname, 'debug-frontend.html'));
});

// Serve index.html for all routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Frontend server running at http://localhost:${PORT}`);
  console.log(`📱 Authentication UI ready`);
  console.log(`🔗 Backend API: https://plataforma-eventos-mvp.onrender.com/api`);
});