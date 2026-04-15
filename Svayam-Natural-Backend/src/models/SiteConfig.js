import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  value: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  group: {
    type: String,
    default: 'general',
    enum: ['general', 'social', 'links', 'contact', 'other']
  }
}, { timestamps: true });

const SiteConfig = mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema);
export default SiteConfig;
