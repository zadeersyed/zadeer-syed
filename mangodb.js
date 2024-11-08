const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection string
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = 'registrationDB';
let db;

async function connectToDatabase() {
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
}

module.exports = { connectToDatabase, getDb: () => db }; // Export a function to get the db
