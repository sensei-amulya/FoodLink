import express from 'express';
import { addFood, getNearbyFood, claimFood, getDonorListings, updateFoodStatus, getReceiverListings } from '../controllers/foodController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addFood);
router.get('/nearby', protect, getNearbyFood);
router.get('/donor', protect, getDonorListings);
router.get('/receiver', protect, getReceiverListings);
router.put('/:id/claim', protect, claimFood);
router.put('/:id/status', protect, updateFoodStatus);

export default router;
