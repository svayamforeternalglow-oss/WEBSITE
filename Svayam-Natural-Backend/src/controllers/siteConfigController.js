import SiteConfig from '../models/SiteConfig.js';

// Default configs that get seeded if they don't exist
const DEFAULT_CONFIGS = [
  { key: 'whatsapp_group_link', value: 'https://chat.whatsapp.com/DTjOmrm04O6FxXMVzFY4ep?mode=gi_t', label: 'WhatsApp Group Link', group: 'social' },
  { key: 'whatsapp_number', value: '', label: 'WhatsApp Business Number', group: 'social' },
  { key: 'instagram_url', value: 'https://www.instagram.com/svayam_natural', label: 'Instagram URL', group: 'social' },
  { key: 'facebook_url', value: '', label: 'Facebook URL', group: 'social' },
  { key: 'twitter_url', value: '', label: 'Twitter / X URL', group: 'social' },
  { key: 'youtube_url', value: '', label: 'YouTube URL', group: 'social' },
  { key: 'registration_link', value: '', label: 'Registration / Sign-up Link', group: 'links' },
  { key: 'consultation_link', value: '', label: 'Book Consultation Link', group: 'links' },
  { key: 'support_email', value: 'support@svayam-natural.com', label: 'Support Email', group: 'contact' },
  { key: 'support_phone', value: '', label: 'Support Phone', group: 'contact' },
  { key: 'announcement_bar_text', value: '', label: 'Announcement Bar Text', group: 'general' },
  { key: 'announcement_bar_link', value: '', label: 'Announcement Bar Link', group: 'general' },
];

// Seed defaults on first load
async function ensureDefaults() {
  for (const cfg of DEFAULT_CONFIGS) {
    await SiteConfig.findOneAndUpdate(
      { key: cfg.key },
      { $setOnInsert: cfg },
      { upsert: true, new: true }
    );
  }
}

// @desc    Get all site configs (public — no auth needed)
// @route   GET /api/v1/site-config
export const getAllConfigs = async (req, res) => {
  try {
    await ensureDefaults();
    const configs = await SiteConfig.find({}).sort({ group: 1, key: 1 });

    // Return as a key-value map for easy frontend consumption
    const map = {};
    configs.forEach(c => { map[c.key] = c.value; });

    res.json({ success: true, data: { configs, map } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get configs by group
// @route   GET /api/v1/site-config/group/:group
export const getConfigsByGroup = async (req, res) => {
  try {
    const configs = await SiteConfig.find({ group: req.params.group }).sort({ key: 1 });
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a single config by key
// @route   PUT /api/v1/site-config/:key
// @access  Private/Admin
export const updateConfig = async (req, res) => {
  try {
    const config = await SiteConfig.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ success: false, message: 'Config key not found' });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk update configs
// @route   PUT /api/v1/site-config/bulk
// @access  Private/Admin
export const bulkUpdateConfigs = async (req, res) => {
  try {
    const updates = req.body.configs; // Array of { key, value }
    if (!Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: 'Expected configs array' });
    }

    const results = [];
    for (const { key, value } of updates) {
      const updated = await SiteConfig.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true }
      );
      results.push(updated);
    }

    res.json({ success: true, data: results, message: `${results.length} configs updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new config key
// @route   POST /api/v1/site-config
// @access  Private/Admin
export const createConfig = async (req, res) => {
  try {
    const { key, value, label, group } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Key is required' });

    const existing = await SiteConfig.findOne({ key });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Config key already exists' });
    }

    const config = await SiteConfig.create({ key, value: value || '', label: label || key, group: group || 'other' });
    res.status(201).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a config key
// @route   DELETE /api/v1/site-config/:key
// @access  Private/Admin
export const deleteConfig = async (req, res) => {
  try {
    const config = await SiteConfig.findOneAndDelete({ key: req.params.key });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Config key not found' });
    }
    res.json({ success: true, message: 'Config deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
