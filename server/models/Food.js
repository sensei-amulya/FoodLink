import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    description: 'Number of people this food can serve'
  },
  type: {
    type: String,
    enum: ['veg', 'non-veg'],
    required: true,
    default: 'veg'
  },
  imageUrl: {
    type: String,
    description: 'Base64 image string or URL'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  expiryTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Accepted', 'Picked', 'Delivered'],
    default: 'Available'
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  volunteerName: {
    type: String
  },
  volunteerPhone: {
    type: String
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickupConfirmed: {
    type: Boolean,
    default: false
  },
  deliveryProofImage: {
    type: String
  },
  completedAt: {
    type: Date
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'delivered', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

// Create geospatial index
foodSchema.index({ location: '2dsphere' });

// Create model safely to prevent re-compilation errors in hot-reloading (nodemon)
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

export default Food;
