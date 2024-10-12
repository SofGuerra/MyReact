// src/backend/server.ts
import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import DatabaseConnection from "./databaseConnection.ts"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the build folder (when in production)
app.use(express.static(path .resolve(__dirname, '../../dist')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
  console.log('Received an api package');
  res.json({ message: 'Hello from Express!' });
});

app.post("/api", (req, res) => {
  console.log("Post request got on server: " + req.body);
  res.json({ message: 'Hello from Express!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export {app} ;