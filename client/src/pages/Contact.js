import React, { useState, useCallback, useMemo, useEffect } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addListener(handleChange);
    
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 800);
  }, []);

  const resetForm = useCallback(() => setSubmitted(false), []);

  // FLASH SPEED OPTIMIZED STYLES - Removed all performance killers
  const getStyles = useMemo(() => {
    const theme = {
      light: {
        containerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        inputBg: '#ffffff',
        titleText: '#ffffff',
        subtitleText: 'rgba(255, 255, 255, 0.8)',
        glassCardText: '#ffffff',
        glassCardSecondary: 'rgba(255, 255, 255, 0.8)',
        primaryText: '#1a202c',
        secondaryText: '#4a5568',
        labelText: '#2d3748',
        inputText: '#2d3748',
        placeholder: '#9ca3af'
      },
      dark: {
        containerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        inputBg: '#ffffff',
        titleText: '#ffffff',
        subtitleText: 'rgba(255, 255, 255, 0.8)',
        glassCardText: '#ffffff',
        glassCardSecondary: 'rgba(255, 255, 255, 0.8)',
        primaryText: '#4a5568',
        secondaryText: '#718096',
        labelText: '#2d3748',
        inputText: '#1a202c',
        placeholder: '#718096'
      }
    };

    const currentTheme = isDarkMode ? theme.dark : theme.light;

    return {
      container: {
        background: currentTheme.containerBg,
        minHeight: '100vh',
        position: 'relative'
      },
      main: {
        padding: '48px 20px',
        maxWidth: '1200px',
        margin: '0 auto',

      },
      title: {
        textAlign: 'center',
        marginBottom: '60px',
        marginTop: '40px',
        
        
      },
      h1: {
        fontSize: 'clamp(32px, 5vw, 48px)',
        fontWeight: 'bold',
        color: currentTheme.titleText,
        marginBottom: '20px',
        letterSpacing: '-1px',
        lineHeight: '1.1',
        margin: '0 0 20px 0',
        
      },
      subtitle: {
        fontSize: 'clamp(16px, 2.5vw, 20px)',
        color: currentTheme.subtitleText,
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: '1.6'
      },
      grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
        gap: 'clamp(20px, 4vw, 40px)',
        alignItems: 'start'
        
      },
      // REMOVED backdrop-filter - major performance killer
      glassCard: {
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        padding: 'clamp(24px, 4vw, 40px)'
      },
      // REMOVED backdrop-filter - major performance killer
      solidCard: {
        background: currentTheme.cardBg,
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: 'clamp(24px, 4vw, 40px)'
      },
      h2: {
        fontSize: 'clamp(20px, 3vw, 28px)',
        fontWeight: '600',
        marginBottom: '30px',
        textAlign: 'center',
        
      },
      contactInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      },
      contactItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px'
      },
      iconContainer: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        flexShrink: 0
      },
      input: {
        width: '100%',
        padding: '16px 20px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        background: currentTheme.inputBg,
        color: currentTheme.inputText,
        fontSize: '16px',
        transition: 'border-color 0.2s ease', // Simplified transition
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
      },
      button: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '16px 32px',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'opacity 0.2s ease', // Simplified transition
        outline: 'none'
      },
      outlineButton: {
        background: 'transparent',
        color: '#667eea',
        border: '2px solid #667eea',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none'
      },
      formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '20px'
      },
      supportGrid: {
        marginTop: '60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: 'clamp(20px, 3vw, 30px)'
      },
      successIcon: {
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: '32px'
      },
      // Text color utilities
      glassCardText: {
        color: currentTheme.glassCardText
      },
      glassCardSecondary: {
        color: currentTheme.glassCardSecondary
      },
      primaryText: {
        color: currentTheme.primaryText
      },
      secondaryText: {
        color: currentTheme.secondaryText
      },
      labelText: {
        color: currentTheme.labelText
      },
      
      currentTheme
    };
  }, [isDarkMode]);

  const styles = getStyles;

  // Simplified gradients - solid colors for better performance
  const gradients = useMemo(() => [
    '#4facfe',
    '#43e97b', 
    '#fa709a',
    '#fcb69f',
    '#a8edea',
    '#d299c2'
  ], []);

  // SIMPLIFIED event handlers - no complex animations
  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#667eea';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
  };

  const handleButtonHover = (e, isHover, isOutline = false) => {
    if (isOutline) {
      if (isHover) {
        e.target.style.background = '#667eea';
        e.target.style.color = 'white';
      } else {
        e.target.style.background = 'transparent';
        e.target.style.color = '#667eea';
      }
    } else {
      e.target.style.opacity = isHover ? '0.9' : '1';
    }
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.title}>
          <h1 style={styles.h1}>Get in Touch</h1>
          <p style={styles.subtitle}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
        
        <div style={styles.grid}>
          {/* Contact Information */}
          <div style={styles.glassCard}>
            <h2 style={{ ...styles.h2, ...styles.glassCardText }}>Contact Information</h2>
            
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <div style={{ ...styles.iconContainer, background: gradients[0] }}>📧</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', ...styles.glassCardText, marginBottom: '8px' }}>
                    Email
                  </h3>
                  <p style={{ ...styles.glassCardSecondary, marginBottom: '4px', fontSize: '14px' }}>
                    support@learningplatform.com
                  </p>
                  <p style={{ ...styles.glassCardSecondary, fontSize: '14px' }}>
                    info@learningplatform.com
                  </p>
                </div>
              </div>
              
              <div style={styles.contactItem}>
                <div style={{ ...styles.iconContainer, background: gradients[1] }}>📞</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', ...styles.glassCardText, marginBottom: '8px' }}>
                    Phone
                  </h3>
                  <p style={{ ...styles.glassCardSecondary, marginBottom: '4px', fontSize: '14px' }}>
                    +1 (555) 123-4567
                  </p>
                  <p style={{ ...styles.glassCardSecondary, fontSize: '14px' }}>
                    Monday - Friday, 9AM - 6PM EST
                  </p>
                </div>
              </div>
              
              <div style={styles.contactItem}>
                <div style={{ ...styles.iconContainer, background: gradients[2] }}>📍</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', ...styles.glassCardText, marginBottom: '8px' }}>
                    Address
                  </h3>
                  <p style={{ ...styles.glassCardSecondary, marginBottom: '4px', fontSize: '14px' }}>
                    123 Learning Street
                  </p>
                  <p style={{ ...styles.glassCardSecondary, fontSize: '14px' }}>
                    Education City, EC 12345
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ 
              marginTop: '40px', 
              padding: '30px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', ...styles.glassCardText, marginBottom: '12px' }}>
                Frequently Asked Questions
              </h3>
              <p style={{ ...styles.glassCardSecondary, fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                Before reaching out, you might find your answer in our FAQ section.
              </p>
              <button 
                style={{
                  ...styles.outlineButton,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: styles.currentTheme.glassCardText
                }}
                onMouseEnter={(e) => handleButtonHover(e, true, true)}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = styles.currentTheme.glassCardText;
                }}
              >
                View FAQ
              </button>
            </div>
          </div>
          
          {/* Contact Form */}
          <div style={styles.solidCard}>
            <h2 style={{ ...styles.h2, ...styles.primaryText }}>Send us a Message</h2>
            
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={styles.successIcon}>✓</div>
                <h3 style={{ ...styles.primaryText, fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                  Message Sent!
                </h3>
                <p style={{ ...styles.secondaryText, marginBottom: '30px', lineHeight: '1.6' }}>
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
                <button 
                  onClick={resetForm}
                  style={styles.outlineButton}
                  onMouseEnter={(e) => handleButtonHover(e, true, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false, true)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={styles.formGrid}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      ...styles.labelText,
                      marginBottom: '8px' 
                    }}>
                      Full Name *
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={styles.input}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      ...styles.labelText,
                      marginBottom: '8px' 
                    }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={styles.input}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    ...styles.labelText,
                    marginBottom: '8px' 
                  }}>
                    Subject *
                  </label>
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    ...styles.labelText,
                    marginBottom: '8px' 
                  }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    style={{
                      ...styles.input,
                      resize: 'vertical',
                      minHeight: '120px'
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>
                
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    ...styles.button,
                    width: '100%',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => !loading && handleButtonHover(e, true)}
                  onMouseLeave={(e) => !loading && handleButtonHover(e, false)}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Support Options */}
        <div style={styles.supportGrid}>
          {[
            { icon: '💬', title: 'Live Chat', desc: 'Get instant help from our support team', gradient: gradients[3] },
            { icon: '📚', title: 'Help Center', desc: 'Browse our comprehensive documentation', gradient: gradients[4] },
            { icon: '👥', title: 'Community', desc: 'Connect with other learners and instructors', gradient: gradients[5] }
          ].map((item, index) => (
            <div key={index} style={styles.solidCard}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...styles.iconContainer, background: item.gradient, margin: '0 auto 20px' }}>
                  {item.icon}
                </div>
                <h3 style={{ ...styles.primaryText, fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                  {item.title}
                </h3>
                <p style={{ ...styles.secondaryText, fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
                <button 
                  style={styles.outlineButton}
                  onMouseEnter={(e) => handleButtonHover(e, true, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false, true)}
                >
                  {item.title === 'Live Chat' ? 'Start Chat' : 
                   item.title === 'Help Center' ? 'Visit Help Center' : 'Join Community'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Contact;