import mongoose from "mongoose";

const dbCache = new Map();

export const getDbConnection = async (dbName) => {
    if (dbCache.has(dbName)) {
        return dbCache.get(dbName);
    }
    const DB_URL = process.env.DB_URL.replace('npk_interior', dbName);
    const connection = await mongoose.createConnection(DB_URL).asPromise();
    dbCache.set(dbName, connection);
    return connection;
};

export const getModel = (connection, name, schema) => {
    return connection.models[name] || connection.model(name, schema);
};

export const closeDbConnection = (connection) => {
    for (let [dbName, conn] of dbCache.entries()) {
        if (conn === connection) {
            dbCache.delete(dbName); // Remove from cache
            break;
        }
    }
    connection.close();
};
