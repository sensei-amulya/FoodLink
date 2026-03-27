import express from 'express';
import { analyzeFood, chat } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze-food', protect, analyzeFood);
router.post('/chat', protect, chat);

export default router;
