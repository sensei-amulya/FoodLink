import Food from "../models/Food.js";

// @desc    Add a new food item
// @route   POST /api/food
// @access  Private (Donor only)
export const addFood = async (req, res) => {
  try {
    const { name, quantity, longitude, latitude, expiryTime } = req.body;

    // 🔒 validation
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (!name || !quantity || isNaN(lng) || isNaN(lat) || !expiryTime) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    if (req.user.role !== "Donor" && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only Donors can add food" });
    }

    const food = await Food.create({
      name,
      quantity,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      expiryTime,
      donorId: req.user._id,
    });

    // 🔔 safe socket emit
    if (req.io) {
      req.io.emit("food_alert", {
        id: food._id,
        name: food.name,
        quantity: food.quantity,
        location: food.location,
        expiryTime: food.expiryTime,
      });
    }

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
    const { lng, lat, distance = 5000 } = req.query;

    const lngNum = parseFloat(lng);
    const latNum = parseFloat(lat);
    const distNum = parseInt(distance);

    if (isNaN(lngNum) || isNaN(latNum)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const foodListing = await Food.find({
      status: "Available",
      expiryTime: { $gt: new Date() },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lngNum, latNum],
          },
          $maxDistance: distNum,
        },
      },
    }).populate("donorId", "name rating");

    const sortedFood = foodListing.sort(
      (a, b) => new Date(a.expiryTime) - new Date(b.expiryTime)
    );

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
      return res.status(404).json({ message: "Food not found" });
    }

    if (food.status === "Claimed") {
      return res.status(400).json({ message: "Food is already claimed" });
    }

    if (new Date(food.expiryTime) < new Date()) {
      return res.status(400).json({ message: "Food has expired" });
    }

    if (req.user.role !== "Receiver" && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only Receivers can claim food" });
    }

    food.status = "Claimed";
    food.receiverId = req.user._id;

    const updatedFood = await food.save();

    // 🔔 notify donor
    if (req.io) {
      req.io.to(food.donorId.toString()).emit("food_claimed", {
        foodId: food._id,
        receiverId: req.user._id,
      });
    }

    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
