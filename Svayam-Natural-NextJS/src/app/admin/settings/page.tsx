'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.svayamnatural.com/api/v1';

interface ConfigItem {
  _id: string;
  key: string;
  value: string;
  label: string;
  group: string;
}

const GROUP_LABELS: Record<string, { title: string; description: string; icon: string }> = {
  social: { title: 'Social & WhatsApp', description: 'Social media links and WhatsApp group', icon: '🌐' },
  links: { title: 'External Links', description: 'Registration, consultation, and other links', icon: '🔗' },
  contact: { title: 'Contact Info', description: 'Support email and phone', icon: '📞' },
  general: { title: 'General', description: 'Announcements and general settings', icon: '⚙️' },
  other: { title: 'Other', description: 'Custom settings', icon: '📋' },
};

const GROUP_ORDER = ['social', 'links', 'contact', 'general', 'other'];

export default function AdminSettingsPage() {
  const { token } = useAuthStore();
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  // New key form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newGroup, setNewGroup] = useState('other');

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const res = await fetch(`${API}/site-config`);
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data.configs);
        const initial: Record<string, string> = {};
        data.data.configs.forEach((c: ConfigItem) => { initial[c.key] = c.value; });
        setEditedValues(initial);
      }
    } catch (err) {
      console.error('Failed to load configs:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key: string, value: string) {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  }

  async function handleSaveAll() {
    setSaving(true);
    setSaveMessage('');
    try {
      const updates = Object.entries(editedValues).map(([key, value]) => ({ key, value }));
      const res = await fetch(`${API}/site-config/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ configs: updates }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage(`✓ ${data.data.length} settings saved successfully`);
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('✗ Failed to save: ' + data.message);
      }
    } catch (err) {
      setSaveMessage('✗ Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddKey() {
    if (!newKey.trim()) return;
    try {
      const res = await fetch(`${API}/site-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ key: newKey.trim().toLowerCase().replace(/\s+/g, '_'), label: newLabel || newKey, group: newGroup }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        setNewKey('');
        setNewLabel('');
        setNewGroup('other');
        fetchConfigs();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(`Delete "${key}"? This cannot be undone.`)) return;
    try {
      await fetch(`${API}/site-config/${key}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchConfigs();
    } catch (err) {
      console.error(err);
    }
  }

  const grouped = GROUP_ORDER.reduce((acc, group) => {
    const items = configs.filter(c => c.group === group);
    if (items.length > 0) acc[group] = items;
    return acc;
  }, {} as Record<string, ConfigItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-forest">Site Settings</h2>
          <p className="mt-1 text-sm text-clay">Manage links, social profiles, and other site-wide settings.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg border border-forest/20 px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-forest/5"
          >
            + Add Key
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="rounded-lg bg-forest px-6 py-2 text-sm font-semibold text-sand transition-all hover:bg-forest/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Save toast */}
      {saveMessage && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${saveMessage.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage}
        </div>
      )}

      {/* Add Key Form */}
      {showAddForm && (
        <div className="rounded-xl border border-gold/20 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-forest">Add New Setting</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Key (e.g. custom_link)"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold/50"
            />
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Display Label"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold/50"
            />
            <div className="flex gap-2">
              <select
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold/50"
              >
                {GROUP_ORDER.map(g => (
                  <option key={g} value={g}>{GROUP_LABELS[g]?.title || g}</option>
                ))}
              </select>
              <button onClick={handleAddKey} className="rounded-lg bg-gold/20 px-4 py-2 text-sm font-medium text-forest hover:bg-gold/30">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Config Groups */}
      {Object.entries(grouped).map(([group, items]) => {
        const meta = GROUP_LABELS[group] || { title: group, description: '', icon: '📋' };
        return (
          <div key={group} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-forest">
                <span className="text-lg">{meta.icon}</span> {meta.title}
              </h3>
              {meta.description && <p className="mt-0.5 text-xs text-clay">{meta.description}</p>}
            </div>
            <div className="divide-y divide-neutral-100">
              {items.map(config => (
                <div key={config.key} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="sm:w-1/3">
                    <label className="text-sm font-medium text-forest">{config.label}</label>
                    <p className="text-[11px] text-clay/60 font-mono">{config.key}</p>
                  </div>
                  <div className="flex flex-1 gap-2">
                    <input
                      type="text"
                      value={editedValues[config.key] ?? config.value}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      placeholder="Enter value..."
                      className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gold/50"
                    />
                    <button
                      onClick={() => handleDelete(config.key)}
                      className="rounded-lg px-2 py-2 text-xs text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Delete this setting"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
