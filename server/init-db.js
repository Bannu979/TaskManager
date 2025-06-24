const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
    try {
        // Step 1: Connect without database and create DB if not exists
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'bannu979'
        });
        console.log('Connected to MySQL server');

        // Read SQL file
        const sqlFile = await fs.readFile(path.join(__dirname, 'init.sql'), 'utf8');
        const statements = sqlFile.split(';').map(stmt => stmt.trim()).filter(Boolean);

        // Run CREATE DATABASE and USE statements with .query()
        for (let statement of statements) {
            if (statement.toUpperCase().startsWith('CREATE DATABASE')) {
                await connection.query(statement);
                console.log('Executed:', statement.split('\n')[0]);
            }
        }
        await connection.end();

        // Step 2: Connect to the created database
        const dbConnection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'bannu979',
            database: 'task_manager_db'
        });
        console.log('Connected to task_manager_db');

        // Run all other statements except CREATE DATABASE and USE
        for (let statement of statements) {
            if (
                !statement.toUpperCase().startsWith('CREATE DATABASE') &&
                !statement.toUpperCase().startsWith('USE')
            ) {
                await dbConnection.query(statement);
                console.log('Executed:', statement.split('\n')[0]);
            }
        }
        await dbConnection.end();
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase(); 