import express from 'express';
import { addFood, getNearbyFood, claimFood, getDonorListings, updateFoodStatus, getReceiverListings, acceptDelivery, getAllDeliveries, getMyDeliveries, getAvailableDeliveries, markPickedUp, markDelivered, confirmDelivery, editFood, deleteFood } from '../controllers/foodController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addFood);
router.get('/nearby', protect, getNearbyFood);
router.get('/donor', protect, getDonorListings);
router.get('/receiver', protect, getReceiverListings);
router.get('/deliveries', protect, getAllDeliveries);
router.get('/available-deliveries', protect, getAvailableDeliveries);
router.get('/my-deliveries', protect, getMyDeliveries);
router.put('/:id/claim', protect, claimFood);
router.put('/:id/status', protect, updateFoodStatus);
router.post('/accept-delivery/:id', protect, acceptDelivery);
router.patch('/mark-picked/:id', protect, markPickedUp);
router.patch('/mark-delivered/:id', protect, markDelivered);
router.patch('/confirm-delivery/:id', protect, confirmDelivery);

router.put('/:id', protect, editFood);
router.delete('/:id', protect, deleteFood);

export default router;
