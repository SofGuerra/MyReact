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

app.get('/api/status', async (req, res) => {
  try {
    const username = veryfyToken(req.headers.authorization);
    if (username == null) {
      res.json({ isAdmin: false });
      return;
    }
    let userData = await ConnectionProvider.GetUserData(username);
    res.json({ isAdmin: userData?.type == "ADMIN", username: username, name: userData?.name });
  } catch (err) {
    res.status(500);
    console.error(err);
  }
})

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
    res.json({ token: signedToken, isAdmin: userData.type.toUpperCase() == "ADMIN" });
  } catch (err) {
    console.error(err);
  }
});

async function createUser(name: string, username: string, password: string, type: "ADMIN" | "NORMAL") : Promise<string | null> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  await ConnectionProvider.createUser(name, username, hashedPassword, salt, type);
  const signedToken = signToken(username);
  return signedToken;
}

app.post("/api/register", async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let type = req.body.type;
    let name = req.body.name;
    const userCount = await ConnectionProvider.GetNumberOfUsers();
    if (userCount == 0) {
      type = "ADMIN";
      name = username;
    } else {
      const request_username = veryfyToken(req.headers.authorization);
      if (request_username == null) {
        res.sendStatus(403);
        return;
      }
      if (!await ConnectionProvider.HasAdminPermissions(request_username)) {
        res.sendStatus(403);
        return;
      }
    }

    // check if the user already exists
    let userData = await ConnectionProvider.GetUserData(username);
    if (userData != null) {
      res.sendStatus(409);
      console.debug("User with username " + username + " already exists");
      return;
    }
    console.debug("User with username " + username + " does not exist");

    // check if the user already exists
    userData = await ConnectionProvider.GetUserByDisplayName(name);
    if (userData != null) {
      res.sendStatus(409);
      console.debug("User with name " + name + " already exists");
      return;
    }
    console.debug("User with name " + name + " does not exist");

    if (
      validations.validateName(name) != "" ||
      validations.validatePassword(password) != "" ||
      validations.validateUsername(username) != "" ||
      validations.validateUserType(type) != ""
    )
    {
      res.sendStatus(409);
      return;
    }

    const signedToken = await createUser(name, username, password, type);
    res.json({token: signedToken });
  } catch (err) {
    console.error(err);
    res.status(500);
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
    res.status(500);
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

app.get("/api/agents" , async (req, res) => {
  try {
    let username = veryfyToken(req.headers.authorization);
    if (!username) {
      res.status(401);
      return;
    }
    if (! await ConnectionProvider.HasAdminPermissions(username)) {
      res.status(403);
      return;
    }
    
    let agents = await ConnectionProvider.GetAgents();
    res.json({ agents: agents });
  } catch (err) {
    res.status(401);
    console.error(err);
  }
});

app.post("/api/removeAgents", async (req, res) => {
  try {
    let username = veryfyToken(req.headers.authorization);
    if (!username) {
      res.status(401);
      return;
    } 
    if (! await ConnectionProvider.HasAdminPermissions(username)) {
      res.status(403);
      return;
    }

    if (req.body == null) {
      res.status(400).json({ error: "Body is empty" });
      return;
    }
    if (!Array.isArray(req.body.agents)) {
      res.status(400).json({ error: "Invalid agents array" });
      return;
    }

    // validate agents (all valid string usernames)
    for (let agent of req.body.agents) {
      if (Validations.validateUsername(agent) != "") {
        res.status(400).json({ error: "Invalid agent username: " + agent });
        return;
      }
    }

    let agents = req.body.agents;
    let success = await ConnectionProvider.RemoveAgents(agents);

    if (success) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch (err) {
    res.status(500);
    console.error(err);
  }
});

app.post("/api/updateAgent", async (req, res) => {
  try {
    let username = veryfyToken(req.headers.authorization);
    if (!username) {
      res.status(401);
      return;
    } 
    if (! await ConnectionProvider.HasAdminPermissions(username)) {
      res.status(403);
      return;
    }

    if (req.body == null) {
      res.status(400).json({ error: "Body is empty" });
      return;
    }
    if (Validations.validateUsername(req.body.oldUsername) != "") {
      res.status(400).json({ error: "Invalid agent username: " + req.body.oldUsername });
      return;
    }
    if (Validations.validateUsername(req.body.newUsername) != "") {
      res.status(400).json({ error: "Invalid agent username: " + req.body.newUsername });
      return;
    }
    if (Validations.validateName(req.body.newName) != "") {
      res.status(400).json({ error: "Invalid agent name: " + req.body.newName });
      return;
    }
    if (Validations.validateUserType(req.body.newType) != "") {
      res.status(400).json({ error: "Invalid agent type: " + req.body.newType });
      return;
    }
    const result = await ConnectionProvider.UpdateAgent(
      req.body.oldUsername,
      req.body.newUsername,
      req.body.newName,
      req.body.newType)

    if (result) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch (err) {
    res.status(500);
    console.error(err);
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


export { app };