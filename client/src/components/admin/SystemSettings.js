import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, RefreshCw, Shield, DollarSign, Mail, Globe, Database, Bell, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
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

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Use theme from context instead of local state
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Memoized tabs to prevent re-renders
  const tabs = useMemo(() => [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'payment', label: 'Payment', icon: DollarSign },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'content', label: 'Content', icon: Database }
  ], []);

  // Optimized fetch function
  const fetchSettings = useCallback(async () => {
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
  }, []);

  // Optimized save function
  const handleSave = useCallback(async () => {
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
  }, [settings]);

  // Optimized input change handler
  const handleInputChange = useCallback((section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Memoized form actions component
  const FormActions = useMemo(() => () => (
    <div className="form-actions">
      <button 
        className="btn btn-secondary" 
        onClick={fetchSettings}
        disabled={loading}
      >
        <RefreshCw size={16} />
        <span>Refresh</span>
      </button>
      <button 
        className="btn btn-primary" 
        onClick={handleSave}
        disabled={saving}
      >
        <Save size={16} />
        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
      </button>
    </div>
  ), [loading, saving, fetchSettings, handleSave]);

  if (loading) {
    return (
      <div className={`system-settings ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`system-settings ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="system-settings-container">
        {/* Header - Removed theme toggle button */}
        <div className="system-settings-header">
          <div className="header-content">
            <div className="title-section">
              <h1 className="system-settings-title">
                <Settings size={28} />
                <span>System Settings</span>
              </h1>
              <p className="system-settings-subtitle">
                Configure your platform settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="settings-container">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            <nav className="settings-navigation">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={18} />
                    <span className="nav-text">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="settings-content">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3 className="section-title">General Settings</h3>
                  <p className="section-description">
                    Basic configuration for your platform
                  </p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Site Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.general.siteName}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                      placeholder="Your Site Name"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="form-label">Site Description</label>
                    <textarea
                      className="form-textarea"
                      value={settings.general.siteDescription}
                      onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                      placeholder="Brief description of your platform"
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                      placeholder="contact@yoursite.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Support Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={settings.general.supportEmail}
                      onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                      placeholder="support@yoursite.com"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                      />
                      <span className="checkbox-text">
                        <strong>Maintenance Mode</strong>
                        <small>Enable this to show a maintenance page to users</small>
                      </span>
                    </label>
                  </div>
                </div>
                
                <FormActions />
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3 className="section-title">Payment Settings</h3>
                  <p className="section-description">
                    Configure payment gateways and financial settings
                  </p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select
                      className="form-select"
                      value={settings.payment.currency}
                      onChange={(e) => handleInputChange('payment', 'currency', e.target.value)}
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Payment Gateway</label>
                    <select
                      className="form-select"
                      value={settings.payment.paymentGateway}
                      onChange={(e) => handleInputChange('payment', 'paymentGateway', e.target.value)}
                    >
                      <option value="stripe">Stripe</option>
                      <option value="razorpay">Razorpay</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Stripe Publishable Key</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.payment.stripePublishableKey}
                      onChange={(e) => handleInputChange('payment', 'stripePublishableKey', e.target.value)}
                      placeholder="pk_test_..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Stripe Secret Key</label>
                    <input
                      type="password"
                      className="form-input"
                      value={settings.payment.stripeSecretKey}
                      onChange={(e) => handleInputChange('payment', 'stripeSecretKey', e.target.value)}
                      placeholder="sk_test_..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Commission Rate (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="50"
                      value={settings.payment.commissionRate}
                      onChange={(e) => handleInputChange('payment', 'commissionRate', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Minimum Withdrawal Amount</label>
                    <input
                      type="number"
                      className="form-input"
                      min="100"
                      value={settings.payment.minWithdrawal}
                      onChange={(e) => handleInputChange('payment', 'minWithdrawal', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <FormActions />
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3 className="section-title">Email Settings</h3>
                  <p className="section-description">
                    Configure SMTP settings for email delivery
                  </p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">SMTP Host</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">SMTP Port</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                      placeholder="587"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">SMTP Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">SMTP Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                      placeholder="Your SMTP password"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">From Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.email.fromName}
                      onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                      placeholder="Your Platform Name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">From Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={settings.email.fromEmail}
                      onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                      placeholder="noreply@yoursite.com"
                    />
                  </div>
                </div>
                
                <FormActions />
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3 className="section-title">Security Settings</h3>
                  <p className="section-description">
                    Configure security and authentication settings
                  </p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Max Login Attempts</label>
                    <input
                      type="number"
                      className="form-input"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Session Timeout (hours)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max="72"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Minimum Password Length</label>
                    <input
                      type="number"
                      className="form-input"
                      min="6"
                      max="20"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.security.requireEmailVerification}
                          onChange={(e) => handleInputChange('security', 'requireEmailVerification', e.target.checked)}
                        />
                        <span className="checkbox-text">Require Email Verification</span>
                      </label>
                      
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.security.allowGoogleAuth}
                          onChange={(e) => handleInputChange('security', 'allowGoogleAuth', e.target.checked)}
                        />
                        <span className="checkbox-text">Allow Google Authentication</span>
                      </label>
                      
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.security.allowFacebookAuth}
                          onChange={(e) => handleInputChange('security', 'allowFacebookAuth', e.target.checked)}
                        />
                        <span className="checkbox-text">Allow Facebook Authentication</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <FormActions />
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3 className="section-title">Notification Settings</h3>
                  <p className="section-description">
                    Configure notification preferences
                  </p>
                </div>
                
                <div className="notification-grid">
                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Email Notifications</h4>
                      <p>Send notifications via email</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Push Notifications</h4>
                      <p>Send browser push notifications</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Course Approval Emails</h4>
                      <p>Notify when courses need approval</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.courseApprovalEmails}
                        onChange={(e) => handleInputChange('notifications', 'courseApprovalEmails', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Payment Notifications</h4>
                      <p>Notify about payment transactions</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.paymentNotifications}
                        onChange={(e) => handleInputChange('notifications', 'paymentNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Maintenance Alerts</h4>
                      <p>Notify about system maintenance</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.maintenanceAlerts}
                        onChange={(e) => handleInputChange('notifications', 'maintenanceAlerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <FormActions />
              </div>
            )}

            {/* Content Settings */}
            {activeTab === 'content' && (
              <div className="settings-section">
                <div className="section-header">
                  <h3 className="section-title">Content Settings</h3>
                  <p className="section-description">
                    Configure content management and upload settings
                  </p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.content.autoApprove}
                        onChange={(e) => handleInputChange('content', 'autoApprove', e.target.checked)}
                      />
                      <span className="checkbox-text">
                        <strong>Auto-approve new courses</strong>
                        <small>Automatically approve courses without manual review</small>
                      </span>
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Max File Size (MB)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="10"
                      max="1000"
                      value={settings.content.maxFileSize}
                      onChange={(e) => handleInputChange('content', 'maxFileSize', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Video Quality</label>
                    <select
                      className="form-select"
                      value={settings.content.videoQuality}
                      onChange={(e) => handleInputChange('content', 'videoQuality', e.target.value)}
                    >
                      <option value="auto">Auto</option>
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="form-label">Allowed File Types</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.content.allowedFileTypes.join(', ')}
                      onChange={(e) => handleInputChange('content', 'allowedFileTypes', e.target.value.split(', '))}
                      placeholder="mp4, pdf, doc, ppt"
                    />
                    <small className="form-help">Comma-separated list of allowed file extensions</small>
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.content.enableSubtitles}
                        onChange={(e) => handleInputChange('content', 'enableSubtitles', e.target.checked)}
                      />
                      <span className="checkbox-text">Enable Subtitles Support</span>
                    </label>
                  </div>
                </div>
                
                <FormActions />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;