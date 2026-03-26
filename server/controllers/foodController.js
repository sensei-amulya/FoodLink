import Food from '../models/Food.js';

// @desc    Add a new food item
// @route   POST /api/food
// @access  Private (Donor only)
export const addFood = async (req, res) => {
  try {
    const { name, quantity, longitude, latitude, expiryTime, type, image } = req.body;

    if (req.user.role !== 'Donor' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Donors can add food' });
    }

    const food = await Food.create({
      name,
      quantity,
      type: type || 'veg',
      imageUrl: image,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      expiryTime,
      donorId: req.user._id
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby available food
// @route   GET /api/food/nearby?lng=...&lat=...&distance=...
// @access  Private (Receiver)
export const getNearbyFood = async (req, res) => {
  try {
    const { lng, lat, distance = 5000, type } = req.query; // default 5km

    if (!lng || !lat) {
      return res.status(400).json({ message: 'Please provide longitude and latitude' });
    }

    const query = {
      status: 'Available',
      expiryTime: { $gt: new Date() }, // Only food that hasn't expired
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance)
        }
      }
    };

    if (type && type !== 'all') {
      query.type = type;
    }

    const foodListing = await Food.find(query).populate('donorId', 'name rating');

    // Sort logic modification (nearest first + expiry soonest first)
    // MongoDB $near already sorts by nearest. To combine, we can sort in memory.
    const sortedFood = foodListing.sort((a, b) => {
      return new Date(a.expiryTime) - new Date(b.expiryTime);
    });

    res.json(sortedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Claim food
// @route   PUT /api/food/:id/claim
// @access  Private (Receiver)
export const claimFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.status !== 'Available') {
      return res.status(400).json({ message: 'Food is no longer available' });
    }

    if (req.user.role !== 'Receiver' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Receivers can claim food' });
    }

    food.status = 'Pending';
    food.receiverId = req.user._id;

    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update food status (Accept, Reject, Picked, Delivered)
// @route   PUT /api/food/:id/status
// @access  Private (Donor or Receiver)
export const updateFoodStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Authorization: Only the specific Donor can accept/reject or advance status
    // Only the specific Receiver can advance status to Picked/Delivered if accepted
    const isDonor = food.donorId.toString() === req.user._id.toString();
    const isReceiver = food.receiverId && food.receiverId.toString() === req.user._id.toString();

    if (!isDonor && !isReceiver && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    // Handle rejection
    if (status === 'Available' && isDonor) {
      food.status = 'Available';
      food.receiverId = null;
    } else {
      food.status = status;
    }

    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get receiver's claimed food
// @route   GET /api/food/receiver
// @access  Private (Receiver only)
export const getReceiverListings = async (req, res) => {
  try {
    if (req.user.role !== 'Receiver' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Receivers can access their claims' });
    }

    const listings = await Food.find({ receiverId: req.user._id })
      .populate('donorId', 'name email address location rating')
      .sort({ updatedAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donor's own food listings
// @route   GET /api/food/donor
// @access  Private (Donor only)
export const getDonorListings = async (req, res) => {
  try {
    if (req.user.role !== 'Donor' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Donors can access their listings' });
    }

    const listings = await Food.find({ donorId: req.user._id })
      .populate('receiverId', 'name email')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept delivery
// @route   POST /api/food/accept-delivery/:id
// @access  Private
export const acceptDelivery = async (req, res) => {
  try {
    const { volunteerName, volunteerPhone } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) return res.status(404).json({ message: 'Food not found' });
    if (food.deliveryStatus && food.deliveryStatus !== 'pending') {
      return res.status(400).json({ message: 'Delivery already accepted by another volunteer' });
    }

    food.volunteerName = volunteerName;
    food.volunteerPhone = volunteerPhone;
    food.volunteerId = req.user._id;
    food.deliveryStatus = 'accepted';

    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await Food.find({ volunteerId: req.user._id })
      .populate('donorId', 'name address location')
      .populate('receiverId', 'name address location')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark picked up by donor
// @route   PATCH /api/food/mark-picked/:id
// @access  Private
export const markPickedUp = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    if (food.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the donor can mark this as picked up' });
    }
    if (food.deliveryStatus !== 'accepted') return res.status(400).json({ message: 'Delivery not accepted yet' });

    food.pickupConfirmed = true;
    food.deliveryStatus = 'picked';
    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark delivered by volunteer
// @route   PATCH /api/food/mark-delivered/:id
// @access  Private
export const markDelivered = async (req, res) => {
  try {
    const { deliveryProofImage } = req.body;
    if (!deliveryProofImage) return res.status(400).json({ message: 'Delivery proof image is required' });
    
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    if (food.volunteerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned volunteer can mark this as delivered' });
    }
    if (!food.pickupConfirmed) return res.status(400).json({ message: 'Cannot deliver before pickup is confirmed' });

    food.deliveryProofImage = deliveryProofImage;
    food.deliveryStatus = 'delivered';
    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm delivery by donor
// @route   PATCH /api/food/confirm-delivery/:id
// @access  Private
export const confirmDelivery = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    if (food.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the donor can confirm final delivery' });
    }
    if (food.deliveryStatus !== 'delivered') return res.status(400).json({ message: 'Food has not been marked delivered yet' });

    food.deliveryStatus = 'completed';
    food.completedAt = Date.now();
    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available deliveries for volunteers
// @route   GET /api/food/available-deliveries
// @access  Private (Volunteer)
export const getAvailableDeliveries = async (req, res) => {
  try {
    // Only allow volunteers
    if (req.user.role !== 'Volunteer' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only volunteers can access this' });
    }

    const deliveries = await Food.find({
      receiverId: { $exists: true, $ne: null }, // ensures food is claimed
      $or: [
        { deliveryStatus: 'pending' },
        { deliveryStatus: { $exists: false } },
        { deliveryStatus: null }
      ]
    })
      .populate('donorId', 'name location')
      .populate('receiverId', 'name location')
      .sort({ createdAt: -1 });

    console.log("Available deliveries:", deliveries.length);

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Food.find({
      deliveryStatus: { $ne: 'pending' }
    })
      .populate('donorId', 'name address location')
      .populate('receiverId', 'name address location')
      .populate('volunteerId', 'name');

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a food item
// @route   PUT /api/food/:id
// @access  Private (Donor only)
export const editFood = async (req, res) => {
  try {
    const { name, quantity, type, expiryTime } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the original donor can edit this food listing' });
    }

    if (food.status !== 'Available') {
      return res.status(400).json({ message: 'Can only edit food listings that are currently Available' });
    }

    food.name = name || food.name;
    food.quantity = quantity || food.quantity;
    food.type = type || food.type;
    food.expiryTime = expiryTime || food.expiryTime;

    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a food item
// @route   DELETE /api/food/:id
// @access  Private (Donor only)
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the original donor can delete this food listing' });
    }

    await Food.deleteOne({ _id: req.params.id });
    res.json({ message: 'Food removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
