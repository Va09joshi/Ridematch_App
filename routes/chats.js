const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET chat between two users
router.get('/:userA/:userB', async (req, res) => {
  const { userA, userB } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

module.exports = router;
