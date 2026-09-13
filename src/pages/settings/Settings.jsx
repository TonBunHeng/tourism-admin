import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getInitialTheme,
  applyTheme
} from "../../utils/Theme";
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  Shield,
  Server,
  Database,
  Info
} from "lucide-react";

import SettingsHeader from "./SettingsHeader";
import SettingsStats from "./SettingsStats";
import SettingsTabs from "./SettingsTabs";
import GeneralTab from "./GeneralTab";
import AppearanceTab from "./AppearanceTab";
import NotificationTab from "./NotificationTab";
import SecurityTab from "./SecurityTab";
import IntegrationTab from "./IntegrationTab";
import BackupTab from "./BackupTab";
import AboutTab from "./AboutTab";
import settingService from "../../services/settingService";
import { useAlert } from "../../context/AlertContext";

const KEY_GROUP_MAP = {
  // General
  siteName: 'general',
  appName: 'general',
  organizationName: 'general',
  siteDescription: 'general',
  contactEmail: 'general',
  contactPhone: 'general',
  emergencyPolice: 'general',
  emergencyTouristPolice: 'general',
  emergencyAmbulance: 'general',
  emergencyFire: 'general',
  defaultLanguage: 'general',
  defaultCurrency: 'general',
  timezone: 'general',
  dateFormat: 'general',
  termsOfServiceUrl: 'general',
  privacyPolicyUrl: 'general',
  maintenanceMode: 'general',
  maintenanceMessage: 'general',
  logoUrl: 'general',
  logoFileName: 'general',
  faviconUrl: 'general',
  faviconFileName: 'general',

  // Appearance
  theme: 'appearance',
  sidebarStyle: 'appearance',

  // Notifications
  pushNotifications: 'notifications',
  emailNotifications: 'notifications',
  smsNotifications: 'notifications',
  newUserAlert: 'notifications',
  newReviewAlert: 'notifications',
  newEventAlert: 'notifications',
  deletionRequestAlert: 'notifications',
  securityAlert: 'notifications',

  // Security
  twoFactorAuth: 'security',
  sessionTimeout: 'security',
  passwordPolicy: 'security',
  loginAttempts: 'security',

  // Integrations
  googleMapsApiKey: 'integrations',
  mapboxApiKey: 'integrations',
  weatherApiKey: 'integrations',
  aiProvider: 'integrations',
  aiApiKey: 'integrations',
  smtpHost: 'integrations',
  smtpPort: 'integrations',
  smtpEncryption: 'integrations',
  smtpUsername: 'integrations',
  smtpPassword: 'integrations',

  // Backup
  backupSchedule: 'backup',
  backupRetention: 'backup'
};

const SNAKE_TO_CAMEL = {
  site_name: 'siteName',
  app_name: 'appName',
  organization_name: 'organizationName',
  site_description: 'siteDescription',
  contact_email: 'contactEmail',
  support_email: 'contactEmail',
  contact_phone: 'contactPhone',
  support_phone: 'contactPhone',
  emergency_police: 'emergencyPolice',
  emergency_tourist_police: 'emergencyTouristPolice',
  emergency_ambulance: 'emergencyAmbulance',
  emergency_fire: 'emergencyFire',
  default_language: 'defaultLanguage',
  default_currency: 'defaultCurrency',
  date_format: 'dateFormat',
  terms_of_service_url: 'termsOfServiceUrl',
  privacy_policy_url: 'privacyPolicyUrl',
  maintenance_mode: 'maintenanceMode',
  maintenance_message: 'maintenanceMessage',
  logo_url: 'logoUrl',
  favicon_url: 'faviconUrl',
  two_factor_auth: 'twoFactorAuth',
  session_timeout: 'sessionTimeout',
  password_policy: 'passwordPolicy',
  login_attempts: 'loginAttempts',
  google_maps_api_key: 'googleMapsApiKey',
  mapbox_api_key: 'mapboxApiKey',
  weather_api_key: 'weatherApiKey',
  ai_provider: 'aiProvider',
  ai_api_key: 'aiApiKey',
  smtp_host: 'smtpHost',
  smtp_port: 'smtpPort',
  smtp_encryption: 'smtpEncryption',
  smtp_username: 'smtpUsername',
  smtp_password: 'smtpPassword',
  backup_schedule: 'backupSchedule',
  backup_retention: 'backupRetention'
};

