import express from "express";
import http from 'http';
import { Server } from "socket.io";
import cors from 'cors';
// import { disconnect } from "process";
import path from "path";
import { messageModel } from "./message.schema.js";



const app = express();
app.use(express.static(path.resolve("./public")));

export const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin : '*',
        methods: ['GET', 'POST']
    }
});

let socketsConnected = new Set()

io.on("connect", onConnect)

function onConnect(socket){
    
    socket.on('liveClient', async(data) => {
        const clientInfo = {
            clientId: socket.id,
            userName: data.Username,
            userPic: data.userImage
        };
        socketsConnected.add(clientInfo);
        io.emit('clients-total', Array.from(socketsConnected));
         // Write your code here
         const startTime = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)); // Example: Load messages from the last 24 hours
         const endTime = new Date();
         const previousMessages = await messageModel.find({
             dateTime: { $gte: startTime, $lte: endTime }
         }).sort({ timestamp: 1 }).select('-_id name userImage message dateTime');
 
         // Emit previous messages to the user who joined
         socket.emit("previousMessages", previousMessages);
    });

    socket.on('disconnect', ()=>{
        console.log("Client disconnect by this id-", socket.id);
        // Removing client info from the set
        socketsConnected.forEach(info => {
            console.log("info", info.clientId)
            if(info.clientId == socket.id) {
                socketsConnected.delete(info);
            }
        });
        io.emit('clients-total', Array.from(socketsConnected));
    });

    socket.on('message', (data) => {
        socket.broadcast.emit('chat-message', data);
        
    })

    socket.on('feedback', (data) =>{
        socket.broadcast.emit('feedback', data);
    })

    socket.on("liveClient", (data)=>{
        io.emit("liveClient", data);
    })

    socket.on("sendMessage", async(data)=>{
        await messageModel(data).save();
    })
}

