import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';


const DashboardLayout = ({ children }) => {
  const { theme } = useTheme();
  const location = useLocation();
  
  // Responsive state management
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // CRITICAL: Enhanced toggle protection
  const toggleLockRef = useRef(false);
  const toggleTimeoutRef = useRef(null);
  const lastToggleTime = useRef(0);
  const componentMounted = useRef(true);
  
  // Calculate responsive breakpoints
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;
  const isDesktop = windowWidth > 1024;

  // FIXED: Enhanced resize handler with proper sidebar state management
 // FIXED: Enhanced resize handler with proper sidebar state management
const handleResize = useCallback(() => {
  if (!componentMounted.current) return;
  
  const newWidth = window.innerWidth;
  setWindowWidth(newWidth);
  
  // Force close sidebar on any resize event
  setSidebarOpen(false);
}, []);

  // Debounced resize handler
  useEffect(() => {
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  // Set initial sidebar state based on screen size
  // Set initial sidebar state - always start closed
useEffect(() => {
  setSidebarOpen(false);
}, []); // Always start with sidebar closed regardless of screen size // Remove dependency to prevent loops

  // FIXED: Completely rewritten sidebar toggle with better mobile handling
  const handleSidebarToggle = useCallback(() => {
    if (!componentMounted.current) return;
    
    const now = Date.now();
    const timeSinceLastToggle = now - lastToggleTime.current;
    
    // Protection against rapid toggling
    if (toggleLockRef.current || timeSinceLastToggle < 200) {
      console.log('Toggle blocked - too rapid:', {
        locked: toggleLockRef.current,
        timeSinceLastToggle,
        minDelay: 200
      });
      return;
    }

    // Update last toggle time immediately
    lastToggleTime.current = now;
    
    // Lock toggle temporarily
    toggleLockRef.current = true;
    
    // Clear any existing timeout
    if (toggleTimeoutRef.current) {
      clearTimeout(toggleTimeoutRef.current);
    }

    // FIXED: Enhanced toggle logic that properly handles mobile vs desktop
    setSidebarOpen(currentState => {
      const newState = !currentState;
      console.log('Sidebar toggle:', {
        from: currentState,
        to: newState,
        screenType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        timestamp: now
      });
      return newState;
    });

    // Unlock after delay - longer for mobile to prevent accidental double-taps
    const unlockDelay = isMobile ? 400 : 250;
    toggleTimeoutRef.current = setTimeout(() => {
      if (componentMounted.current) {
        toggleLockRef.current = false;
        console.log('Toggle unlocked after', unlockDelay, 'ms');
      }
    }, unlockDelay);

  }, [isMobile, isTablet]);

  // Handle escape key (mobile/tablet only)
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && sidebarOpen && !isDesktop) {
        console.log('Closing sidebar via Escape key');
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, isDesktop]);

  // Close sidebar on route change (mobile/tablet only)
  useEffect(() => {
    if (!isDesktop && sidebarOpen) {
      console.log('Closing sidebar due to route change');
      setSidebarOpen(false);
    }
  }, [location.pathname, isDesktop]);

  // Component cleanup
  useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
      if (toggleTimeoutRef.current) {
        clearTimeout(toggleTimeoutRef.current);
      }
    };
  }, []);

  // Check if current page should use dashboard layout
  const isDashboardPage = useCallback(() => {
    const dashboardPaths = [
      '/dashboard',
      '/admin',
      '/instructor',
      '/student',
      '/profile',
      '/my-learning',
      '/help',
      '/settings'
    ];
    
    return dashboardPaths.some(path => {
      if (path === '/dashboard') {
        return location.pathname === path || location.pathname.startsWith(path + '/');
      }
      return location.pathname.startsWith(path);
    });
  }, [location.pathname]);

  // FIXED: Enhanced sidebar close handler
  const handleSidebarClose = useCallback(() => {
    if (!componentMounted.current || toggleLockRef.current) {
      console.log('Sidebar close blocked - component unmounted or locked');
      return;
    }
    
    console.log('Sidebar close handler triggered');
    setSidebarOpen(false);
    
    // Brief lock to prevent immediate reopening
    toggleLockRef.current = true;
    setTimeout(() => {
      if (componentMounted.current) {
        toggleLockRef.current = false;
      }
    }, 300);
  }, []);

  // FIXED: Enhanced touch/swipe gestures for mobile with better detection
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const touchStartTimeRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (!isMobile && !isTablet) return;
    touchStartRef.current = e.targetTouches[0].clientX;
    touchStartTimeRef.current = Date.now();
  }, [isMobile, isTablet]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile && !isTablet) return;
    touchEndRef.current = e.targetTouches[0].clientX;
  }, [isMobile, isTablet]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile && !isTablet || !touchStartRef.current || !touchEndRef.current) return;
    
    const swipeDistance = touchStartRef.current - touchEndRef.current;
    const swipeTime = Date.now() - (touchStartTimeRef.current || 0);
    const minSwipeDistance = 80; // Increased for better detection
    const maxSwipeTime = 500; // Maximum time for a valid swipe
    
    // Only process swipes that are fast enough
    if (swipeTime > maxSwipeTime) {
      touchStartRef.current = null;
      touchEndRef.current = null;
      touchStartTimeRef.current = null;
      return;
    }
    
    // Right to left swipe (close sidebar)
    if (swipeDistance > minSwipeDistance && sidebarOpen) {
      console.log('Closing sidebar via right-to-left swipe gesture');
      setSidebarOpen(false);
    }
    // Left to right swipe (open sidebar) - only if swipe starts from left edge
    else if (swipeDistance < -minSwipeDistance && !sidebarOpen && touchStartRef.current < 50) {
      console.log('Opening sidebar via left-to-right swipe gesture');
      setSidebarOpen(true);
    }
    
    touchStartRef.current = null;
    touchEndRef.current = null;
    touchStartTimeRef.current = null;
  }, [isMobile, isTablet, sidebarOpen]);

  // If not a dashboard page, render children with public navbar
  if (!isDashboardPage()) {
    return (
      <>
        <Navbar 
          isDashboard={false}
          isMobile={isMobile}
          isTablet={isTablet}
          isDesktop={isDesktop}
        />
        <div style={{ 
          paddingTop: isMobile ? '60px' : '70px',
          minHeight: '100vh',
          backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc'
        }}>
          {children}
        </div>
      </>
    );
  }

  // Theme-based styles
  const isDark = theme === 'dark';
  
  const styles = {
    appLayout: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f8fafc' : '#1e293b',
      position: 'relative',
    },
    
    dashboardContainer: {
      display: 'flex',
      flex: 1,
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    },
    
    // FIXED: Improved sidebar container with better positioning
    sidebarContainer: (() => {
      if (isDesktop) {
        // Desktop: Normal document flow
        return {
          position: 'relative',
          width: sidebarOpen ? '280px' : '70px',
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 10,
          height: '100vh',
        };
      } else {
        // Mobile/Tablet: Fixed positioning with backdrop
        return {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          pointerEvents: sidebarOpen ? 'auto' : 'none',
          opacity: sidebarOpen ? 1 : 0,
          visibility: sidebarOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
        };
      }
    })(),
    
    // FIXED: Enhanced mobile backdrop overlay
    mobileBackdrop: (!isDesktop && sidebarOpen) ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 9998,
      opacity: sidebarOpen ? 1 : 0,
      transition: 'opacity 0.3s ease',
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
    } : {},
    
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      position: 'relative',
      zIndex: 1,
      minWidth: 0,
      width: '100%',
    },
    
    contentWrapper: {
      flex: 1,
      padding: isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem',
      width: '100%',
      minHeight: 0,
      position: 'relative',
      paddingTop: isMobile ? 'calc(1rem + 60px)' : isTablet ? 'calc(1.25rem + 70px)' : 'calc(1.5rem + 70px)',
    },
    
    footer: {
      background: isDark 
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.98) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.3)'}`,
      boxShadow: isDark 
        ? '0 -8px 32px rgba(0, 0, 0, 0.3)' 
        : '0 -8px 32px rgba(15, 23, 42, 0.1)',
      padding: isMobile ? '0.875rem 1rem' : '1rem 1.5rem',
      marginTop: 'auto',
      zIndex: 10,
      position: 'relative',
    },
    
    footerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: isMobile ? '0.75rem' : '0.8rem',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.75rem' : '0',
      textAlign: isMobile ? 'center' : 'left',
      width: '100%',
      padding: '0 1rem',
    },
    
    copyright: {
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: '500',
    },
    
    footerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      justifyContent: isMobile ? 'center' : 'flex-end',
      flexWrap: 'wrap',
    },
    
    footerLink: {
      color: isDark ? '#cbd5e1' : '#475569',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      fontSize: isMobile ? '0.75rem' : '0.8rem',
      fontWeight: '500',
      padding: '0.25rem 0.5rem',
      borderRadius: '6px',
    },
    
    footerSeparator: {
      color: isDark ? '#64748b' : '#94a3b8',
      fontWeight: '300',
    },
  };

  // Hover handlers for footer links
  const handleFooterLinkHover = (e, isHover) => {
    if (isHover) {
      e.target.style.color = '#667eea';
      e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
    } else {
      e.target.style.color = isDark ? '#cbd5e1' : '#475569';
      e.target.style.background = 'transparent';
    }
  };

  return (
    <div style={styles.appLayout}>
      {/* Enhanced Navbar - Fixed positioning on mobile */}
      <div style={{
        position: isMobile || isTablet ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      }}>
        <Navbar 
          isDashboard={true}
          onSidebarToggle={handleSidebarToggle}
          sidebarCollapsed={!sidebarOpen}
          mobileSidebarOpen={sidebarOpen && !isDesktop}
          isMobile={isMobile}
          isTablet={isTablet}
          isDesktop={isDesktop}
        />
      </div>

      {/* Dashboard Container */}
      <div 
        style={styles.dashboardContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* FIXED: Enhanced mobile backdrop for closing sidebar */}
        {!isDesktop && sidebarOpen && (
          <div 
            style={styles.mobileBackdrop}
            onClick={handleSidebarClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSidebarClose();
            }}
          />
        )}

        {/* Sidebar Container */}
        <div style={styles.sidebarContainer}>
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={handleSidebarClose}
            isMobile={isMobile}
            isTablet={isTablet}
            isDesktop={isDesktop}
            theme={theme}
          />
        </div>

        {/* Main Content Area */}
        <main style={styles.mainContent}>
          <div style={styles.contentWrapper}>
            {children}
          </div>

          {/* Dashboard Footer */}
          <footer style={styles.footer} role="contentinfo">
            <div style={styles.footerContent}>
              <div style={styles.footerLeft}>
                <span style={styles.copyright}>
                  © {new Date().getFullYear()} EduPlatform. All rights reserved.
                </span>
              </div>
              <div style={styles.footerRight}>
                <a 
                  href="/privacy" 
                  style={styles.footerLink}
                  aria-label="Privacy Policy"
                  onMouseEnter={(e) => handleFooterLinkHover(e, true)}
                  onMouseLeave={(e) => handleFooterLinkHover(e, false)}
                >
                  Privacy Policy
                </a>
                <span style={styles.footerSeparator} aria-hidden="true">•</span>
                <a 
                  href="/terms" 
                  style={styles.footerLink}
                  aria-label="Terms of Service"
                  onMouseEnter={(e) => handleFooterLinkHover(e, true)}
                  onMouseLeave={(e) => handleFooterLinkHover(e, false)}
                >
                  Terms of Service
                </a>
                <span style={styles.footerSeparator} aria-hidden="true">•</span>
                <a 
                  href="/help" 
                  style={styles.footerLink}
                  aria-label="Support"
                  onMouseEnter={(e) => handleFooterLinkHover(e, true)}
                  onMouseLeave={(e) => handleFooterLinkHover(e, false)}
                >
                  Support
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;