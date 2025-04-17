import express from 'express';
import Message from '../models/Message';

const router = express.Router();

/**
 * Get all messages
 * @route GET /messages
 */
router.get('/messages', async (_req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * Create a new message
 * @route POST /messages
 * @body {userIds, message}
 */
router.post('/messages', async (req, res) => {
  try {
    const { userIds, message } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !message) {
      return res.status(400).json({ error: 'UserIds array and message are required' });
    }

    const newMessage = new Message({
      userIds,
      message,
      timestamp: new Date().toISOString(),
    });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error adding message:', err);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

export default router;
