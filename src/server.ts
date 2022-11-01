import express from 'express';
import http from 'http';
import {resolve} from 'path';
import dotenv from 'dotenv';
import socketIo, { Socket } from 'socket.io' ;
import { DefaultEventsMap } from 'socket.io/dist/typed-events';


dotenv.config();
const port = process.env.PORT;

const app = express();
const server = http.createServer(app);
let io = new socketIo.Server(server);

app.use(express.urlencoded({extended: true}));
app.use(express.static(resolve(__dirname, '..', 'public')));

server.listen(port, ()=>{
    console.log(`Rodando em http://localhost:${port}`);    
});

let connectedUsers:string[] = [];

interface mySocket extends Socket{
    username?: string;
}

io.on('connection', (socket:mySocket)=>{ //Listner de conexão
    socket as mySocket;
    console.log('Socket Conectado...');
    
    socket.on('join-request', (user)=>{
        socket.username = user;
        connectedUsers.push(user);
        console.log(connectedUsers);
        socket.emit('user-ok', connectedUsers);

        socket.broadcast.emit('list-update', {  //Envia para todos exeto o emissor (user)
            joined: user,
            list: connectedUsers,
        });
    });

    socket.on('send-msg', (txt)=>{
        let obj ={
            username: socket.username, 
            message: txt
        }
        //se quiser enviar para sí mesmo socket.emit('show-msg'...
        socket.broadcast.emit('show-msg', obj);
    });

    socket.on('disconnect', ()=>{
        connectedUsers = connectedUsers.filter(u => u != socket.username );
        console.log(connectedUsers);
        
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });
});

