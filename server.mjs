import { createServer } from 'http';
import next from 'next';
// import { NextServer } from 'next/dist/server/next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production'; // Use `production` to check if it's production
const hostname = "localhost";
const port = process.env.PORT || 3000;


const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export const startServer = async () => {
    await app.prepare();

    const httpServer = createServer(handler);// Use the Next.js handler to serve requests


    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "http://localhost:3000",
 
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    const emailToSocketId = new Map();
    const socketToEmail = new Map();

    // Socket.io connection handling
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        
        socket.on('room:join', (data) => {
            const { emailId ,roomId ,name,image, callingTo} = data;
            const existingSocketId = emailToSocketId.get(emailId);
            if (existingSocketId) {
                socketToEmail.delete(existingSocketId);
                emailToSocketId.delete(emailId);
            }
            emailToSocketId.set(emailId, socket.id);
            socketToEmail.set(socket.id, emailId);
            io.to(roomId).emit("user:joined",{emailId,id:socket.id});
            socket.join(roomId);
            io.to(socket.id).emit("room:join", data)
            io.emit('incomming:toast', {emailId,callingTo,name,image})

        })

        socket.on('user:call',(data) => {
            const { to ,offer} = data;
            console.log('Incomming Call',to,offer);
            io.to(to).emit('incomming:call', { from: socket.id, offer });
        })

        socket.on("call:accepted", (data) => {
            const { to, ans } = data;
            io.to(to).emit("call:accepted", { from: socket.id, ans });
          });

        socket.on("peer:nego:needed", (data) => {
            const { to, offer } = data
            console.log("peer:nego:needed", offer);
            io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
          });
        
        socket.on("peer:nego:done", (data) => {
            const { to, ans } = data
            console.log("peer:nego:done", ans);
            io.to(to).emit("peer:nego:final", { from: socket.id, ans });
          });

        socket.on("call:end", ({ to }) => {
            console.log("Forwarding call:end to:", to);
            socket.to(to).emit("call:end");
          });
        
          socket.on("call:reject", ({ to, reason }) => {
            console.log("call:reject received for:", to);
            const callerSocketId = emailToSocketId.get(to);
        
            if (callerSocketId) {
                console.log(`Notifying caller (${callerSocketId}) of rejection.`);
                io.to(callerSocketId).emit("call:rejected", { reason });
            } else {
                console.log("Caller not found or not connected.");
            }
        });
        
        socket.on('video:toggle', ({ to, isEnabled }) => {
            console.log(`Video toggle received: ${isEnabled} for ${to}`);
            io.to(to).emit('video:toggle', { isEnabled });
          });
            
        
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        })
    });

    httpServer.once("error", (err) => {
        console.log(err);
        process.exit(1)
    }).listen(port, () => {
        console.log('Server running on http://localhost:3000');
    });
};

startServer().catch((err) => {
    console.error('Error starting server:', err);
});
