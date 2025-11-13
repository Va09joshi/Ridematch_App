const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const chatRoutes = require('./routes/chats');
const Message = require('./models/Message');
require('dotenv').config();


// Routes
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/ride');
const bookingRoutes = require('./routes/booking');


const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);


app.get('/', (req, res) => {
    res.send('Carpool Backend Running');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log(err));

// HTTP + WebSocket Server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // your Flutter app IP if you want to restrict
        methods: ['GET', 'POST']
    }
});

// Store online users
let users = {};

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`✅ User ${userId} registered`);
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, message } = data;
    console.log(`💬 ${senderId} -> ${receiverId}: ${message}`);

    // 1️⃣ Save message to MongoDB
    await Message.create({ senderId, receiverId, message });

    // 2️⃣ Send to receiver if online
    const receiverSocket = users[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('receiveMessage', { senderId, message });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    Object.keys(users).forEach(uid => {
      if (users[uid] === socket.id) delete users[uid];
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running with WebSocket at http://192.168.29.206:${PORT}`);
});
