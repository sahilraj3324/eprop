const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO only for non-production environments
// Vercel serverless doesn't support persistent connections well
let io = null;

if (process.env.NODE_ENV !== 'production') {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // For credentials=true, we must specify exact origins, not wildcard
        // So we'll just allow the requesting origin
        callback(null, origin);
      },
      credentials: true,
      methods: ["GET", "POST"]
    }
  });
}

// Socket.IO connection handling (only for development)
if (io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authenticate user and store userId
    socket.on('authenticate', (userId) => {
      socket.userId = userId;
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
    });

    // Join room for specific conversation
    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle sending messages (real-time broadcast)
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, message, senderId, senderName } = data;
        
        // Save message to database
        const Message = require('./models/message.model');
        const Conversation = require('./models/conversation.model');
        
        const newMessage = new Message({
          conversationId,
          senderId,
          message,
          readBy: [{ userId: senderId, readAt: new Date() }]
        });

        await newMessage.save();
        await newMessage.populate('senderId', 'name');

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message,
          lastMessageAt: new Date()
        });
        
        // Broadcast message to other users in the conversation (not the sender)
        socket.to(conversationId).emit('receive-message', {
          _id: newMessage._id,
          message,
          senderId: {
            _id: senderId,
            name: senderName
          },
          createdAt: newMessage.createdAt,
          conversationId,
          messageType: 'text'
        });
        
        // Send confirmation back to sender
        socket.emit('message-sent', {
          _id: newMessage._id,
          message,
          senderId: {
            _id: senderId,
            name: senderName
          },
          createdAt: newMessage.createdAt,
          conversationId,
          messageType: 'text'
        });
        
      } catch (error) {
        console.error('Error sending message via socket:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle user typing status
    socket.on('typing', (data) => {
      const { conversationId, isTyping, userName } = data;
      socket.to(conversationId).emit('user-typing', { isTyping, userName });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

// Make io available to other modules (if it exists)
if (io) {
  module.exports.io = io;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel - Export the Express app for serverless compatibility
module.exports = app; 