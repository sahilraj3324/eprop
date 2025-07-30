const mongoose = require('mongoose');

const communityQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 300,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 5000,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: [
      'property-buying',
      'property-selling', 
      'rental',
      'investment',
      'legal',
      'financing',
      'maintenance',
      'technology',
      'general',
      'market-trends'
    ],
    default: 'general',
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: 50,
  }],
  votes: {
    upvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    downvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  voteScore: {
    type: Number,
    default: 0,
  },
  views: {
    count: {
      type: Number,
      default: 0,
    },
    viewedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      viewedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityAnswer',
  }],
  bestAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityAnswer',
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'deleted', 'pending-review'],
    default: 'active',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isAnswered: {
    type: Boolean,
    default: false,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  moderationFlags: [{
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'off-topic', 'duplicate', 'other'],
    },
    description: String,
    flaggedAt: {
      type: Date,
      default: Date.now,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  }],
  attachments: [{
    filename: String,
    url: String,
    type: {
      type: String,
      enum: ['image', 'document'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for efficient queries
communityQuestionSchema.index({ author: 1, createdAt: -1 });
communityQuestionSchema.index({ category: 1, createdAt: -1 });
communityQuestionSchema.index({ voteScore: -1, createdAt: -1 });
communityQuestionSchema.index({ lastActivity: -1 });
communityQuestionSchema.index({ status: 1, createdAt: -1 });
communityQuestionSchema.index({ isPinned: -1, voteScore: -1 });

// Text index for search functionality
communityQuestionSchema.index({ 
  title: 'text', 
  content: 'text',
  tags: 'text'
});

// Compound index for popular questions
communityQuestionSchema.index({ 
  status: 1, 
  voteScore: -1, 
  'views.count': -1, 
  lastActivity: -1 
});

// Virtual for answer count
communityQuestionSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});

// Virtual for net vote score
communityQuestionSchema.virtual('netVotes').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Method to check if user has voted
communityQuestionSchema.methods.getUserVote = function(userId) {
  const upvoteIndex = this.votes.upvotes.findIndex(vote => 
    vote.user.toString() === userId.toString()
  );
  const downvoteIndex = this.votes.downvotes.findIndex(vote => 
    vote.user.toString() === userId.toString()
  );
  
  if (upvoteIndex !== -1) return 'upvote';
  if (downvoteIndex !== -1) return 'downvote';
  return null;
};

// Method to add/remove votes
communityQuestionSchema.methods.toggleVote = function(userId, voteType) {
  const currentVote = this.getUserVote(userId);
  
  // Remove existing votes
  this.votes.upvotes = this.votes.upvotes.filter(vote => 
    vote.user.toString() !== userId.toString()
  );
  this.votes.downvotes = this.votes.downvotes.filter(vote => 
    vote.user.toString() !== userId.toString()
  );
  
  // Add new vote if different from current
  if (currentVote !== voteType) {
    if (voteType === 'upvote') {
      this.votes.upvotes.push({ user: userId });
    } else if (voteType === 'downvote') {
      this.votes.downvotes.push({ user: userId });
    }
  }
  
  // Update vote score
  this.voteScore = this.votes.upvotes.length - this.votes.downvotes.length;
  this.lastActivity = new Date();
};

// Method to increment view count
communityQuestionSchema.methods.incrementView = function(userId) {
  // Check if user has already viewed (within last 24 hours)
  const recentView = this.views.viewedBy.find(view => 
    view.user.toString() === userId.toString() &&
    (Date.now() - view.viewedAt.getTime()) < 24 * 60 * 60 * 1000
  );
  
  if (!recentView) {
    this.views.count += 1;
    this.views.viewedBy.push({ user: userId });
    
    // Keep only last 1000 views to prevent array from growing too large
    if (this.views.viewedBy.length > 1000) {
      this.views.viewedBy = this.views.viewedBy.slice(-1000);
    }
  }
};

// Pre-save middleware to update lastActivity
communityQuestionSchema.pre('save', function(next) {
  if (this.isModified('answers') || this.isModified('votes')) {
    this.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('CommunityQuestion', communityQuestionSchema); 