const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db/mongoose');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/conversationRoutes'));
app.use('/api', require('./routes/messageRoutes'));
app.use('/api', require('./routes/userRoutes'));

app.get('/', (req, res) => {
    res.send('Welcome');
});

// Create and configure server
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const port = process.env.PORT || 2300;

const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
    }
});

const Users = require('./models/users');

let users = [];

io.on('connection', socket => {
    console.log('User connected', socket.id);
    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await Users.findById(senderId);

        console.log('sender :>> ', sender, receiver);

        if (!sender) {
            console.error(`Sender with ID ${senderId} not found`);
            return;
        }

        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            });
        } else {
            io.to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            });
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
});

server.listen(port, () => {
    console.log('listening on port ' + port);
});
