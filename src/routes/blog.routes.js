const express = require('express');
const Blog = require('../models/Blog.model');
const mongoose = require('mongoose');

const router = express.Router();

// CREATE - Post a new blog
router.post('/', async (req, res) => {
  const { title, description, author, content, imageUrl, exampleCode, code } = req.body;
  try {
    const blog = new Blog({
      title,
      description,
      author,
      content,
      image: imageUrl,
      exampleCode,
      code
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: 'Error creating blog', error: error.message });
  }
});

// UPDATE - Update an existing blog
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, author, content, imageUrl, exampleCode, code } = req.body;

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (author !== undefined) updateData.author = author;
    if (content !== undefined) updateData.content = content;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (exampleCode !== undefined) updateData.exampleCode = exampleCode;
    if (code !== undefined) updateData.code = code;

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
});

// DELETE - Delete a blog
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog deleted successfully', deletedBlog });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
});

// READ - Get blogs (all or by ID)
router.get('/', async (req, res) => {
  const { id } = req.query;
  
  try {
    if (id) {
      // Get single blog by ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid blog ID format' });
      }
      
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      return res.status(200).json(blog);
    }
    
    // Get all blogs
    const blogs = await Blog.find().sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
});

module.exports = router;
