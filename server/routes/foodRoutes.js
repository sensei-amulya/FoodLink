import express from 'express';
import { addFood, getNearbyFood, claimFood, getDonorListings, updateFoodStatus, getReceiverListings, acceptDelivery, getAllDeliveries, getMyDeliveries, getAvailableDeliveries, markPickedUp, markDelivered, confirmDelivery, editFood, deleteFood, getCompostAvailable, claimCompost, markCompostCollected, getMyCompostClaims, markExpiredForCompost } from '../controllers/foodController.js';
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

router.get('/compost-available', protect, getCompostAvailable);
router.get('/my-compost', protect, getMyCompostClaims);
router.post('/claim-compost/:id', protect, claimCompost);
router.patch('/mark-collected/:id', protect, markCompostCollected);
router.patch('/mark-expired/:id', protect, markExpiredForCompost);

export default router;
