const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const Item = require('../models/item.model');
const User = require('../models/user.model');

// Create or get existing conversation
const createOrGetConversation = async (req, res) => {
  try {
    const { itemId } = req.body;
    const buyerId = req.user.id;

    // Get item details to find seller
    const item = await Item.findById(itemId).populate('user');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const sellerId = item.user._id;

    // Check if buyer is not the seller
    if (buyerId.toString() === sellerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      itemId,
      sellerId,
      buyerId
    }).populate([
      { path: 'itemId', select: 'title price images isAvailable' },
      { path: 'sellerId', select: 'name phoneNumber' },
      { path: 'buyerId', select: 'name phoneNumber' }
    ]);

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        itemId,
        sellerId,
        buyerId,
        lastMessage: `${req.user.name} is interested in your item: ${item.title}`,
        lastMessageAt: new Date()
      });

      await conversation.save();

      // Populate the newly created conversation
      conversation = await Conversation.findById(conversation._id).populate([
        { path: 'itemId', select: 'title price images isAvailable' },
        { path: 'sellerId', select: 'name phoneNumber' },
        { path: 'buyerId', select: 'name phoneNumber' }
      ]);

      // Create a system message for conversation start
      const systemMessage = new Message({
        conversationId: conversation._id,
        senderId: buyerId,
        message: `${req.user.name} is interested in your item: ${item.title}`,
        messageType: 'system',
        systemMessageType: 'join'
      });
      await systemMessage.save();
    }

    res.status(200).json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      $or: [{ sellerId: userId }, { buyerId: userId }],
      isActive: true
    })
    .populate([
      { path: 'itemId', select: 'title price images isAvailable' },
      { path: 'sellerId', select: 'name phoneNumber' },
      { path: 'buyerId', select: 'name phoneNumber' }
    ])
    .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get messages for a specific conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Check if user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [{ sellerId: userId }, { buyerId: userId }]
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date()
          }
        }
      }
    );

    // Update conversation read status
    const updateField = conversation.sellerId.toString() === userId ? 'readStatus.seller' : 'readStatus.buyer';
    await Conversation.findByIdAndUpdate(conversationId, {
      [updateField]: new Date()
    });

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === limit
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const senderId = req.user.id;

    // Check if user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [{ sellerId: senderId }, { buyerId: senderId }]
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Create new message
    const newMessage = new Message({
      conversationId,
      senderId,
      message,
      readBy: [{ userId: senderId, readAt: new Date() }]
    });

    await newMessage.save();

    // Update conversation with last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      lastMessageAt: new Date()
    });

    // Populate sender info
    await newMessage.populate('senderId', 'name');

    res.status(201).json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      $or: [{ sellerId: userId }, { buyerId: userId }],
      isActive: true
    });

    let unreadCount = 0;

    for (const conversation of conversations) {
      const isSellerField = conversation.sellerId.toString() === userId;
      const lastReadTime = isSellerField ? conversation.readStatus.seller : conversation.readStatus.buyer;

      const unreadMessages = await Message.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: userId },
        createdAt: { $gt: lastReadTime }
      });

      unreadCount += unreadMessages;
    }

    res.status(200).json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createOrGetConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  getUnreadCount
}; 