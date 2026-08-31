const express = require('express');
const cors = require('cors');
const routes = require('../server/src/routes');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

module.exports = app;
