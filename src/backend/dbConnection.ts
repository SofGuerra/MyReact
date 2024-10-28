import sql from 'mssql';
import * as fs from 'fs';


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
                name VARCHAR(64),
                    CONSTRAINT user_name_NE CHECK (name != ''),
                    CONSTRAINT user_name_NN CHECK (name IS NOT NULL),
                    CONSTRAINT user_name_UNIQUE UNIQUE (name),
                username VARCHAR(32),
                    CONSTRAINT user_username_pk PRIMARY KEY (username),
                    CONSTRAINT user_username_NE CHECK (username != ''),
                    CONSTRAINT user_username_NN CHECK (username IS NOT NULL),
                password VARCHAR(255),
                password_salt VARCHAR(255),
                type VARCHAR(32),
                    CONSTRAINT user_type_check CHECK (type = 'ADMIN' OR type = 'NORMAL')
            );
        `;
        executeCreationStatement(usersTable, 'users');

        let usersTablesTable = `
            CREATE TABLE users_tables  (
                table_name VARCHAR(64),
                    CONSTRAINT users_tables_table_name_NE CHECK (table_name != ''),
                    CONSTRAINT users_tables_table_name_NN CHECK (table_name IS NOT NULL),
                    CONSTRAINT users_tables_table_name_pk PRIMARY KEY (table_name)
            );
        `;
        executeCreationStatement(usersTablesTable, 'users_tables');

        let usersColumnsTable = `
            CREATE TABLE users_columns  (
                table_name VARCHAR(64),
                column_name VARCHAR(64),
                column_type VARCHAR(64) NOT NULL,
                    CONSTRAINT users_columns_column_name_NE CHECK (column_name != ''),
                    CONSTRAINT users_columns_column_name_NN CHECK (column_name IS NOT NULL),
                    CONSTRAINT users_columns_pk PRIMARY KEY (table_name, column_name)
            );
        `;
        executeCreationStatement(usersColumnsTable, 'users_columns');

        console.debug("Tables tried to create");
    }

    

    public async createUser(name: string, username: string, hashedPassword: string, passwordSalt: string, type: string = "NORMAL")
    {
        if (! await this.createConnectionIfNotExists()) return;
                
        try {

            await this.connection?.query("INSERT INTO USERS ([name], [username], [password], [password_salt], [type]) "
                +   `values ('${name}', '${username}', '${hashedPassword}', '${passwordSalt}', '${type}')`
                );

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
    
    public async fetchCastigoData(): Promise<any[]> {
        if (!await this.createConnectionIfNotExists()) return [];

        try {
            const result = await this.connection?.query("SELECT * FROM [CASTIGO AGOSTO 2024]");
            return result?.recordset || [];
        } catch (err) {
            console.error("Error fetching CASTIGO AGOSTO 2024 data:", err);
            throw err;
        }
    }

}

export default ConnectionProvider.instance