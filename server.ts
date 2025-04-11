/* eslint-disable @typescript-eslint/no-explicit-any */
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config()
// dotenv.config({
// 	path: './.env.local',
// });

const app = express()
app.use(express.json())
app.use(cors({
	origin: process.env.AUTH_URL,
	credentials: true,
}))
const port = process.env.SERVER_PORT || 3519
const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: process.env.AUTH_URL,
		credentials: true,
	}
});

app.get('/', (_: any, res: { send: (arg0: string) => void }) => {
	res.send('<h1>Hello world</h1>');
});

const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected');

  socket.on('join', (userId) => {
    socket.join(userId);
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} joined`);
  });

  socket.on('disconnect', () => {
    for (const [userId, id] of userSockets.entries()) {
      if (id === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log('Socket disconnected');
  });
});

app.post('/notify', (req: any, res: any) => {
	const { userId } = req.body;

	if (!userId) {
		return res.status(400).send('Missing userId or appointment');
	}

	const socketId = userSockets.get(String(userId));
	
	if (socketId) {
		io.to(socketId).emit('appointmentUpdate', 'notify');
		console.log(`Notification sent to user ${userId}`);
	} else {
		console.log(`User ${userId} not connected`);
	}

	res.send('Notification sent');
});	

server.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`)
})