// src/backend/server.ts
import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import cors from 'cors';
import bcrypt from "bcrypt";

import Papa from 'papaparse';
import multer from 'multer';

import Validations from '../validations.tsx';

import jwt from 'jsonwebtoken';
import ConnectionProvider from './dbConnection.ts'
import { TableHeaders } from '../TableHeaders.tsx';
import validations from '../validations.tsx';

import csv from 'csv-parser';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' }); // 'uploads/' is the directory where files will be stored

const port = process.env.PORT || 5000;

// Serve static files from the build folder (when in production)
app.use(express.static(path.resolve(__dirname, '../../dist')));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3000',
}));


function signToken(userId: number) {

  const secret_key = process.env.REACT_APP_WEBTOKEN_ENCRYPTION_KEY;
  if (!secret_key) {
    throw new Error('Cannot find webtoken secret key in the environment');
  }
  return jwt.sign({ userId: userId }, secret_key, { expiresIn: "7d" });
}

function veryfyToken(token: string | undefined) : number | null {
  if (!token) {
    return null;
  }
  const secret_key = process.env.REACT_APP_WEBTOKEN_ENCRYPTION_KEY;
  if (!secret_key) {
    throw new Error('Cannot find webtoken secret key in the environment');
  }
  let result = jwt.verify(token, secret_key);
  return (result as any).userId;
}

app.get('/api/status', async (req, res) => {
  try {
    const userId = veryfyToken(req.headers.authorization);
    if (userId == null) {
      res.json({ isAdmin: false });
      return;
    }
    let userData = await ConnectionProvider.GetUserData(userId);
    res.json({ isAdmin: userData?.type == "ADMIN", userId: userId, username: userData?.username, name: userData?.name });
  } catch (err) {
    res.status(500);
    console.error(err);
  }
})

app.post('/api/auth', async (req, res) => {
  console.log("Auth request");
  try {
    let userData = await ConnectionProvider.GetUsersByUsername(req.body.username);
    if (userData == null) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    for (let user of userData) {
      const hashedPasswordInput = await bcrypt.hash(req.body.password, user.passwordSalt);
      if (user.hashed_password == hashedPasswordInput) {
        const token = signToken(user.id);
        res.json({ token: token, isAdmin: user.type.toUpperCase() == "ADMIN" });
        return;
      };
    }
  } catch (err) {
    console.error(err);
  }
});