const SETTING_TABS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Server },
  { id: "backup", label: "Backup & Restore", icon: Database },
  { id: "about", label: "About System", icon: Info }
];

export default function Settings() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab persistence via search param + sessionStorage
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) return tabFromUrl;
    const tabFromStorage = sessionStorage.getItem('settings_active_tab');
    return tabFromStorage || "general";
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('settings_active_tab', tabId);
    if (tabId === 'general') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab: tabId }, { replace: true });
    }
  };

  // Comprehensive System Settings State
  const defaultSettings = useMemo(() => ({
    // General
    siteName: "AngkorVerses Smart Tourism Portal",
    appName: "AngkorVerses",
    organizationName: "Ministry of Tourism & Culture Cambodia",
    siteDescription: "Official AngkorVerses Administration & Cultural Heritage Management Portal",
    contactEmail: "support@tourism.gov.kh",
    contactPhone: "+855 23 888 999",
    emergencyPolice: "117",
    emergencyTouristPolice: "+855 31 322 2117",
    emergencyAmbulance: "119",
    emergencyFire: "118",
    defaultLanguage: "km",
    defaultCurrency: "USD",
    timezone: "Asia/Phnom_Penh",
    dateFormat: "YYYY-MM-DD",
    termsOfServiceUrl: "https://tourism.gov.kh/terms",
    privacyPolicyUrl: "https://tourism.gov.kh/privacy",
    maintenanceMode: false,
    maintenanceMessage: "The AngkorVerses administrative portal is undergoing scheduled maintenance. Please check back shortly.",
    logoUrl: null,
    logoFileName: "",
    faviconUrl: null,
    faviconFileName: "",

    // Appearance
    theme: getInitialTheme(),
    sidebarStyle: "brand",

    // Notifications
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    newUserAlert: true,
    newReviewAlert: true,
    newEventAlert: true,
    deletionRequestAlert: true,
    securityAlert: true,

    // Security
    twoFactorAuth: true,
    sessionTimeout: "30",
    passwordPolicy: "strong",
    loginAttempts: "5",

    // Integrations
    googleMapsApiKey: "",
    mapboxApiKey: "",
    weatherApiKey: "",
    aiProvider: "gemini",
    aiApiKey: "",
    smtpHost: "smtp.mailtrap.io",
    smtpPort: "587",
    smtpEncryption: "tls",
    smtpUsername: "mailer@tourism.gov.kh",
    smtpPassword: "",

    // Backup
    backupSchedule: "daily",
    backupRetention: "30"
  }), []);

  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const res = await settingService.getSettings();
        if (isMounted && res.success && res.data && res.data.length > 0) {
          const loaded = { ...defaultSettings };
          res.data.forEach((item) => {
            const rawKey = item.key || item.setting_key;
            let val = item.value !== undefined ? item.value : item.setting_value;
            if (rawKey && val !== undefined && val !== null) {
              if (val === "true") val = true;
              if (val === "false") val = false;

              if (Object.prototype.hasOwnProperty.call(loaded, rawKey)) {
                loaded[rawKey] = val;
              }
              const camelKey = SNAKE_TO_CAMEL[rawKey];
              if (camelKey && Object.prototype.hasOwnProperty.call(loaded, camelKey)) {
                loaded[camelKey] = val;
              }
            }
          });

          loaded.theme = getInitialTheme();
          setSettings(loaded);
        }
      } catch (e) {
        console.error("Failed to load settings from API:", e);
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [defaultSettings]);

  // Search Match Calculator
  const searchMatchCounts = useMemo(() => {
    if (!searchQuery.trim()) return {};
    const q = searchQuery.toLowerCase();
    const counts = {};

    SETTING_TABS.forEach((tab) => {
      let count = 0;
      if (tab.label.toLowerCase().includes(q)) count += 1;

      Object.entries(settings).forEach(([key, val]) => {
        const group = KEY_GROUP_MAP[key];
        if (group === tab.id) {
          if (key.toLowerCase().includes(q) || String(val).toLowerCase().includes(q)) {
            count += 1;
          }
        }
      });

      if (count > 0) counts[tab.id] = count;
    });

    return counts;
  }, [searchQuery, settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Construct settings payload with proper group assignment
      const settingsArray = [];

      Object.keys(settings).forEach((key) => {
        const group = KEY_GROUP_MAP[key] || 'general';
        const rawVal = settings[key];
        const valStr = typeof rawVal === "object" && rawVal !== null
          ? JSON.stringify(rawVal)
          : String(rawVal ?? "");

        settingsArray.push({
          key,
          value: valStr,
          group,
        });
      });

      // Synchronize key pairs for public endpoint compatibility
      const syncPairs = [
        { key: 'site_name', val: settings.siteName, group: 'general' },
        { key: 'app_name', val: settings.appName || settings.siteName, group: 'general' },
        { key: 'support_email', val: settings.contactEmail, group: 'general' },
        { key: 'support_phone', val: settings.contactPhone, group: 'general' },
        { key: 'maintenance_mode', val: String(Boolean(settings.maintenanceMode)), group: 'general' },
        { key: 'default_language', val: settings.defaultLanguage, group: 'general' },
        { key: 'default_currency', val: settings.defaultCurrency, group: 'general' },
        { key: 'terms_of_service_url', val: settings.termsOfServiceUrl, group: 'general' },
        { key: 'privacy_policy_url', val: settings.privacyPolicyUrl, group: 'general' },
      ];

      syncPairs.forEach((pair) => {
        if (!settingsArray.some((s) => s.key === pair.key)) {
          settingsArray.push({
            key: pair.key,
            value: String(pair.val ?? ''),
            group: pair.group,
          });
        }
      });

      await settingService.updateSettings(settingsArray);

      // Re-apply theme setting on save
      if (settings.theme) applyTheme(settings.theme);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      showSuccess("System settings have been saved and applied successfully.", "Settings Saved");
    } catch (e) {
      showError(e.message || "Failed to save settings to backend.", "Save Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await showConfirm({
      title: "Reset System Settings",
      message: "Are you sure you want to restore default administrative settings? Unsaved changes will be discarded.",
      confirmText: "Reset to Default",
      type: "warning"
    });
    if (confirmed) {
      setSettings(defaultSettings);
      applyTheme('system');
      showSuccess("Settings restored to system defaults.", "Settings Reset");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab settings={settings} setSettings={setSettings} />;
      case "appearance":
        return <AppearanceTab settings={settings} setSettings={setSettings} />;
      case "notifications":
        return <NotificationTab settings={settings} setSettings={setSettings} />;
      case "security":
        return <SecurityTab settings={settings} setSettings={setSettings} />;
      case "integrations":
        return <IntegrationTab settings={settings} setSettings={setSettings} />;
      case "backup":
        return <BackupTab settings={settings} setSettings={setSettings} />;
      case "about":
        return <AboutTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col relative pb-10">
      {/* Settings Header */}
      <SettingsHeader
        saving={saving}
        saveSuccess={saveSuccess}
        onSave={handleSave}
        onReset={handleReset}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* KPI Overview Summary Stats */}
      <SettingsStats settings={settings} />

      {/* Main Settings Card */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex flex-col min-h-[550px]">
        {/* Top Header Navigation Tabs */}
        <SettingsTabs
          tabs={SETTING_TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchMatchCounts={searchMatchCounts}
        />

        {/* Tab Content Body */}
        <div className="flex-1 p-5 md:p-7 min-w-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
