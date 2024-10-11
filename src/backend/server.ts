// src/backend/server.ts
import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the build folder (when in production)
app.use(express.static(path .resolve(__dirname, '../../dist')));

// Sample route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

// Catch-all route to serve your React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist/index.html'));
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export {app} ;