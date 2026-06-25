const { MongoClient } = require("mongodb");

let db;

async function connectDB() {

    const client = new MongoClient(
        process.env.MONGO_URI
    );

    await client.connect();

    db = client.db(
        process.env.DB_NAME
    );

    console.log("MongoDB Connected");
}

function getDB() {
    return db;
}

module.exports = {
    connectDB,
    getDB
};