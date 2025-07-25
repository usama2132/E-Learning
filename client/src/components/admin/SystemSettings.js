import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Shield, DollarSign, Mail, Globe, Database, Bell } from 'lucide-react';
import '../../styles/dashboards/AdminDashboard.css';
import '../../styles/dashboards/SystemSettings.css';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      supportEmail: '',
      maintenanceMode: false
    },
    payment: {
      currency: 'INR',
      stripePublishableKey: '',
      stripeSecretKey: '',
      paymentGateway: 'stripe',
      commissionRate: 15,
      minWithdrawal: 1000
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromName: '',
      fromEmail: ''
    },
    security: {
      maxLoginAttempts: 5,
      sessionTimeout: 24,
      passwordMinLength: 8,
      requireEmailVerification: true,
      allowGoogleAuth: true,
      allowFacebookAuth: false
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      courseApprovalEmails: true,
      paymentNotifications: true,
      maintenanceAlerts: true
    },
    content: {
      autoApprove: false,
      maxFileSize: 100,
      allowedFileTypes: ['mp4', 'pdf', 'doc', 'ppt'],
      videoQuality: 'auto',
      enableSubtitles: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data.settings }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Error saving settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'payment', label: 'Payment', icon: DollarSign },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'content', label: 'Content', icon: Database }
  ];

  if (loading) {
    return (
      <div className="system-settings">
        <div className="loading-spinner">Loading system settings...</div>
      </div>
    );
  }

  return (
    <div className="system-settings">
      <div className="page-header">
        <h2>System Settings</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchSettings}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                  placeholder="Your Site Name"
                />
              </div>
              <div className="form-group">
                <label>Site Description</label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                  placeholder="Brief description of your platform"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  placeholder="contact@yoursite.com"
                />
              </div>
              <div className="form-group">
                <label>Support Email</label>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                  placeholder="support@yoursite.com"
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                  />
                  Maintenance Mode
                </label>
                <small>Enable this to show a maintenance page to users</small>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="settings-section">
              <h3>Payment Settings</h3>
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={settings.payment.currency}
                  onChange={(e) => handleInputChange('payment', 'currency', e.target.value)}
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Gateway</label>
                <select
                  value={settings.payment.paymentGateway}
                  onChange={(e) => handleInputChange('payment', 'paymentGateway', e.target.value)}
                >
                  <option value="stripe">Stripe</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div className="form-group">
                <label>Commission Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.payment.commissionRate}
                  onChange={(e) => handleInputChange('payment', 'commissionRate', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Minimum Withdrawal Amount</label>
                <input
                  type="number"
                  min="100"
                  value={settings.payment.minWithdrawal}
                  onChange={(e) => handleInputChange('payment', 'minWithdrawal', parseInt(e.target.value))}
                />
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="settings-section">
              <h3>Email Settings</h3>
              <div className="form-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="form-group">
                <label>SMTP Port</label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                  placeholder="587"
                />
              </div>
              <div className="form-group">
                <label>SMTP Username</label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div className="form-group">
                <label>From Name</label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                  placeholder="Your Platform Name"
                />
              </div>
              <div className="form-group">
                <label>From Email</label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                  placeholder="noreply@yoursite.com"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="form-group">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Session Timeout (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Minimum Password Length</label>
                <input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.security.requireEmailVerification}
                    onChange={(e) => handleInputChange('security', 'requireEmailVerification', e.target.checked)}
                  />
                  Require Email Verification
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.security.allowGoogleAuth}
                    onChange={(e) => handleInputChange('security', 'allowGoogleAuth', e.target.checked)}
                  />
                  Allow Google Authentication
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.security.allowFacebookAuth}
                    onChange={(e) => handleInputChange('security', 'allowFacebookAuth', e.target.checked)}
                  />
                  Allow Facebook Authentication
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Settings</h3>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                  Email Notifications
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                  />
                  Push Notifications
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.courseApprovalEmails}
                    onChange={(e) => handleInputChange('notifications', 'courseApprovalEmails', e.target.checked)}
                  />
                  Course Approval Emails
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.paymentNotifications}
                    onChange={(e) => handleInputChange('notifications', 'paymentNotifications', e.target.checked)}
                  />
                  Payment Notifications
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.maintenanceAlerts}
                    onChange={(e) => handleInputChange('notifications', 'maintenanceAlerts', e.target.checked)}
                  />
                  Maintenance Alerts
                </label>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="settings-section">
              <h3>Content Settings</h3>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.content.autoApprove}
                    onChange={(e) => handleInputChange('content', 'autoApprove', e.target.checked)}
                  />
                  Auto-approve new courses
                </label>
                <small>Automatically approve courses without manual review</small>
              </div>
              <div className="form-group">
                <label>Max File Size (MB)</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={settings.content.maxFileSize}
                  onChange={(e) => handleInputChange('content', 'maxFileSize', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Video Quality</label>
                <select
                  value={settings.content.videoQuality}
                  onChange={(e) => handleInputChange('content', 'videoQuality', e.target.value)}
                >
                  <option value="auto">Auto</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.content.enableSubtitles}
                    onChange={(e) => handleInputChange('content', 'enableSubtitles', e.target.checked)}
                  />
                  Enable Subtitles Support
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
