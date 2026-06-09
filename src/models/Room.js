import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
}, { _id: false }, );

const roomSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },

  location: {
    district: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
      default: '',
    },
    coordinates: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
  },

  bedroomCount: {
    type: Number,
    required: true,
    min: 1,
  },
  bathroomCount: {
    type: Number,
    required: true,
    min: 1,
  },
  area: {
    type: Number,
    default: null,
  },

  services: {
    internet: {
      type: Boolean,
      default: false,
    },
    water: {
      type: Boolean,
      default: false,
    },
    electricity: {
      type: Boolean,
      default: false,
    },
    gas: {
      type: Boolean,
      default: false,
    },
    parking: {
      type: Boolean,
      default: false,
    },
  },

  amenities: {
    type: [String],
    default: [],
  },

  houseRules: {
    type: [String],
    default: [],
  },

  livingPreferences: {
    petsAllowed: {
      type: Boolean,
      default: false,
    },
    smokingAllowed: {
      type: Boolean,
      default: false,
    },
    visitorsAllowed: {
      type: Boolean,
      default: true,
    },
    preferredGender: {
      type: String,
      enum: ['any', 'male', 'female'],
      default: 'any',
    },
    quietHours: {
      type: String,
      trim: true,
      default: '',
    },
  },

  images: {
    type: [imageSchema],
    default: [],
  },

  verificationStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'rejected'],
    default: 'not_submitted',
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
}, );

const Room = mongoose.model('Room', roomSchema);

export default Room;