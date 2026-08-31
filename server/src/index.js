const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Serve static client assets in production if built
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('SoundVibe API running. Start the client dev server to view the frontend.');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 SoundVibe Server listening on port ${PORT}`);
});
