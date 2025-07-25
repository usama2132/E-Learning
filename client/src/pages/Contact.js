import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const gradientBg = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh'
  };

  const glassCard = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
  };

  const solidCard = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 20px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: '#667eea',
    boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)',
    transform: 'translateY(-2px)'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
    outline: 'none'
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 40px rgba(102, 126, 234, 0.6)'
  };

  const outlineButtonStyle = {
    background: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  const iconContainer = {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginBottom: '16px'
  };

  return (
    <div style={gradientBg}>
      <main style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: '20px',
              textShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-1px'
            }}>
              Get in Touch
            </h1>
            <p style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
            gap: '40px',
            alignItems: 'start'
          }}>
            {/* Contact Information */}
            <div style={{ ...glassCard, padding: '40px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '600', 
                color: 'white', 
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                Contact Information
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ 
                    ...iconContainer, 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                  }}>
                    📧
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                      Email
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>
                      support@learningplatform.com
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      info@learningplatform.com
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ 
                    ...iconContainer, 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                  }}>
                    📞
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                      Phone
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>
                      +1 (555) 123-4567
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Monday - Friday, 9AM - 6PM EST
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ 
                    ...iconContainer, 
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                  }}>
                    📍
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                      Address
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>
                      123 Learning Street
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
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
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                  Frequently Asked Questions
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                  Before reaching out, you might find your answer in our FAQ section.
                </p>
                <button style={outlineButtonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#667eea';
                    e.target.style.transform = 'translateY(0)';
                  }}>
                  View FAQ
                </button>
              </div>
            </div>
            
            {/* Contact Form */}
            <div style={{ ...solidCard, padding: '40px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '600', 
                color: '#2d3748', 
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                Send us a Message
              </h2>
              
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 20px',
                    fontSize: '32px'
                  }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)} 
                    style={outlineButtonStyle}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#667eea';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#667eea';
                      e.target.style.transform = 'translateY(0)';
                    }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '20px' 
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '8px' 
                      }}>
                        Full Name *
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
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
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                        onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Subject *
                    </label>
                    <input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
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
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: '120px'
                      }}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>
                  
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      ...buttonStyle,
                      width: '100%',
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => !loading && Object.assign(e.target.style, buttonHoverStyle)}
                    onMouseLeave={(e) => !loading && Object.assign(e.target.style, buttonStyle)}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional Support Options */}
          <div style={{ 
            marginTop: '60px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px' 
          }}>
            <div style={{ ...solidCard, padding: '40px', textAlign: 'center' }}>
              <div style={{ 
                ...iconContainer, 
                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                margin: '0 auto 20px'
              }}>
                💬
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
                Live Chat
              </h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                Get instant help from our support team
              </p>
              <button style={outlineButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#667eea';
                  e.target.style.transform = 'translateY(0)';
                }}>
                Start Chat
              </button>
            </div>
            
            <div style={{ ...solidCard, padding: '40px', textAlign: 'center' }}>
              <div style={{ 
                ...iconContainer, 
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                margin: '0 auto 20px'
              }}>
                📚
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
                Help Center
              </h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                Browse our comprehensive documentation
              </p>
              <button style={outlineButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#667eea';
                  e.target.style.transform = 'translateY(0)';
                }}>
                Visit Help Center
              </button>
            </div>
            
            <div style={{ ...solidCard, padding: '40px', textAlign: 'center' }}>
              <div style={{ 
                ...iconContainer, 
                background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                margin: '0 auto 20px'
              }}>
                👥
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
                Community
              </h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                Connect with other learners and instructors
              </p>
              <button style={outlineButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#667eea';
                  e.target.style.transform = 'translateY(0)';
                }}>
                Join Community
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;