async function createUser(name: string, username: string, password: string, type: "ADMIN" | "NORMAL") : Promise<string | null> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const createdUserId = await ConnectionProvider.createUser(name, username, hashedPassword, salt, type);
  if (createdUserId == null) return null;
  const signedToken = signToken(createdUserId);
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
    let userId = veryfyToken(req.headers.authorization);
    if (userId == null) {
      res.status(401);
      return;
    }
    

    if (req.body == null) {
      res.status(400);
      return;
    }
    if (
      typeof req.body.tableId != 'number' ||
      !Array.isArray(req.body.columnsIds) ||
      !req.body.columnsIds.every((column: any) => typeof column == 'number')
    ) {
      res.status(400);
      return;
    }


    let data = await ConnectionProvider.GetDataFromUserTable(req.body.tableId, req.body.columnsIds);
    
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
    let userId = veryfyToken(req.headers.authorization);
    if (!userId) {
      return;
    }


    const tableId = req.body.tableId as number;
    if (tableId == null) {
      res.status(400).json({ error: "Invalid table id" });
      return;
    }
    ConnectionProvider.GetUserTableHeaders(tableId).then(headers => {
      if (headers != null) {headers.columns = headers.columns.map((column: any) => ({
        id: column.id,
        type: column.type,
        name: column.name
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
    let userId = veryfyToken(req.headers.authorization);
    if (!userId) {
      res.status(401);
      return;
    }
    if (! await ConnectionProvider.HasAdminPermissions(userId)) {
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
    let userId = veryfyToken(req.headers.authorization);
    if (!userId) {
      res.status(401);
      return;
    } 
    if (! await ConnectionProvider.HasAdminPermissions(userId)) {
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
      if (typeof(agent) != "number") {
        res.status(400).json({ error: "Invalid agent id: " + agent });
        return;
      }
    }
    let success = await ConnectionProvider.RemoveAgents(req.body.agents);

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
    let userId = veryfyToken(req.headers.authorization);
    if (!userId) {
      res.status(401);
      return;
    } 
    if (! await ConnectionProvider.HasAdminPermissions(userId)) {
      res.status(403);
      return;
    }

    if (req.body == null) {
      res.status(400).json({ error: "Body is empty" });
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
      req.body.id,
      req.body.newUsername,
      req.body.newName,
      req.body.newType
    );
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



const readCSVFile = async (filePath: string): Promise<any[][]> => {
  const fileStream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    const results: any[][] = [];

    Papa.parse(fileStream, {
      header: false, // Ensures the output is raw rows as lists
      skipEmptyLines: true, // Skips any empty lines in the file
      complete: (parsedData) => {
        results.push(...parsedData.data as any[]); // Spread parsed rows into the results
        resolve(results);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

app.post("/api/upload", upload.single('file'), async (req, res) => {
  try {
    let userId = veryfyToken(req.headers.authorization);
    if (!userId) {
      res.status(401);
      return;
    } 
    if (!req.file) return;
    const rows = await readCSVFile(req.file.path);
    const tableName = req.body.tableName as string;
    const distributed = req.body.distributed == "true";
    const createHeaders = req.body.createHeaders == "true";


    let errorMessage = Validations.validateTableName(tableName);
    if (errorMessage != "") {
      throw new Error(errorMessage);
    }
    
    const tableCreationResult = ConnectionProvider.CreateUserTable(tableName);
    
    const userColumnsNumber = rows.reduce((acc, row) => Math.max(acc, row.length), 0);

    let userColumns: string[] = [];
    if (createHeaders) {
      for (let i = 0; i < userColumnsNumber; i++) {
        userColumns.push(`Column ${i + 1}`);
      }
    } else {
      userColumns = rows.shift()?.map((row) => row as string) ?? [];
    }

    for (let i = userColumns.length; i < userColumnsNumber; i++) {
      userColumns.push(`Column ${i + 1}`);
    }

    for (let i = 0; i < userColumns.length; i++) {
      if (userColumns[i] == null || userColumns[i] == "") {
        userColumns[i] = `Column ${i + 1}`;
      }
    }

    const createdTableId = await tableCreationResult;
    if (createdTableId == null) {
      throw new Error("Cannot create the table");
    }

    let promises: Promise<number | null>[] = [];
    for (let i = 0; i < userColumns.length; i++) {
      let promise = ConnectionProvider.CreateUserTableColumn(createdTableId, userColumns[i], "string");
      promises.push(promise);
    }
    let userColumnsIds: number[] = [];
    for (let i = 0; i < userColumns.length; i++) {
      const createdColumnId = await promises[i];
      if (createdColumnId == null) throw new Error("Cannot create the column");
      userColumnsIds.push(createdColumnId);
    }
    
    promises = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const pairs: Map<number, string> = new Map();
      for (let j = 0; j < userColumnsNumber; j++) {
        if (j >= row.length)
        {
          pairs.set(userColumnsIds[j], "\'\'");
        } else 
        {
          pairs.set(userColumnsIds[j], "'" + row[j] + "'");
        }
      }
      await ConnectionProvider.InsertIntoTable(createdTableId, pairs);
    }
    


    res.json({ tableId: createdTableId });
  } catch (err) {
    res.status(500);
    console.error(err);
  }
});

app.get('/api/user-tables', async (req, res) => {
  try {
    let userId = veryfyToken(req.headers.authorization);
    if (!userId) {
      res.status(401);
      return;
    }
    let userTables = await ConnectionProvider.GetUserTablesIdsAndNames();
    res.json({ tables: userTables });
    } catch (err) {
      res.status(500);
      console.error(err);
    }
  });
export { app };