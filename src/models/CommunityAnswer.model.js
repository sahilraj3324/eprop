const mongoose = require('mongoose');

const communityAnswerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 10000,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityQuestion',
    required: true,
  },
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
  isBestAnswer: {
    type: Boolean,
    default: false,
  },
  isAcceptedByAuthor: {
    type: Boolean,
    default: false,
  },
  comments: [{
    content: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
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
    },
    voteScore: {
      type: Number,
      default: 0,
    },
  }],
  status: {
    type: String,
    enum: ['active', 'deleted', 'pending-review', 'hidden'],
    default: 'active',
  },
  moderationFlags: [{
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'plagiarism', 'low-quality', 'other'],
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
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now,
    },
    reason: String,
  }],
  lastEditedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
communityAnswerSchema.index({ question: 1, createdAt: -1 });
communityAnswerSchema.index({ author: 1, createdAt: -1 });
communityAnswerSchema.index({ voteScore: -1, createdAt: -1 });
communityAnswerSchema.index({ question: 1, voteScore: -1 });
communityAnswerSchema.index({ isBestAnswer: -1, voteScore: -1 });
communityAnswerSchema.index({ status: 1, createdAt: -1 });

// Text index for search functionality
communityAnswerSchema.index({ content: 'text' });

// Virtual for comment count
communityAnswerSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for net vote score
communityAnswerSchema.virtual('netVotes').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Method to check if user has voted on answer
communityAnswerSchema.methods.getUserVote = function(userId) {
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

// Method to toggle vote on answer
communityAnswerSchema.methods.toggleVote = function(userId, voteType) {
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
};

// Method to check if user has voted on comment
communityAnswerSchema.methods.getCommentUserVote = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (!comment) return null;
  
  const upvoteIndex = comment.votes.upvotes.findIndex(vote => 
    vote.user.toString() === userId.toString()
  );
  
  return upvoteIndex !== -1 ? 'upvote' : null;
};

// Method to toggle vote on comment
communityAnswerSchema.methods.toggleCommentVote = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (!comment) return false;
  
  const currentVote = this.getCommentUserVote(commentId, userId);
  
  // Remove existing vote
  comment.votes.upvotes = comment.votes.upvotes.filter(vote => 
    vote.user.toString() !== userId.toString()
  );
  
  // Add vote if not already voted
  if (!currentVote) {
    comment.votes.upvotes.push({ user: userId });
  }
  
  // Update vote score
  comment.voteScore = comment.votes.upvotes.length;
  
  return true;
};

// Method to add comment
communityAnswerSchema.methods.addComment = function(content, authorId) {
  const comment = {
    content,
    author: authorId,
    votes: { upvotes: [] },
    voteScore: 0,
  };
  
  this.comments.push(comment);
  return this.comments[this.comments.length - 1];
};

// Method to mark as best answer
communityAnswerSchema.methods.markAsBestAnswer = function() {
  this.isBestAnswer = true;
  this.isAcceptedByAuthor = true;
};

// Method to save edit history
communityAnswerSchema.methods.saveEdit = function(newContent, reason = '') {
  if (this.content !== newContent) {
    this.editHistory.push({
      content: this.content,
      reason,
    });
    
    this.content = newContent;
    this.lastEditedAt = new Date();
    
    // Keep only last 10 edits
    if (this.editHistory.length > 10) {
      this.editHistory = this.editHistory.slice(-10);
    }
  }
};

// Pre-save middleware to update vote scores
communityAnswerSchema.pre('save', function(next) {
  if (this.isModified('votes')) {
    this.voteScore = this.votes.upvotes.length - this.votes.downvotes.length;
  }
  
  // Update comment vote scores
  this.comments.forEach(comment => {
    comment.voteScore = comment.votes.upvotes.length;
  });
  
  next();
});

module.exports = mongoose.model('CommunityAnswer', communityAnswerSchema); 