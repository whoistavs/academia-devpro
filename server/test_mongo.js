
import { MongoMemoryServer } from 'mongodb-memory-server';

async function test() {
    try {
        console.log("Starting MongoMemoryServer...");
        const mongod = await MongoMemoryServer.create();
        console.log("MongoMemoryServer started at:", mongod.getUri());
        await mongod.stop();
        console.log("MongoMemoryServer stopped.");
    } catch (error) {
        console.error("FATAL ERROR:", error);
    }
}

test();
