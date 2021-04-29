import { MongoClient, MongoClientOptions } from "mongodb";

export async function init() {
    const dbOptions: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        poolSize: 5,
        connectTimeoutMS: 10000,
        family: 4
    };

    const client = new MongoClient(process.env.MONGO_CONNECTION, dbOptions);
    const connection = await client.connect();

    console.log("[DATABASE]: MongoDB connection successfully opened!");
    return connection.db("data");
}