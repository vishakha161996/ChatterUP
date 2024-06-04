import dotenv from 'dotenv';
dotenv.config();
import { connectToDatabase } from './db.config.js';
import {server} from './server.js'

server.listen(3000, ()=> {
    console.log("Server is Listening at 3000");
    connectToDatabase();
})