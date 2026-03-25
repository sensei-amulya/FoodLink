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
  }
}, { timestamps: true });

// Create geospatial index
foodSchema.index({ location: '2dsphere' });

const Food = mongoose.model('Food', foodSchema);
export default Food;
