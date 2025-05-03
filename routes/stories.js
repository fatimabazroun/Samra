// routes/stories.js

const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// Route to get all stories
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to fetch stories.' });
  }
});

// Route to create a new story
router.post('/', async (req, res) => {
  try {
    const newStory = new Story(req.body);
    await newStory.save();
    res.status(201).json(newStory);
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to create story.' });
  }
});

module.exports = router;