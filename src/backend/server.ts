// src/backend/server.ts
import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import cors from 'cors';
import bcrypt from "bcrypt";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the build folder (when in production)
app.use(express.static(path .resolve(__dirname, '../../dist')));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3000',
}));


import jwt from 'jsonwebtoken';
import ConnectionProvider from './dbConnection.ts'


app.get('/api/auth', (req, res) => {

  //const user

  const secret_key = process.env.WEBTOKEN_ENCRYPTION_KEY;

  if (!secret_key) {
    throw new Error('Cannot find webtoken secret key in the environment');
  }

  const signedToken = jwt.sign({username: "UsernameSofia"}, secret_key, { expiresIn: "30m" })

  //im happy

  jwt.verify(signedToken, secret_key, (err, user) => {

    console.debug("Decoded: " + err + " " + JSON.stringify(user));

  });

  res.json({ message: signedToken });
});



app.post("/api/firstReg", async (req, res) => {
  const userCount = await ConnectionProvider.GetNumberOfUsers();
  if (userCount == 0) {
    const username = req.body.username;
    const password = req.body.password;
    const displayName = "admin";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await ConnectionProvider.createUser(displayName, username, hashedPassword, salt, "ADMIN");
    res.json({success: true});
  } else {
    res.json({success: false});
  }
});

app.get("/api/usersNb", (req, res) => {
 ConnectionProvider.GetNumberOfUsers().then((usersnb : number) => {
    res.json({usersnb : usersnb})
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


export {app} ;