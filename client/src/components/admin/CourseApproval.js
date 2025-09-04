import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const CourseApproval = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Get theme from context
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced theme configuration with better performance
  const themeConfig = {
    light: {
      bg: '#f8fafc',
      cardBg: '#ffffff',
      headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#111827',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      tableBg: '#f8fafc',
      hoverBg: '#f9fafb',
      modalOverlay: 'rgba(0, 0, 0, 0.5)',
      inputBg: '#ffffff',
      inputBorder: '#d1d5db',
      buttonSecondary: '#f1f5f9',
      buttonSecondaryText: '#475569',
      buttonSecondaryHover: '#e2e8f0',
      infoBg: '#f9fafb',
      reviewBg: '#fef3c7',
      reviewBorder: '#fbbf24',
      reviewText: '#92400e',
      reviewTextSecondary: '#78350f',
      footerBg: '#f9fafb',
      scrollbarTrack: '#f1f5f9',
      scrollbarThumb: '#cbd5e1',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      accent: '#667eea',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b'
    },
    dark: {
      bg: '#0f172a',
      cardBg: '#1e293b',
      headerBg: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#64748b',
      border: '#334155',
      borderLight: '#293548',
      tableBg: '#1e293b',
      hoverBg: '#334155',
      modalOverlay: 'rgba(0, 0, 0, 0.8)',
      inputBg: '#334155',
      inputBorder: '#475569',
      buttonSecondary: '#334155',
      buttonSecondaryText: '#cbd5e1',
      buttonSecondaryHover: '#475569',
      infoBg: '#334155',
      reviewBg: '#422006',
      reviewBorder: '#a16207',
      reviewText: '#fbbf24',
      reviewTextSecondary: '#f59e0b',
      footerBg: '#334155',
      scrollbarTrack: '#1e293b',
      scrollbarThumb: '#475569',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      accent: '#667eea',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b'
    }
  };

  const currentTheme = isDarkMode ? themeConfig.dark : themeConfig.light;

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    setLoading(true);
    try {
      const mockCourses = [
        {
          id: 1,
          title: 'Advanced React Development',
          instructor: 'John Doe',
          instructorEmail: 'john@example.com',
          category: 'Web Development',
          status: 'pending',
          submittedDate: '2024-01-15',
          description: 'Complete React course covering hooks, context, and advanced patterns with modern development practices. This comprehensive course will take you from intermediate to advanced React concepts.',
          duration: '10 hours',
          price: 99.99,
          thumbnail: 'https://via.placeholder.com/120x90/667eea/ffffff?text=React'
        },
        {
          id: 2,
          title: 'Python Data Analysis',
          instructor: 'Jane Smith',
          instructorEmail: 'jane@example.com',
          category: 'Data Science',
          status: 'pending',
          submittedDate: '2024-01-14',
          description: 'Master data analysis with Python, pandas, matplotlib, and advanced visualization techniques. Learn to work with real-world datasets and create meaningful insights.',
          duration: '8 hours',
          price: 79.99,
          thumbnail: 'https://via.placeholder.com/120x90/f093fb/ffffff?text=Python'
        },
        {
          id: 3,
          title: 'Mobile App Design',
          instructor: 'Mike Johnson',
          instructorEmail: 'mike@example.com',
          category: 'Design',
          status: 'approved',
          submittedDate: '2024-01-13',
          approvedDate: '2024-01-16',
          description: 'Create stunning mobile app interfaces with modern design principles and user experience best practices. Focus on iOS and Android design guidelines.',
          duration: '6 hours',
          price: 59.99,
          thumbnail: 'https://via.placeholder.com/120x90/06d6a0/ffffff?text=Design'
        },
        {
          id: 4,
          title: 'Machine Learning Fundamentals',
          instructor: 'Sarah Wilson',
          instructorEmail: 'sarah@example.com',
          category: 'AI/ML',
          status: 'rejected',
          submittedDate: '2024-01-12',
          reviewDate: '2024-01-14',
          reviewNotes: 'Content needs more practical examples and updated algorithms. Please include more hands-on projects and current industry practices.',
          description: 'Introduction to machine learning concepts, algorithms, and implementations using Python and popular ML libraries.',
          duration: '12 hours',
          price: 129.99,
          thumbnail: 'https://via.placeholder.com/120x90/ff6b6b/ffffff?text=ML'
        },
        {
          id: 5,
          title: 'Advanced JavaScript ES6+',
          instructor: 'Tom Brown',
          instructorEmail: 'tom@example.com',
          category: 'Web Development',
          status: 'pending',
          submittedDate: '2024-01-16',
          description: 'Deep dive into modern JavaScript features including ES6+, async/await, modules, and advanced concepts for professional development.',
          duration: '7 hours',
          price: 89.99,
          thumbnail: 'https://via.placeholder.com/120x90/f39c12/ffffff?text=JS'
        }
      ];
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseAction = async (courseId, action, notes = '') => {
    setLoading(true);
    try {
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { 
              ...course, 
              status: action,
              reviewNotes: notes,
              reviewDate: new Date().toISOString(),
              ...(action === 'approved' ? { approvedDate: new Date().toISOString() } : {})
            }
          : course
      ));
      
      setShowModal(false);
      setSelectedCourse(null);
      setReviewNotes('');
      
      console.log(`Course ${action} successfully!`);
    } catch (error) {
      console.error('Error updating course status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setReviewNotes(course.reviewNotes || '');
    setShowModal(true);
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return currentTheme.warning;
      case 'approved': return currentTheme.success;
      case 'rejected': return currentTheme.danger;
      default: return currentTheme.textMuted;
    }
  };

  // Enhanced CSS with better performance and responsive design
  const styles = `
    .course-approval-container {
      min-height: 100vh;
      background-color: ${currentTheme.bg};
      padding: 12px;
      transition: background-color 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .main-card {
      max-width: 1400px;
      margin: 0 auto;
      background-color: ${currentTheme.cardBg};
      border-radius: 12px;
      box-shadow: ${currentTheme.shadow};
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .header-section {
      background: ${currentTheme.headerBg};
      color: white;
      padding: 20px 30px;
      text-align: center;
    }

    .header-title {
      margin: 0 0 8px 0;
      font-size: clamp(24px, 4vw, 32px);
      font-weight: 700;
      line-height: 1.2;
    }

    .header-subtitle {
      margin: 0;
      font-size: clamp(14px, 2vw, 16px);
      opacity: 0.9;
      line-height: 1.4;
    }

    .stats-section {
      padding: 20px 30px;
      border-bottom: 1px solid ${currentTheme.border};
      background-color: ${currentTheme.infoBg};
      transition: all 0.2s ease;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      text-align: center;
    }

    .stat-card {
      padding: 12px;
      border-radius: 8px;
      background-color: ${currentTheme.cardBg};
      border: 1px solid ${currentTheme.border};
      transition: all 0.2s ease;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
      line-height: 1;
    }

    .stat-label {
      font-size: 12px;
      color: ${currentTheme.textSecondary};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1;
    }

    .filter-section {
      padding: 20px 30px;
      border-bottom: 1px solid ${currentTheme.border};
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .filter-button {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: clamp(12px, 2vw, 14px);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      background-color: ${currentTheme.buttonSecondary};
      color: ${currentTheme.buttonSecondaryText};
    }

    .filter-button.active {
      background-color: ${currentTheme.accent};
      color: white;
    }

    .filter-button:hover:not(.active) {
      background-color: ${currentTheme.buttonSecondaryHover};
    }

    .content-section {
      padding: 20px;
    }

    .table-container {
      background-color: ${currentTheme.cardBg};
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid ${currentTheme.border};
      transition: all 0.2s ease;
    }

    .desktop-table {
      width: 100%;
      border-collapse: collapse;
    }

    .table-header {
      background-color: ${currentTheme.tableBg};
      border-bottom: 2px solid ${currentTheme.border};
    }

    .table-header th {
      padding: 16px 20px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: ${currentTheme.textSecondary};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-row {
      border-bottom: 1px solid ${currentTheme.borderLight};
      transition: background-color 0.15s ease;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:hover {
      background-color: ${currentTheme.hoverBg};
    }

    .table-cell {
      padding: 20px;
      vertical-align: top;
    }

    .course-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .course-thumbnail {
      width: 50px;
      height: 38px;
      border-radius: 6px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .course-title {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: ${currentTheme.text};
      line-height: 1.4;
    }

    .course-meta {
      margin: 0;
      font-size: 14px;
      color: ${currentTheme.textSecondary};
      font-weight: 500;
    }

    .instructor-info {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 600;
      color: ${currentTheme.text};
    }

    .instructor-email {
      margin: 0;
      font-size: 13px;
      color: ${currentTheme.textSecondary};
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      border: 1px solid;
      display: inline-block;
    }

    .actions-container {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .action-button {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      border: none;
    }

    .review-button {
      border: 1px solid ${currentTheme.inputBorder};
      background-color: ${currentTheme.inputBg};
      color: ${currentTheme.textSecondary};
    }

    .review-button:hover {
      background-color: ${currentTheme.hoverBg};
    }

    .approve-button {
      background-color: ${currentTheme.success};
      color: white;
    }

    .approve-button:hover {
      background-color: #059669;
    }

    .reject-button {
      background-color: ${currentTheme.danger};
      color: white;
    }

    .reject-button:hover {
      background-color: #dc2626;
    }

    /* Mobile Card Styles */
    .mobile-cards {
      display: none;
    }

    .mobile-card {
      padding: 20px;
      border-bottom: 1px solid ${currentTheme.borderLight};
      background-color: ${currentTheme.cardBg};
      transition: all 0.2s ease;
    }

    .mobile-card:last-child {
      border-bottom: none;
    }

    .mobile-card-header {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .mobile-thumbnail {
      width: 60px;
      height: 45px;
      border-radius: 6px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .mobile-course-info {
      flex: 1;
      min-width: 0;
    }

    .mobile-title {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: ${currentTheme.text};
      line-height: 1.4;
    }

    .mobile-instructor {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: ${currentTheme.textSecondary};
    }

    .mobile-price {
      margin: 0;
      font-size: 12px;
      color: ${currentTheme.textMuted};
    }

    .mobile-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 16px;
      font-size: 12px;
    }

    .mobile-meta-item {
      color: ${currentTheme.textSecondary};
    }

    .mobile-meta-label {
      color: ${currentTheme.textMuted};
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background-color: ${currentTheme.infoBg};
      border-radius: 12px;
      border: 2px dashed ${currentTheme.border};
      transition: all 0.2s ease;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: ${currentTheme.textSecondary};
    }

    .empty-description {
      margin: 0;
      font-size: 16px;
      color: ${currentTheme.textMuted};
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${currentTheme.modalOverlay};
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
      transition: all 0.2s ease;
    }

    .modal-content {
      background-color: ${currentTheme.cardBg};
      border-radius: 16px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow: auto;
      box-shadow: ${isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'};
      transition: all 0.2s ease;
    }

    .modal-header {
      padding: 24px 30px;
      border-bottom: 1px solid ${currentTheme.border};
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      background-color: ${currentTheme.cardBg};
      border-radius: 16px 16px 0 0;
      z-index: 10;
    }

    .modal-title {
      margin: 0;
      font-size: clamp(20px, 4vw, 24px);
      font-weight: 700;
      color: ${currentTheme.text};
    }

    .close-button {
      border: none;
      background: none;
      font-size: 24px;
      cursor: pointer;
      color: ${currentTheme.textSecondary};
      padding: 4px;
      border-radius: 4px;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    }

    .close-button:hover {
      background-color: ${currentTheme.hoverBg};
      color: ${currentTheme.text};
    }

    .modal-body {
      padding: 30px;
    }

    .course-detail-card {
      display: flex;
      flex-direction: ${isMobile ? 'column' : 'row'};
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background-color: ${currentTheme.infoBg};
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .detail-thumbnail {
      width: ${isMobile ? '100%' : '100px'};
      height: ${isMobile ? '150px' : '75px'};
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .detail-info {
      flex: 1;
    }

    .detail-title {
      margin: 0 0 16px 0;
      font-size: clamp(18px, 4vw, 20px);
      font-weight: 700;
      color: ${currentTheme.text};
    }

    .detail-grid {
      display: grid;
      grid-template-columns: ${isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))'};
      gap: 12px;
    }

    .detail-item-label {
      font-size: 12px;
      font-weight: 600;
      color: ${currentTheme.textSecondary};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .detail-item-value {
      font-size: 14px;
      font-weight: 500;
      color: ${currentTheme.text};
    }

    .section-title {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: ${currentTheme.text};
    }

    .description-box {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: ${currentTheme.textSecondary};
      padding: 16px;
      background-color: ${currentTheme.infoBg};
      border-radius: 8px;
      border: 1px solid ${currentTheme.border};
      transition: all 0.2s ease;
    }

    .textarea-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid ${currentTheme.inputBorder};
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      transition: all 0.15s ease;
      background-color: ${currentTheme.inputBg};
      color: ${currentTheme.text};
      box-sizing: border-box;
    }

    .textarea-input:focus {
      border-color: ${currentTheme.accent};
    }

    .textarea-hint {
      font-size: 12px;
      color: ${currentTheme.textMuted};
      margin-top: 8px;
    }

    .review-notes-box {
      padding: 16px;
      background-color: ${currentTheme.reviewBg};
      border-radius: 8px;
      border: 1px solid ${currentTheme.reviewBorder};
      transition: all 0.2s ease;
    }

    .review-notes-text {
      margin: 0 0 8px 0;
      font-size: 14px;
      line-height: 1.6;
      color: ${currentTheme.reviewText};
    }

    .review-notes-date {
      font-size: 12px;
      color: ${currentTheme.reviewTextSecondary};
    }

    .submission-details {
      display: grid;
      grid-template-columns: ${isMobile ? '1fr' : 'repeat(2, 1fr)'};
      gap: 16px;
      padding: 16px;
      background-color: ${currentTheme.infoBg};
      border-radius: 8px;
      border: 1px solid ${currentTheme.border};
    }

    .modal-footer {
      padding: 24px 30px;
      border-top: 1px solid ${currentTheme.border};
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      flex-wrap: wrap;
      background-color: ${currentTheme.footerBg};
      border-radius: 0 0 16px 16px;
      transition: all 0.2s ease;
      position: sticky;
      bottom: 0;
    }

    .footer-button {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      min-width: fit-content;
      display: flex;
      align-items: center;
      gap: 8px;
      border: none;
    }

    .footer-button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .primary-button {
      background-color: ${currentTheme.success};
      color: white;
    }

    .primary-button:hover:not(:disabled) {
      background-color: #059669;
    }

    .danger-button {
      background-color: ${currentTheme.danger};
      color: white;
    }

    .danger-button:hover:not(:disabled) {
      background-color: #dc2626;
    }

    .secondary-button {
      border: 1px solid ${currentTheme.inputBorder};
      background-color: ${currentTheme.inputBg};
      color: ${currentTheme.textSecondary};
    }

    .secondary-button:hover:not(:disabled) {
      background-color: ${currentTheme.hoverBg};
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff40;
      border-top: 2px solid #ffffff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50vh;
      font-size: 18px;
      color: ${currentTheme.textSecondary};
      background-color: ${currentTheme.bg};
      transition: all 0.2s ease;
    }

    .loading-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .loading-spinner-large {
      width: 20px;
      height: 20px;
      border: 2px solid ${currentTheme.textMuted};
      border-top: 2px solid ${currentTheme.textSecondary};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .desktop-table {
        display: none;
      }

      .mobile-cards {
        display: block;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .filter-section {
        padding: 15px 20px;
      }

      .filter-button {
        padding: 8px 12px;
        font-size: 12px;
      }

      .content-section {
        padding: 15px;
      }

      .header-section {
        padding: 15px 20px;
      }

      .stats-section {
        padding: 15px 20px;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 20px;
      }

      .modal-footer {
        flex-direction: column;
      }

      .footer-button {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .course-approval-container {
        padding: 8px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filter-section {
        padding: 12px 15px;
        gap: 6px;
      }

      .filter-button {
        padding: 6px 10px;
        font-size: 11px;
      }

      .mobile-card {
        padding: 15px;
      }

      .modal-content {
        margin: 10px;
        max-height: calc(100vh - 20px);
      }
    }

    /* Animations */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .main-card {
      animation: fadeIn 0.3s ease-out;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: ${currentTheme.scrollbarTrack};
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background: ${currentTheme.scrollbarThumb};
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${isDarkMode ? '#64748b' : '#9ca3af'};
    }

    /* Performance optimizations */
    * {
      box-sizing: border-box;
    }

    .table-row,
    .mobile-card,
    .filter-button,
    .action-button {
      will-change: background-color;
    }
  `;

  if (loading && courses.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            Loading courses...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="course-approval-container">
        <div className="main-card">
          {/* Header */}
          <div className="header-section">
            <h1 className="header-title">Course Approval Dashboard</h1>
            <p className="header-subtitle">Review and manage course submissions</p>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stats-grid">
              {[
                { label: 'Total Courses', value: courses.length, color: currentTheme.accent },
                { label: 'Pending', value: courses.filter(c => c.status === 'pending').length, color: currentTheme.warning },
                { label: 'Approved', value: courses.filter(c => c.status === 'approved').length, color: currentTheme.success },
                { label: 'Rejected', value: courses.filter(c => c.status === 'rejected').length, color: currentTheme.danger }
              ].map(({ label, value, color }) => (
                <div key={label} className="stat-card">
                  <div className="stat-value" style={{ color }}>{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="filter-section">
            {[
              { key: 'all', label: `All (${courses.length})` },
              { key: 'pending', label: `Pending (${courses.filter(c => c.status === 'pending').length})` },
              { key: 'approved', label: `Approved (${courses.filter(c => c.status === 'approved').length})` },
              { key: 'rejected', label: `Rejected (${courses.filter(c => c.status === 'rejected').length})` }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`filter-button ${filter === key ? 'active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="content-section">
            {filteredCourses.length > 0 ? (
              <div className="table-container">
                {/* Desktop Table View */}
                <table className="desktop-table">
                  <thead className="table-header">
                    <tr>
                      {['Course', 'Instructor', 'Category', 'Submitted', 'Status', 'Actions'].map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="table-row">
                        <td className="table-cell">
                          <div className="course-info">
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="course-thumbnail"
                              loading="lazy"
                            />
                            <div>
                              <h4 className="course-title">{course.title}</h4>
                              <p className="course-meta">${course.price} • {course.duration}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div>
                            <p className="instructor-info">{course.instructor}</p>
                            <p className="instructor-email">{course.instructorEmail}</p>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>
                            {course.category}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>
                            {new Date(course.submittedDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span 
                            className="status-badge"
                            style={{
                              backgroundColor: `${getStatusColor(course.status)}20`,
                              color: getStatusColor(course.status),
                              borderColor: `${getStatusColor(course.status)}40`
                            }}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="actions-container">
                            <button 
                              onClick={() => handleViewCourse(course)}
                              className="action-button review-button"
                            >
                              Review
                            </button>
                            {course.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleCourseAction(course.id, 'approved')}
                                  className="action-button approve-button"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleCourseAction(course.id, 'rejected')}
                                  className="action-button reject-button"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="mobile-cards">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="mobile-card">
                      <div className="mobile-card-header">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          className="mobile-thumbnail"
                          loading="lazy"
                        />
                        <div className="mobile-course-info">
                          <h4 className="mobile-title">{course.title}</h4>
                          <p className="mobile-instructor">{course.instructor}</p>
                          <p className="mobile-price">${course.price} • {course.duration}</p>
                        </div>
                        <span 
                          className="status-badge"
                          style={{
                            backgroundColor: `${getStatusColor(course.status)}20`,
                            color: getStatusColor(course.status),
                            borderColor: `${getStatusColor(course.status)}40`,
                            height: 'fit-content'
                          }}
                        >
                          {course.status}
                        </span>
                      </div>
                      
                      <div className="mobile-meta-grid">
                        <div className="mobile-meta-item">
                          <span className="mobile-meta-label">Category: </span>
                          <span>{course.category}</span>
                        </div>
                        <div className="mobile-meta-item">
                          <span className="mobile-meta-label">Submitted: </span>
                          <span>{new Date(course.submittedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="actions-container">
                        <button 
                          onClick={() => handleViewCourse(course)}
                          className="action-button review-button"
                        >
                          Review
                        </button>
                        {course.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleCourseAction(course.id, 'approved')}
                              className="action-button approve-button"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleCourseAction(course.id, 'rejected')}
                              className="action-button reject-button"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3 className="empty-title">No courses found</h3>
                <p className="empty-description">No courses match your current filter criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedCourse && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="modal-header">
                <h2 className="modal-title">Course Review</h2>
                <button 
                  className="close-button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCourse(null);
                    setReviewNotes('');
                  }}
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="modal-body">
                {/* Course Info */}
                <div className="course-detail-card">
                  <img 
                    src={selectedCourse.thumbnail} 
                    alt={selectedCourse.title}
                    className="detail-thumbnail"
                    loading="lazy"
                  />
                  <div className="detail-info">
                    <h3 className="detail-title">{selectedCourse.title}</h3>
                    <div className="detail-grid">
                      {[
                        { label: 'Instructor', value: selectedCourse.instructor },
                        { label: 'Category', value: selectedCourse.category },
                        { label: 'Duration', value: selectedCourse.duration },
                        { label: 'Price', value: `${selectedCourse.price}` }
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div className="detail-item-label">{label}</div>
                          <div className="detail-item-value">{value}</div>
                        </div>
                      ))}
                      <div>
                        <div className="detail-item-label">Status</div>
                        <span 
                          className="status-badge"
                          style={{
                            backgroundColor: `${getStatusColor(selectedCourse.status)}20`,
                            color: getStatusColor(selectedCourse.status),
                            borderColor: `${getStatusColor(selectedCourse.status)}40`
                          }}
                        >
                          {selectedCourse.status}
                        </span>
                      </div>
                      {selectedCourse.approvedDate && (
                        <div>
                          <div className="detail-item-label">Approved Date</div>
                          <div className="detail-item-value">
                            {new Date(selectedCourse.approvedDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '30px' }}>
                  <h4 className="section-title">Course Description</h4>
                  <p className="description-box">{selectedCourse.description}</p>
                </div>

                {/* Review Notes Input */}
                {selectedCourse.status === 'pending' && (
                  <div style={{ marginBottom: '30px' }}>
                    <h4 className="section-title">Review Notes</h4>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add your review notes here... (optional)"
                      rows="4"
                      className="textarea-input"
                    />
                    <div className="textarea-hint">
                      These notes will be sent to the instructor along with your decision.
                    </div>
                  </div>
                )}

                {/* Previous Review Notes */}
                {selectedCourse.reviewNotes && (
                  <div style={{ marginBottom: '30px' }}>
                    <h4 className="section-title">Previous Review Notes</h4>
                    <div className="review-notes-box">
                      <p className="review-notes-text">{selectedCourse.reviewNotes}</p>
                      <small className="review-notes-date">
                        Reviewed: {new Date(selectedCourse.reviewDate).toLocaleString()}
                      </small>
                    </div>
                  </div>
                )}

                {/* Additional Course Details */}
                <div style={{ marginBottom: '30px' }}>
                  <h4 className="section-title">Submission Details</h4>
                  <div className="submission-details">
                    <div>
                      <div className="detail-item-label">Instructor Email</div>
                      <div className="detail-item-value">{selectedCourse.instructorEmail}</div>
                    </div>
                    <div>
                      <div className="detail-item-label">Submitted Date</div>
                      <div className="detail-item-value">
                        {new Date(selectedCourse.submittedDate).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                {selectedCourse.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleCourseAction(selectedCourse.id, 'approved', reviewNotes)}
                      disabled={loading}
                      className="footer-button primary-button"
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner"></div>
                          Processing...
                        </>
                      ) : (
                        <>✓ Approve</>
                      )}
                    </button>
                    <button 
                      onClick={() => handleCourseAction(selectedCourse.id, 'rejected', reviewNotes)}
                      disabled={loading}
                      className="footer-button danger-button"
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner"></div>
                          Processing...
                        </>
                      ) : (
                        <>✕ Reject</>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setShowModal(false);
                        setSelectedCourse(null);
                        setReviewNotes('');
                      }}
                      disabled={loading}
                      className="footer-button secondary-button"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setShowModal(false);
                      setSelectedCourse(null);
                      setReviewNotes('');
                    }}
                    className="footer-button"
                    style={{
                      backgroundColor: currentTheme.accent,
                      color: 'white'
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CourseApproval;