import sql from 'mssql';
import * as fs from 'fs';
import { ColumnHeaders, TableHeaders } from '../TableHeaders';
import validations from '../validations';

class UserData {
    // Properties based on the table schema
    public id: number;
    name: string;
    username: string;
    hashed_password?: string;        // Optional since it can be undefined
    passwordSalt: string;    // Optional since it can be undefined
    type: 'ADMIN' | 'NORMAL'; // Union type for predefined roles

    constructor(
        id: number,
        name: string,
        username: string,
        type: 'ADMIN' | 'NORMAL',
        hashed_password: string,
        passwordSalt: string
    ) {
        // Validation to ensure constraints are met
        if (!name) throw new Error('Name cannot be empty or null');
        if (!username) throw new Error('Username cannot be empty or null');
        if (!type) throw new Error('Type cannot be empty or null');
        if (type !== 'ADMIN' && type !== 'NORMAL') throw new Error('Type must be either ADMIN or NORMAL');
        this.id = id;
        this.name = name;
        this.username = username;
        this.type = type;
        this.hashed_password = hashed_password;
        this.passwordSalt = passwordSalt;
    }

    // Optional: Add methods for user data management, e.g., to update or validate user details.
}

const config = {
    user: 'sa',
    password: 'sysadm',
    server: 'localhost',
    port: 1433,
    database: 'pargol',
    options: {
      trustServerCertificate: true,
      encrypt: false,
    }
  };

 


class InvalidArgumentException extends Error 
{
}


class ConnectionProvider {
    public static readonly instance : ConnectionProvider = new ConnectionProvider();
    private connection: sql.ConnectionPool | null;
    private constructor() 
    {
        this.connection = null;
    }

    private async createConnectionIfNotExists(): Promise<boolean> {
        if (this.connection == null) {
            try {
                this.connection = await sql.connect(config);
                await this.createTablesIfNotExist();
            } catch (ex) {
                console.log(`${new Date().toLocaleString()} | Cannot establish the connection with sql server.`);
                console.log(ex);
            }
        }
        
        return this.connection != null;
    }

    private async createTablesIfNotExist() {

        let executeCreationStatement = async (query: string, objectName: string) => {
            try {
                await this.connection?.query(query);
            } catch (err) {
                if (err instanceof sql.RequestError && err.code === 'EREQUEST'
                    && err.message.includes(`There is already an object named '${objectName}'`)) {
                } else {
                    throw err;
                }
            }
        }

        let usersTable = `
            CREATE TABLE users  (
                id INT IDENTITY(1,1),
                    CONSTRAINT user_id_pk PRIMARY KEY (id),
                name VARCHAR(64),
                    CONSTRAINT user_name_NE CHECK (name != ''),
                    CONSTRAINT user_name_NN CHECK (name IS NOT NULL),
                    CONSTRAINT user_name_UNIQUE UNIQUE (name),
                username VARCHAR(32),
                    CONSTRAINT user_username_NE CHECK (username != ''),
                    CONSTRAINT user_username_NN CHECK (username IS NOT NULL),
                    CONSTRAINT user_username_UNIQUE UNIQUE (username),
                password VARCHAR(255),
                password_salt VARCHAR(255),
                type VARCHAR(32),
                    CONSTRAINT user_type_check CHECK (type = 'ADMIN' OR type = 'NORMAL')
            );
        `;
        executeCreationStatement(usersTable, 'users');

        let usersTablesTable = `
            CREATE TABLE users_tables  (
                id INT IDENTITY(1,1),
                table_name VARCHAR(64),
                is_managable BIT NOT NULL,

                CONSTRAINT users_tables_table_name_NE CHECK (table_name != ''),
                CONSTRAINT users_tables_table_name_NN CHECK (table_name IS NOT NULL),
                CONSTRAINT users_tables_pk PRIMARY KEY (id)
            );
        `;
        executeCreationStatement(usersTablesTable, 'users_tables');

        let usersColumnsTable = `
            CREATE TABLE users_columns  (
                id INT IDENTITY(1,1),
                    CONSTRAINT users_columns_pk PRIMARY KEY (id),
                table_id INT,
                column_name VARCHAR(64),
                column_type VARCHAR(64) NOT NULL,
                    CONSTRAINT users_columns_column_name_NE CHECK (column_name != ''),
                    CONSTRAINT users_columns_column_name_NN CHECK (column_name IS NOT NULL)
            );
        `;
        executeCreationStatement(usersColumnsTable, 'users_columns');

        console.debug("Tried to create tables");
    }

    

