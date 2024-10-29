// src/backend/server.ts
import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import cors from 'cors';
import bcrypt from "bcrypt";

import Validations from '../validations.tsx';

import jwt from 'jsonwebtoken';
import ConnectionProvider from './dbConnection.ts'
import { TableHeaders } from '../TableHeaders.tsx';
import validations from '../validations.tsx';

import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the build folder (when in production)
app.use(express.static(path.resolve(__dirname, '../../dist')));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3000',
}));


function signToken(username: string) {

  const secret_key = process.env.REACT_APP_WEBTOKEN_ENCRYPTION_KEY;
  if (!secret_key) {
    throw new Error('Cannot find webtoken secret key in the environment');
  }
  return jwt.sign({ username: username }, secret_key, { expiresIn: "7d" });
}

function veryfyToken(token: string | undefined) : string | null {
  if (!token) {
    return null;
  }
  const secret_key = process.env.REACT_APP_WEBTOKEN_ENCRYPTION_KEY;
  if (!secret_key) {
    throw new Error('Cannot find webtoken secret key in the environment');
  }
  let result = jwt.verify(token, secret_key);
  return (result as any).username;
}

app.post('/api/auth', async (req, res) => {
  console.log("Auth request");
  try {
    let userData = await ConnectionProvider.GetUserData(req.body.username);

    if (userData == null) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }
    const hashedPassword = await bcrypt.hash(req.body.password, userData.passwordSalt);
    if (hashedPassword != userData.hashed_password) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }
    // user is authorised now
    const signedToken = signToken(userData.username);
    res.json({ token: signedToken });
  } catch (err) {
    console.error(err);
  }
});



app.post("/api/firstReg", async (req, res) => {
  try {
    const userCount = await ConnectionProvider.GetNumberOfUsers();
    if (userCount == 0) {
      const username = req.body.username;
      const password = req.body.password;
      const displayName = "admin";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await ConnectionProvider.createUser(displayName, username, hashedPassword, salt, "ADMIN");
      const signedToken = signToken(username);
      res.json({ success: true, token: signedToken });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
  }
});

app.post("/api/getData", async (req, res) => {
  try {
    let username = veryfyToken(req.headers.authorization);
    if (!username) {
      return;
    }
    if (req.body == null) {
      res.status(400);
      return;
    }

    if (
      typeof req.body.tableName != 'string' ||
      !Array.isArray(req.body.columnsNames) ||
      !req.body.columnsNames.every((column: any) => typeof column == 'string' && validations.validateUserColumnName(column) == "") ||
      req.body.columnsNames.length == 0
    ) {
      res.status(400);
      return;
    }

    let data = await ConnectionProvider.GetDataFromUserTable(req.body.tableName, req.body.columnsNames);
    
    console.debug(JSON.stringify({ rows: data.slice(0, 1000) }).length);

    if (data == null) {
      res.status(400);
    } else {
      res.json({ rows: data.slice(0, 300) });
    }

  } catch (err) {
    console.error(err);
  }

});

app.get("/api/usersNb", (req, res) => {
  try {
    ConnectionProvider.GetNumberOfUsers().then((usersnb: number) => {
      res.json({ usersnb: usersnb })
    });
  } catch (err) {
    console.error(err);
  }

});

app.post("/api/userTableHeaders", (req, res) => {
  try {
    let username = veryfyToken(req.headers.authorization);
    if (!username) {
      return;
    }

    const tableName = req.body.tableName as string;
    if (tableName == null || Validations.validateTableName(tableName) != "") {
      res.status(400).json({ error: "Invalid table name" });
      return;
    }


    ConnectionProvider.GetUserTableHeaders(tableName).then(headers => {
      if (headers != null) {headers.columns = headers.columns.map((column: any) => ({
        type: column.type,
        name: column.name.toLowerCase()
      }));
      }
      res.json({ headers: headers })
    });
  } catch (err) {
    console.error(err);
  }

});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


export { app };