const CommunityQuestion = require('../models/CommunityQuestion.model');
const CommunityAnswer = require('../models/CommunityAnswer.model');
const User = require('../models/user.model');

// ===== QUESTION OPERATIONS =====

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const authorId = req.user.id;

    const question = await CommunityQuestion.create({
      title,
      content,
      author: authorId,
      category: category || 'general',
      tags: tags || [],
    });

    const populatedQuestion = await CommunityQuestion.findById(question._id)
      .populate('author', 'name profilePic')
      .exec();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: populatedQuestion,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all questions with filtering and pagination
exports.getAllQuestions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      tags, 
      search, 
      sortBy = 'recent',
      status = 'active'
    } = req.query;

    // Build filter object
    const filter = { status };
    if (category && category !== 'all') filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };

    // Add search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Determine sort order
    let sortOption = {};
    switch (sortBy) {
      case 'popular':
        sortOption = { voteScore: -1, 'views.count': -1 };
        break;
      case 'mostAnswered':
        sortOption = { 'answers.length': -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortOption = { isPinned: -1, lastActivity: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const questions = await CommunityQuestion.find(filter)
      .populate('author', 'name profilePic')
      .populate('bestAnswer', 'content author')
      .populate({
        path: 'bestAnswer',
        populate: {
          path: 'author',
          select: 'name profilePic'
        }
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await CommunityQuestion.countDocuments(filter);

    // Add computed fields
    const questionsWithStats = questions.map(question => ({
      ...question,
      answerCount: question.answers.length,
      netVotes: question.votes.upvotes.length - question.votes.downvotes.length,
    }));

    res.json({
      success: true,
      questions: questionsWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQuestions: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get question by ID with answers
exports.getQuestionById = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user.id;

    const question = await CommunityQuestion.findById(questionId)
      .populate('author', 'name profilePic')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'name profilePic'
        }
      })
      .populate({
        path: 'answers',
        populate: {
          path: 'comments.author',
          select: 'name profilePic'
        }
      });

    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }

    // Increment view count
    question.incrementView(userId);
    await question.save();

    // Get answers sorted by votes and best answer first
    const answers = await CommunityAnswer.find({ 
      question: questionId, 
      status: 'active' 
    })
      .populate('author', 'name profilePic')
      .populate('comments.author', 'name profilePic')
      .sort({ isBestAnswer: -1, voteScore: -1, createdAt: -1 });

    // Add user vote information
    const questionWithUserVote = {
      ...question.toJSON(),
      userVote: question.getUserVote(userId),
      netVotes: question.votes.upvotes.length - question.votes.downvotes.length,
    };

    const answersWithUserVotes = answers.map(answer => ({
      ...answer.toJSON(),
      userVote: answer.getUserVote(userId),
      netVotes: answer.votes.upvotes.length - answer.votes.downvotes.length,
      comments: answer.comments.map(comment => ({
        ...comment.toJSON(),
        userVote: answer.getCommentUserVote(comment._id, userId),
      })),
    }));

    res.json({
      success: true,
      question: questionWithUserVote,
      answers: answersWithUserVotes,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Vote on question
exports.voteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;

    const question = await CommunityQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }

    // Prevent author from voting on their own question
    if (question.author.toString() === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot vote on your own question' 
      });
    }

    question.toggleVote(userId, voteType);
    await question.save();

    res.json({
      success: true,
      message: 'Vote updated successfully',
      voteScore: question.voteScore,
      userVote: question.getUserVote(userId),
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    const question = await CommunityQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }

    // Only author can update their question
    if (question.author.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this question' 
      });
    }

    if (title) question.title = title;
    if (content) question.content = content;
    if (tags) question.tags = tags;

    await question.save();

    const updatedQuestion = await CommunityQuestion.findById(questionId)
      .populate('author', 'name profilePic');

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user.id;

    const question = await CommunityQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }

    // Only author or admin can delete
    if (question.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this question' 
      });
    }

    // Soft delete
    question.status = 'deleted';
    await question.save();

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== ANSWER OPERATIONS =====

