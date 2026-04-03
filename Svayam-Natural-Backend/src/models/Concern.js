import mongoose from 'mongoose';

const concernSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Concern name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

concernSchema.index({ slug: 1 });

const Concern = mongoose.model('Concern', concernSchema);

export default Concern;
