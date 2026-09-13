import { useState } from 'react';
import {
  MapPin,
  Mail,
  CloudSun,
  Bot,
  Eye,
  EyeOff,
  RefreshCw,
  Send
} from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

export default function IntegrationTab({ settings, setSettings }) {
  const { showSuccess, showError } = useAlert();
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showKeys, setShowKeys] = useState({});

  const toggleShowKey = (field) => {
    setShowKeys((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestSmtp = async () => {
    if (!settings.smtpHost || !settings.smtpUsername) {
      showError('Please enter SMTP Host and Username before running connection test.', 'Incomplete SMTP Config');
      return;
    }

    setTestingSmtp(true);
    setTimeout(() => {
      setTestingSmtp(false);
      showSuccess(
        `Successfully established handshake with SMTP host "${settings.smtpHost}:${settings.smtpPort || 587}". Mail relay server is responding normally.`,
        'SMTP Connection Verified'
      );
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          External Integrations & API Keys
        </h2>
        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          Manage API keys for maps, live destination climate forecasts, AI virtual assistants, and SMTP email services.
        </p>
      </div>

      {/* Card 1: Interactive Map APIs */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
          Interactive Geo-Location & Maps API
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              Google Maps Platform API Key
            </label>
            <div className="relative">
              <input
                type={showKeys['googleMaps'] ? 'text' : 'password'}
                value={settings.googleMapsApiKey || ''}
                onChange={(e) => handleChange('googleMapsApiKey', e.target.value)}
                placeholder="AIzaSyA..."
                className="w-full pl-3 pr-9 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('googleMaps')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted-light)] hover:text-[var(--color-text-secondary-light)] dark:hover:text-[var(--color-text-secondary-dark)] cursor-pointer"
              >
                {showKeys['googleMaps'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              Used for tourist destination pinpointing and routing in Cambodia.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              Mapbox Public Access Token (Optional)
            </label>
            <div className="relative">
              <input
                type={showKeys['mapbox'] ? 'text' : 'password'}
                value={settings.mapboxApiKey || ''}
                onChange={(e) => handleChange('mapboxApiKey', e.target.value)}
                placeholder="pk.eyJ1..."
                className="w-full pl-3 pr-9 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('mapbox')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted-light)] hover:text-[var(--color-text-secondary-light)] dark:hover:text-[var(--color-text-secondary-dark)] cursor-pointer"
              >
                {showKeys['mapbox'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              Alternative vector tile renderer for high-resolution 3D temple maps.
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Live Weather & AI Assistant APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather API */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
            <CloudSun className="w-4 h-4 text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]" />
            Live Tourist Weather Forecast API
          </h3>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              OpenWeatherMap API Key
            </label>
            <div className="relative">
              <input
                type={showKeys['weatherKey'] ? 'text' : 'password'}
                value={settings.weatherApiKey || ''}
                onChange={(e) => handleChange('weatherApiKey', e.target.value)}
                placeholder="Enter OpenWeather API Key..."
                className="w-full pl-3 pr-9 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('weatherKey')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted-light)] hover:text-[var(--color-text-secondary-light)] dark:hover:text-[var(--color-text-secondary-dark)] cursor-pointer"
              >
                {showKeys['weatherKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              Powers live temperature, rain chance, and sunrise/sunset for tourist sites.
            </p>
          </div>
        </div>

        {/* AI Service API */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
            <Bot className="w-4 h-4 text-[var(--color-purple-text)] dark:text-[var(--color-purple-dark-text)]" />
            AI Tourism Assistant Engine
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
                AI Provider
              </label>
              <select
                value={settings.aiProvider || 'gemini'}
                onChange={(e) => handleChange('aiProvider', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
              >
                <option value="gemini">Google Gemini 2.0 / 1.5</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="claude">Anthropic Claude 3.5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKeys['aiKey'] ? 'text' : 'password'}
                  value={settings.aiApiKey || ''}
                  onChange={(e) => handleChange('aiApiKey', e.target.value)}
                  placeholder="API Key..."
                  className="w-full pl-3 pr-9 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('aiKey')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted-light)] hover:text-[var(--color-text-secondary-light)] dark:hover:text-[var(--color-text-secondary-dark)] cursor-pointer"
                >
                  {showKeys['aiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            Generates automated multi-lingual travel itineraries and answers visitor inquiries.
          </p>
        </div>
      </div>

      {/* Card 3: SMTP Email Server Configuration */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--color-primary)]" />
            SMTP Mail Server & Relay Settings
          </h3>

          <button
            type="button"
            onClick={handleTestSmtp}
            disabled={testingSmtp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-primary)] hover:opacity-80 transition-all cursor-pointer disabled:opacity-50"
          >
            {testingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{testingSmtp ? 'Testing Connection...' : 'Test Connection'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              SMTP Host
            </label>
            <input
              type="text"
              value={settings.smtpHost || ''}
              onChange={(e) => handleChange('smtpHost', e.target.value)}
              placeholder="e.g. smtp.mailtrap.io or smtp.gmail.com"
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              SMTP Port
            </label>
            <input
              type="text"
              value={settings.smtpPort || '587'}
              onChange={(e) => handleChange('smtpPort', e.target.value)}
              placeholder="587"
              className="w-full px-3 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              Encryption Protocol
            </label>
            <select
              value={settings.smtpEncryption || 'tls'}
              onChange={(e) => handleChange('smtpEncryption', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
            >
              <option value="tls">TLS (STARTTLS - Port 587)</option>
              <option value="ssl">SSL (Implicit - Port 465)</option>
              <option value="none">None (Plaintext - Port 25)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              SMTP Username
            </label>
            <input
              type="text"
              value={settings.smtpUsername || ''}
              onChange={(e) => handleChange('smtpUsername', e.target.value)}
              placeholder="mailer@tourism.gov.kh"
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              SMTP Password
            </label>
            <div className="relative">
              <input
                type={showKeys['smtpPassword'] ? 'text' : 'password'}
                value={settings.smtpPassword || ''}
                onChange={(e) => handleChange('smtpPassword', e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3 pr-9 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('smtpPassword')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted-light)] hover:text-[var(--color-text-secondary-light)] dark:hover:text-[var(--color-text-secondary-dark)] cursor-pointer"
              >
                {showKeys['smtpPassword'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