    public async createUser(name: string, username: string, hashedPassword: string, passwordSalt: string, type: string = "NORMAL") : Promise<number | null>
    {
        if (! await this.createConnectionIfNotExists()) return null;
                
        try {
            const result = await this.connection?.query("INSERT INTO USERS ([name], [username], [password], [password_salt], [type]) OUTPUT INSERTED.id "
                +   `values ('${name}', '${username}', '${hashedPassword}', '${passwordSalt}', '${type}')`
                );
            if (result?.recordset.length == 0) throw new InvalidArgumentException(`Cannot create the user '${name}' in the database`);
            return result?.recordset[0].id;
        }
        catch (err)
        {
            if (err instanceof sql.RequestError && err.code === 'EREQUEST')
            {
                if (err.message.includes("user_type_check")) 
                {
                    throw new InvalidArgumentException("User type should be 'ADMIN' or 'NORMAL'."); 
                } else if (err.message.includes("user_username_pk")) {
                    throw new InvalidArgumentException(`Username is already taken`); 
                } else if (err.message.includes("user_username_NE"))  {
                    throw new InvalidArgumentException(`Username cannot be empty`);
                } else if (err.message.includes("user_name_NE"))  {
                    throw new InvalidArgumentException(`Name cannot be empty`);
                } else if (err.message.includes("user_name_UNIQUE")) {
                    throw new InvalidArgumentException(`Name is already taken`);
                }
            }
            throw err;
        }
    }

    public async GetNumberOfUsers() : Promise<number> {
        if (! await this.createConnectionIfNotExists()) return NaN;
        try {
            let result = await this.connection?.query("SELECT COUNT(*) as user_count FROM USERS");
            return parseInt(result?.recordset[0].user_count); 
        } catch (err) {
            throw err;
        }
    }
    

