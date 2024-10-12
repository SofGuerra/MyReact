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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import jwt from 'jsonwebtoken';


app.get('/api/auth', (req, res) => {

  //const user

  const secret_key = "09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611";

  const signedToken = jwt.sign({username: "UsernameAleksei"}, secret_key, { expiresIn: "30m" })

  jwt.verify(signedToken, secret_key, (err, user) => {

    console.debug("Decoded: " + err + " " + JSON.stringify(user));

  });

  res.json({ message: signedToken });
});

app.post("/api", (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export {app} ;