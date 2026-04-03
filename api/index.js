import express from 'express';
const app = express();
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import likeRoutes from './routes/likes.js';
import relationshipRoutes from './routes/relationships.js';
import notificationRoutes from './routes/notifications.js';
import commentLikeRoutes from './routes/commentLikes.js';
import messageRoutes from './routes/messages.js';
import statusRoutes from './routes/statuses.js';
import { db } from './connect.js';
import { setIO, registerUserSocket, removeSocket } from './socket.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';

// Middlewares
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Credentials", true);
    next();
})
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
}));
app.use(cookieParser());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../frontend/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});


app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/likes', likeRoutes)
app.use('/api/relationships', relationshipRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/comment-likes', commentLikeRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/statuses', statusRoutes)

const ensureMessagesTable = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      senderId INT NOT NULL,
      receiverId INT NOT NULL,
      text TEXT NOT NULL,
      createdAt DATETIME NOT NULL,
      INDEX idx_messages_sender_receiver (senderId, receiverId),
      INDEX idx_messages_created_at (createdAt)
    )
  `;

  db.query(q, (err) => {
    if (err) {
      console.error('Failed to ensure messages table:', err);
      return;
    }
    console.log('Messages table ready');
  });
};

const ensureStatusesTable = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS statuses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      img VARCHAR(255) NOT NULL,
      createdAt DATETIME NOT NULL,
      expiresAt DATETIME NOT NULL,
      INDEX idx_statuses_user (userId),
      INDEX idx_statuses_expires (expiresAt)
    )
  `;

  db.query(q, (err) => {
    if (err) {
      console.error('Failed to ensure statuses table:', err);
      return;
    }
    console.log('Statuses table ready');
  });
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

setIO(io);

io.on('connection', (socket) => {
  socket.on('register_user', (userId) => {
    registerUserSocket(userId, socket.id);
  });

  socket.on('disconnect', () => {
    removeSocket(socket.id);
  });
});

server.listen(8800, ()=>{
    ensureMessagesTable();
  ensureStatusesTable();
    console.log("API working!")
})