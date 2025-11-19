import { useState } from 'react';
import Card from '@/components/card';
import Button from '@/components/button';

function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Planet Path',
    siteDescription: 'Climate Action E-Learning Platform',
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: false,
    maxFileUploadSize: 10,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-sand via-soft-white to-light-sand p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-playful text-forest-green mb-4 animate-scale-pulse">
            Platform Settings ⚙️
          </h1>
          <p className="text-earth-brown text-lg font-medium">
            Configure platform-wide settings and preferences
          </p>
        </div>

        <Card className="p-6 md:p-8 bg-soft-white animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Settings */}
            <div>
              <h2 className="text-2xl font-playful font-bold text-forest-green mb-4">
                General Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="siteName"
                    className="block text-sm font-semibold text-earth-brown mb-2"
                  >
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="siteDescription"
                    className="block text-sm font-semibold text-earth-brown mb-2"
                  >
                    Site Description
                  </label>
                  <textarea
                    id="siteDescription"
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div>
              <h2 className="text-2xl font-playful font-bold text-forest-green mb-4">
                Feature Toggles
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="w-5 h-5 text-leaf-green border-leaf-green/40 rounded focus:ring-leaf-green/20"
                  />
                  <span className="text-earth-brown font-medium">Maintenance Mode</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowSignups"
                    checked={settings.allowSignups}
                    onChange={handleChange}
                    className="w-5 h-5 text-leaf-green border-leaf-green/40 rounded focus:ring-leaf-green/20"
                  />
                  <span className="text-earth-brown font-medium">Allow New Signups</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onChange={handleChange}
                    className="w-5 h-5 text-leaf-green border-leaf-green/40 rounded focus:ring-leaf-green/20"
                  />
                  <span className="text-earth-brown font-medium">Require Email Verification</span>
                </label>
              </div>
            </div>

            {/* Upload Settings */}
            <div>
              <h2 className="text-2xl font-playful font-bold text-forest-green mb-4">
                Upload Settings
              </h2>
              <div>
                <label
                  htmlFor="maxFileUploadSize"
                  className="block text-sm font-semibold text-earth-brown mb-2"
                >
                  Max File Upload Size (MB)
                </label>
                <input
                  type="number"
                  id="maxFileUploadSize"
                  name="maxFileUploadSize"
                  value={settings.maxFileUploadSize}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                text={isSaving ? 'Saving...' : 'Save Settings'}
                onClick={() => {}}
                type="submit"
                className="flex-1"
                disabled={isSaving}
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default AdminSettings;

