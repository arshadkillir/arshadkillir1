import React, { useState, useEffect } from 'react';
import API from '@/services/api.js';
import styles from './SettingsForm.module.css'; // We'll create this for styling

export default function AccountAggregator() {
  const [settings, setSettings] = useState({
    clientId: '',
    clientSecret: '',
    apiKey: '',
    apiSecret: '',
    isEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // This endpoint will need to be created in your backend
        const response = await API.get('/settings/account-aggregator');
        if (response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        // It's okay if it fails, it might just not be configured yet.
        console.log('No existing Account Aggregator settings found.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // This endpoint will need to be created in your backend (e.g., using POST or PUT)
      await API.post('/settings/account-aggregator', settings);
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Account Aggregator Integration</h1>
      <p>Configure your credentials for the Account Aggregator service.</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>Client ID</label>
        <input type="text" name="clientId" value={settings.clientId} onChange={handleChange} className={styles.input} />

        <label className={styles.label}>Client Secret</label>
        <input type="password" name="clientSecret" value={settings.clientSecret} onChange={handleChange} className={styles.input} placeholder="Enter new secret or leave blank to keep existing" />

        <label className={styles.label}>API Key</label>
        <input type="text" name="apiKey" value={settings.apiKey} onChange={handleChange} className={styles.input} />

        <label className={styles.label}>API Secret</label>
        <input type="password" name="apiSecret" value={settings.apiSecret} onChange={handleChange} className={styles.input} placeholder="Enter new secret or leave blank to keep existing" />

        <div className={styles.checkboxContainer}>
          <input type="checkbox" id="isEnabled" name="isEnabled" checked={settings.isEnabled} onChange={handleChange} />
          <label htmlFor="isEnabled">Enable Account Aggregator Service</label>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button type="submit" disabled={saving} className={styles.submitButton}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}