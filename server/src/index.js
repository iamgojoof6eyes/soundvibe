const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SoundVibe API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Find client dist directory reliably across different deployment setups
const candidateDistPaths = [
  path.resolve(__dirname, '..', '..', 'client', 'dist'),
  path.resolve(process.cwd(), 'client', 'dist'),
  path.resolve(__dirname, '..', 'client', 'dist'),
  path.resolve(process.cwd(), 'dist')
];

let clientDistPath = candidateDistPaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || candidateDistPaths[0];

console.log(`📁 Serving client static assets from: ${clientDistPath} (exists: ${fs.existsSync(path.join(clientDistPath, 'index.html'))})`);

app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send('SoundVibe frontend build is in progress or not found. Please run npm run build.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 SoundVibe Server listening on port ${PORT}`);
});
