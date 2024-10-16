import sql from 'mssql';
import * as fs from 'fs';
/*

var TestConfig = {  
    server: 'localhost',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'sa', //update me
            password: 'sysadm'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: false,
        database: 'pargol',  //update me
        port: 1433,
    }
};  
var connection = new TestConn(TestConfig);  
connection.on('connect', function(err) {  
    executeStatement();
    
});

connection.connect();

var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;  

function executeStatement() {  
    var request = new Request("SELECT * from [CASTIGO AGOSTO 2024]", function(err) {  
    if (err) {  
        console.log(err);}  
    });  
    var result = "";  
    request.on('row', function(columns) {  
        columns.forEach(function(column) {  
          if (column.value === null) {  
            console.log('NULL');  
          } else {  
            result+= column.value + " ";  
          }  
        });  
        console.log(result);  
        result ="";  
    });  

    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        connection.close();
    });
    connection.execSql(request);  
}  

*/

const config = {
    user: 'sa',
    password: 'sysadm',
    server: 'localhost',
    port: 1433,
    database: 'pargol',
    options: {
      trustServerCertificate: true,
      encrypt: true,
    }
  };

class InvalidArgumentException extends Error {
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
                password VARCHAR(255),                    -- Password for hashed passwords, using 255 characters for safety
                type VARCHAR(32),
                    CONSTRAINT user_type_check CHECK (type = 'ADMIN' OR type = 'NORMAL')
            );
        `;
        
        try {
            await this.connection?.query(usersTable);
        } catch (err) {
            if (err instanceof sql.RequestError && err.code === 'EREQUEST'
                && err.message.includes("There is already an object named 'users'")) {
            } else {
                throw err;
            }
        }
        
    }

    public async createUser(name: string, username: string, hashedPassword: string, type: string = "NORMAL")
    {
        if (! await this.createConnectionIfNotExists()) return;
                
        try {

            await this.connection?.query("INSERT INTO USERS ([name], [username], [password], [type]) "
                +   `values ('${name}', '${username}', '${hashedPassword}', '${type}')`
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

}

export default ConnectionProvider.instance