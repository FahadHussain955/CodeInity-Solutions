// =============================================================================
// SETTINGS PAGE
// User preferences: theme, notifications, display, trading risk level.
// Reads from / writes to userService (localStorage → Supabase in future).
// =============================================================================

import { useState, useEffect } from 'react';
import { getUserSettings, updateUserSettings } from '../../services/userService';
import { useTheme } from '../../context/ThemeContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';

/**
 * Settings — user preferences panel.
 */
export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getUserSettings()
      .then(setSettings)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateUserSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message ?? 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  if (isLoading) return <PageLoader label="Loading settings..." />;
  if (error) return <ErrorMessage message={error} variant="page" />;
  if (!settings) return null;

  return (
    <div className="page settings-page" data-testid="settings-page">

      {/* ── Appearance ── */}
      <section className="settings-section" data-testid="settings-appearance">
        <h2 className="settings-section-title">Appearance</h2>
        <div className="settings-field">
          <label className="settings-label">Theme</label>
          <div className="settings-theme-options" role="radiogroup" aria-label="Select theme">
            {['dark', 'light'].map((t) => (
              <button
                key={t}
                role="radio"
                aria-checked={theme === t}
                className={`settings-theme-btn${theme === t ? ' settings-theme-btn--active' : ''}`}
                onClick={() => handleThemeChange(t)}
                data-testid={`theme-option-${t}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notifications ── */}
      <section className="settings-section" data-testid="settings-notifications">
        <h2 className="settings-section-title">Notifications</h2>
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="settings-toggle-row">
            <label htmlFor={`notif-${key}`} className="settings-label">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type="checkbox"
              id={`notif-${key}`}
              checked={value}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, [key]: e.target.checked },
                }))
              }
              data-testid={`notif-toggle-${key}`}
            />
          </div>
        ))}
      </section>

      {/* ── Trading Risk ── */}
      <section className="settings-section" data-testid="settings-trading">
        <h2 className="settings-section-title">Trading Preferences</h2>
        <div className="settings-field">
          <label htmlFor="risk-level" className="settings-label">Risk Level</label>
          <select
            id="risk-level"
            value={settings.trading.riskLevel}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                trading: { ...prev.trading, riskLevel: e.target.value },
              }))
            }
            data-testid="risk-level-select"
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
      </section>

      {/* ── Save button ── */}
      <div className="settings-actions">
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          data-testid="settings-save-btn"
        >
          Save Changes
        </Button>
        {saveSuccess && (
          <span className="settings-save-success" role="status" aria-live="polite">
            ✓ Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
