const http = require('http');
const socketIO = require('socket.io');
const app = require('./app'); // Express app
const session = require('express-session');
const mongoose = require('mongoose');
const ChatMessage = require('./routes/ChatMessage');
mongoose.connect('mongodb://127.0.0.1:27017/pin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

const MongoStore = require('connect-mongo');

const server = http.createServer(app);
const io = socketIO(server);

// Session middleware (same as in app.js)
const sessionMiddleware = session({
  secret: 'hello',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/pin' }),
});
app.use(sessionMiddleware);
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

const usersOnline = new Map();

io.on('connection', (socket) => {
  const userId = socket.request.session?.passport?.user;
  if (!userId) return;

  usersOnline.set(userId, socket.id);
  console.log(`🟢 ${userId} connected`);

  socket.on('send_message', async({ to, message }) => {
    const receiverSocketId = usersOnline.get(to);
    const msg = new ChatMessage({
    sender: userId,
    receiver: to,
    message,
  });

  await msg.save(); 
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        from: userId,
        message,
        timestamp: new Date(),
      });
    }
  });
  
  socket.on('disconnect', () => {
    usersOnline.delete(userId);
    console.log(`🔴 ${userId} disconnected`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
