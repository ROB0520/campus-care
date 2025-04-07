import mysql from 'mysql2/promise';

const dbConfig = {
	host: process.env.DB_HOST, 
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,       
};

export const createConnection = async () => {
	try {
		const connection = await mysql.createConnection(dbConfig);
		console.log('Database connected successfully');
		return connection;
	} catch (error) {
		console.error('Error connecting to the database:', error);
		throw error;
	}
};

export const createPool = () => {
	try {
		const pool = mysql.createPool(dbConfig);
		console.log('Database pool created successfully');
		return pool;
	} catch (error) {
		console.error('Error creating database pool:', error);
		throw error;
	}
};