    public async GetUserTableHeaders(tableId : number) : Promise<any> {
        if (! await this.createConnectionIfNotExists()) return null;

        try {
            const tableNameResult = this.connection?.query(`SELECT table_name FROM users_tables WHERE id = ${tableId}`);
            const columnsResult = await this.connection?.query(`SELECT id, column_name, column_type FROM users_columns WHERE table_id = ${tableId}`);
            let headers = new TableHeaders(tableId);
            columnsResult?.recordset.forEach(row => {
                let columnHeaders = new ColumnHeaders();
                columnHeaders.id = row.id;
                columnHeaders.name = row.column_name;
                columnHeaders.type = row.column_type;
                if (validations.validateUserColumnType(row.column_type) != "") {
                    throw new InvalidArgumentException(`Received wrong column type '${row.column_type}' for the column '${row.column_name}' from the database for the user table '${tableId}'`);
                }
                if (validations.validateUserColumnName(row.column_name) != "") {
                    throw new InvalidArgumentException(`Received wrong column name '${row.column_name}' for the column from the database for the user table '${tableId}'`);
                }
                headers.columns.push(columnHeaders)
            });
            const tableName = (await tableNameResult);
            if (tableName != undefined && tableName.recordset.length > 0 && typeof(tableName.recordset[0].table_name) == "string") {
                headers.tableName = tableName.recordset[0].table_name;
                return headers;
            } else {
                throw new InvalidArgumentException(`Cannot get the name of table '${tableId}'`);
            }
            

        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot get headers of the user table '${tableId}' from the database.`);
            console.log(err);
            return null;
        }

    }

    public async CreateUserTable(tableName: string) : Promise<number | null> {
        if (! await this.createConnectionIfNotExists()) return null;
        try {
            if (validations.validateTableName(tableName) != "") {
                throw new InvalidArgumentException(`Received wrong table name '${tableName}'`);
            }
            const result = await this.connection?.query(`INSERT INTO users_tables (table_name, is_managable) OUTPUT INSERTED.id VALUES ('${tableName}', 0);`);
            if (result?.recordset.length == 0) throw new InvalidArgumentException(`Cannot create the user table '${tableName}' in the database`);
            if (result?.recordset[0].id == undefined) throw new InvalidArgumentException(`Cannot create the user table '${tableName}' in the database`);
            await this.connection?.query(`CREATE TABLE ____${result?.recordset[0].id} (id INT IDENTITY(1,1));`);
            return result?.recordset[0].id;
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot create the user table '${tableName}' in the database.`);
            console.log(err);
            return null;
        }
    }

    public async InsertIntoTable(tableId: number, pairsColumnIdAndFormattedSqlValue: Map<number, string>) : Promise<number | null> {
        const columnsSql = Array.from(pairsColumnIdAndFormattedSqlValue.keys()).map((key) => `____${key}`).join(", ");
        const valuesSql = Array.from(pairsColumnIdAndFormattedSqlValue.values()).map((value) => `${value}`).join(", ");
        if (! await this.createConnectionIfNotExists()) return null;
        try {
            const result = await this.connection?.query(`INSERT INTO ____${tableId} (${columnsSql}) OUTPUT INSERTED.id VALUES (${valuesSql});`);
            return result?.recordset[0].id;
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot insert into the user table '${tableId}' in the database.`);
            console.log(err);
            console.debug("Request: " + `INSERT INTO ____${tableId} (${columnsSql}) OUTPUT INSERTED.id VALUES (${valuesSql});`);
            return null;
        }
    }

    private static convertColumnTypeToSql(columnType: string) : string {
        switch (columnType.toLowerCase()) {
            case "number":
                return "DECIMAL";
            case "string":
                return "VARCHAR(255)";
            case "date":
                return "DATE";
        }
        return "unknown column type";
    }

    public async CreateUserTableColumn(tableId: number, columnName: string, columnType: string) {
        if (! await this.createConnectionIfNotExists()) return null;
        try {
            if (validations.validateUserColumnName(columnName) != "") {
                throw new InvalidArgumentException(`Received wrong column name '${columnName}'`);
            }
            if (validations.validateUserColumnType(columnType) != "") {
                throw new InvalidArgumentException(`Received wrong column type '${columnType}'`);
            }
            const tableExistanceCheck = await this.connection?.query(`SELECT * FROM users_tables WHERE id = '${tableId}'`);
            if (tableExistanceCheck?.recordset.length == 0) throw new InvalidArgumentException(`Cannot find the user table '${tableId}' in the database`);
            const insertion = await this.connection?.query(`INSERT INTO users_columns (table_id, column_name, column_type) OUTPUT INSERTED.id VALUES ('${tableId}', '${columnName}', '${columnType}');`);
            if (insertion?.recordset.length == 0) throw new InvalidArgumentException(`Cannot create the column '${columnName}' in the user table '${tableId}' in the database`);
            const newColumnId = insertion?.recordset[0].id;
            if (newColumnId == undefined) throw new InvalidArgumentException(`Cannot create the column '${columnName}' in the user table '${tableId}' in the database`);
            await this.connection?.query(`ALTER TABLE ____${tableId} ADD ____${newColumnId} ${ConnectionProvider.convertColumnTypeToSql(columnType)};`);
            return newColumnId;
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot create the column '${columnName}' in the user table '${tableId}' in the database.`);
            console.log(err);
            return null;
        }
    }

    public async GetDataFromUserTable(tableId: number, columnsIds: number[]) : Promise<any> {
        if (! await this.createConnectionIfNotExists()) return null;
        try {
            let headers = await this.GetUserTableHeaders(tableId);
            if (headers == null) return null;

            // Will look like `id, [____0], [____11]` for a list of columns with ids [0, 11]
            let columnsNamesRequest = "id, ";
            columnsIds.forEach(columnId => columnsNamesRequest += "[____" + columnId + "], ");
            columnsNamesRequest = columnsNamesRequest.slice(0, columnsNamesRequest.length - 2);

            let request = `SELECT ${columnsNamesRequest} from [____${tableId}]`;
            let queryResult = await this.connection?.query(request);
            if (queryResult == undefined) throw new InvalidArgumentException(`Cannot get columns ${columnsIds} of the user table '${tableId}' from the database`);
            const resultList : any[] = [];
            queryResult.recordset.forEach((row: any) => {
                const rowObject : any = {"id": row.id};
                columnsIds.forEach((columnId: number) => {
                    rowObject[columnId] = row["____" + columnId];
                })
                resultList.push(rowObject);
            });
            return resultList;
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot get columns ${columnsIds} of the user table '${tableId}' from the database.`);
            console.log(err);
            return null;
        }
    }

    public async GetUserTablesIdsAndNames() : Promise<any> {
        if (! await this.createConnectionIfNotExists()) return null;
        try {
            const result = await this.connection?.query(`SELECT id, table_name FROM users_tables;`);
            return result?.recordset || [];
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot get user tables from the database.`);
            console.log(err);
            return null;
        }
    }

    public async GetUserData(userId: number) : Promise<UserData | null> {
        if (! await this.createConnectionIfNotExists()) return null;
        try {
            const result1 = await this.connection?.query(`SELECT name, username, password, password_salt, type FROM users WHERE id = '${userId}';`);
            if (result1?.recordset.length == 0) {
                return null;
            }
            const result = result1?.recordset[0];
            return new UserData(userId, result.name, result.username, result.type, result.password, result.password_salt);
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot get user data of the user '${userId}' from the database.`);
            console.log(err);
            return null;
        }
    }

    public async GetUsersByUsername(username: string) : Promise<UserData[] | null> {
        if (! await this.createConnectionIfNotExists()) return null;
        try {
            const result1 = await this.connection?.query(`SELECT id, name, username, password, password_salt, type FROM users WHERE username = '${username}';`);
            if (result1?.recordset.length == 0) {
                return null;
            }
            const result = result1?.recordset;
            if (result == undefined) throw new InvalidArgumentException(`Cannot get users with username '${username}' from the database`); 
            return result.map(row => new UserData(row.id, row.name, row.username, row.type, row.password, row.password_salt));
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot get user data of the user '${username}' from the database.`);
            console.log(err);
            return null;
        }
    }


    public async GetUserByDisplayName(displayName: string) : Promise<UserData | null> {
        if (! await this.createConnectionIfNotExists()) return null;
        try {
            if (validations.validateName(displayName) != "")
            {
                throw new InvalidArgumentException(`Received wrong display name '${displayName}'`);         
            }
            const result1 = await this.connection?.query(`SELECT id, name, username, password, password_salt, type FROM users WHERE name = '${displayName}';`);
            if (result1?.recordset.length == 0) {
                return null;
            }
            const result = result1?.recordset[0];
            return new UserData(result.id, result.name, result.username, result.type, result.password, result.password_salt);
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot get user data of the user '${displayName}' from the database.`);
            console.log(err);
            return null;
        }
    }

    public async HasAdminPermissions(userId: number) : Promise<boolean> {
        if (! await this.createConnectionIfNotExists()) return false;
        try {
            const result = await this.connection?.query(`SELECT * FROM users WHERE id = '${userId}' AND type = 'admin';`);
            if (result?.recordset) {
                return result?.recordset.length > 0;
            } else {
                return false;
            }
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot get user data of the user '${userId}' from the database.`);
            console.log(err);
            return false;
        }
    }

    public async GetAgents() : Promise<any> {
        if (! await this.createConnectionIfNotExists()) return null;
        try {
            const result = await this.connection?.query(`SELECT name, username, type FROM users;`);
            return result?.recordset || [];
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot get agents from the database.`);
            console.log(err);
            return null;
        }
    }

    public async RemoveAgents(agents: number[]) : Promise<boolean> { 
        if (! await this.createConnectionIfNotExists()) return false;
        let usernames = agents.map(a => `'${a}'`).join(", ");
        try {
            const result = await this.connection?.query(`DELETE FROM users WHERE id IN (${usernames});`);
            return true;
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot remove agents from the database.`);
            console.log(err);
            return false;
        }
    }

    /*
    public async distribute_clients(tableName: string, clientsSortingPredicate: (a: any, b: any) => number ) : Promise<any> {
        if (! await this.createConnectionIfNotExists()) return false;

        if (validations.validateTableName(tableName) != "") {
            return false;
        }
        try { 
            const resultAgents = this.connection?.query(`SELECT username FROM users `);
            const resultClients = this.connection?.query(`SELECT id FROM [${tableName}] where agent is null`);
            
            const agents = (await resultAgents)?.recordset;
            const clients = (await resultAgents)?.recordset;
            
            if (agents == undefined || clients == undefined) {
                return false;
            }

            clients.sort(clientsSortingPredicate);

            let nextChosenAgentIndex = 0;
            for (let client of clients) {
                const undistributedId : number = client.id;
                this.connection?.query(`UPDATE [${tableName}] SET agent = '${agents[nextChosenAgentIndex].username}' WHERE id = ${undistributedId}`);
                nextChosenAgentIndex += 1;
                if (nextChosenAgentIndex == agents.length)
                {
                    nextChosenAgentIndex = 0;   
                }
            }
            
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot get clients from the database.`);
            console.log(err);
            return null;
        }


    }
            */

    public async UpdateAgent(userId: number, newUsername: string, newName: string, newType: string) : Promise<boolean> {
        if (! await this.createConnectionIfNotExists()) return false;
        // validate
        if (validations.validateUsername(newUsername) != "") {
            return false;
        }
        if (validations.validateName(newName) != "") {
            return false;
        }
        if (validations.validateUserType(newType) != "") {
            return false;
        }
        try {
            const result = await this.connection?.query(`UPDATE users SET username = '${newUsername}', name = '${newName}', type = '${newType}' WHERE id = '${userId}';`);
            return true;
        } catch (err) {
            console.log(`${new Date().toLocaleString()} | Cannot update agent '${userId}' in the database.`);
            console.log(err);
            return false;
        }
    }

}

export default ConnectionProvider.instance