// Create answer
exports.createAnswer = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const { content } = req.body;
    const authorId = req.user.id;

    const question = await CommunityQuestion.findById(questionId);
    if (!question || question.status !== 'active') {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found or not active' 
      });
    }

    const answer = await CommunityAnswer.create({
      content,
      author: authorId,
      question: questionId,
    });

    // Add answer to question
    question.answers.push(answer._id);
    question.isAnswered = true;
    question.lastActivity = new Date();
    await question.save();

    const populatedAnswer = await CommunityAnswer.findById(answer._id)
      .populate('author', 'name profilePic');

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      answer: populatedAnswer,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Vote on answer
exports.voteAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;
    const { voteType } = req.body;
    const userId = req.user.id;

    const answer = await CommunityAnswer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Answer not found' 
      });
    }

    // Prevent author from voting on their own answer
    if (answer.author.toString() === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot vote on your own answer' 
      });
    }

    answer.toggleVote(userId, voteType);
    await answer.save();

    res.json({
      success: true,
      message: 'Vote updated successfully',
      voteScore: answer.voteScore,
      userVote: answer.getUserVote(userId),
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Mark answer as best answer
exports.markBestAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;
    const userId = req.user.id;

    const answer = await CommunityAnswer.findById(answerId)
      .populate('question');
    
    if (!answer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Answer not found' 
      });
    }

    // Only question author can mark best answer
    if (answer.question.author.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only question author can mark best answer' 
      });
    }

    // Remove best answer status from other answers
    await CommunityAnswer.updateMany(
      { question: answer.question._id },
      { isBestAnswer: false, isAcceptedByAuthor: false }
    );

    // Mark this answer as best
    answer.markAsBestAnswer();
    await answer.save();

    // Update question with best answer
    answer.question.bestAnswer = answerId;
    await answer.question.save();

    res.json({
      success: true,
      message: 'Answer marked as best answer',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add comment to answer
exports.addComment = async (req, res) => {
  try {
    const answerId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;

    const answer = await CommunityAnswer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Answer not found' 
      });
    }

    const comment = answer.addComment(content, userId);
    await answer.save();

    const populatedAnswer = await CommunityAnswer.findById(answerId)
      .populate('comments.author', 'name profilePic');

    const addedComment = populatedAnswer.comments.id(comment._id);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: addedComment,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Vote on comment
exports.voteComment = async (req, res) => {
  try {
    const { answerId, commentId } = req.params;
    const userId = req.user.id;

    const answer = await CommunityAnswer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Answer not found' 
      });
    }

    const success = answer.toggleCommentVote(commentId, userId);
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    await answer.save();

    const comment = answer.comments.id(commentId);

    res.json({
      success: true,
      message: 'Comment vote updated',
      voteScore: comment.voteScore,
      userVote: answer.getCommentUserVote(commentId, userId),
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get community statistics
exports.getCommunityStats = async (req, res) => {
  try {
    const stats = await CommunityQuestion.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          activeQuestions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          answeredQuestions: {
            $sum: { $cond: [{ $eq: ['$isAnswered', true] }, 1, 0] }
          },
          totalViews: { $sum: '$views.count' },
          totalVotes: { $sum: '$voteScore' },
        }
      }
    ]);

    const answerStats = await CommunityAnswer.aggregate([
      {
        $group: {
          _id: null,
          totalAnswers: { $sum: 1 },
          bestAnswers: {
            $sum: { $cond: [{ $eq: ['$isBestAnswer', true] }, 1, 0] }
          },
        }
      }
    ]);

    const categoryStats = await CommunityQuestion.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        ...stats[0],
        ...answerStats[0],
        categoryBreakdown: categoryStats,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get user's questions and answers
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page = 1, limit = 10, type = 'all' } = req.query;

    const skip = (page - 1) * limit;
    let result = {};

    if (type === 'all' || type === 'questions') {
      const questions = await CommunityQuestion.find({ 
        author: userId, 
        status: 'active' 
      })
        .populate('author', 'name profilePic')
        .sort({ createdAt: -1 })
        .skip(type === 'questions' ? skip : 0)
        .limit(type === 'questions' ? parseInt(limit) : 5)
        .lean();

      result.questions = questions.map(q => ({
        ...q,
        answerCount: q.answers.length,
        netVotes: q.votes.upvotes.length - q.votes.downvotes.length,
      }));
    }

    if (type === 'all' || type === 'answers') {
      const answers = await CommunityAnswer.find({ 
        author: userId, 
        status: 'active' 
      })
        .populate('author', 'name profilePic')
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .skip(type === 'answers' ? skip : 0)
        .limit(type === 'answers' ? parseInt(limit) : 5)
        .lean();

      result.answers = answers.map(a => ({
        ...a,
        netVotes: a.votes.upvotes.length - a.votes.downvotes.length,
      }));
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}; 