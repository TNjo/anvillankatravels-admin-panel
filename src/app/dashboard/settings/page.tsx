"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";
import type { SiteSettings } from "@/types";

const defaultSettings: SiteSettings = {
  siteName: "Anvil Lanka Travels",
  contactEmail: "",
  contactPhone: "",
  whatsappNumber: "",
  socialMedia: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  },
};

export default function SettingsPage() {
  const { getToken } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = await getToken();
        const res = await fetch("/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...defaultSettings, ...data });
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [getToken]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your site configuration</p>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">General</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Site Name</label>
          <input
            type="text"
            className="input"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            type="email"
            className="input"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            placeholder="info@anvillankatravels.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Contact Phone</label>
          <input
            type="tel"
            className="input"
            value={settings.contactPhone}
            onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
            placeholder="+94 XX XXX XXXX"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">WhatsApp Number</label>
          <input
            type="tel"
            className="input"
            value={settings.whatsappNumber}
            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
            placeholder="+94 XX XXX XXXX"
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Social Media</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Facebook URL</label>
          <input
            type="url"
            className="input"
            value={settings.socialMedia.facebook}
            onChange={(e) =>
              setSettings({
                ...settings,
                socialMedia: { ...settings.socialMedia, facebook: e.target.value },
              })
            }
            placeholder="https://facebook.com/..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Instagram URL</label>
          <input
            type="url"
            className="input"
            value={settings.socialMedia.instagram}
            onChange={(e) =>
              setSettings({
                ...settings,
                socialMedia: { ...settings.socialMedia, instagram: e.target.value },
              })
            }
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Twitter URL</label>
          <input
            type="url"
            className="input"
            value={settings.socialMedia.twitter}
            onChange={(e) =>
              setSettings({
                ...settings,
                socialMedia: { ...settings.socialMedia, twitter: e.target.value },
              })
            }
            placeholder="https://twitter.com/..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">YouTube URL</label>
          <input
            type="url"
            className="input"
            value={settings.socialMedia.youtube}
            onChange={(e) =>
              setSettings({
                ...settings,
                socialMedia: { ...settings.socialMedia, youtube: e.target.value },
              })
            }
            placeholder="https://youtube.com/..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
