import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/dashboards/StudentsList.css';


const StudentsList = ({ courseId }) => {
  const { user } = useAuth();
  const { apiCall, loading } = useApi();
  const { theme } = useTheme();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortBy, setSortBy] = useState('enrollmentDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  // Memoize filtered and sorted students for performance
  const processedStudents = useMemo(() => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.courseName && student.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort students
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'enrollmentDate' || sortBy === 'lastAccessed') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortBy === 'progress') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [students, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    setFilteredStudents(processedStudents);
  }, [processedStudents]);

  const fetchStudents = async () => {
    try {
      const endpoint = courseId 
        ? `/instructor/${user.id}/courses/${courseId}/students`
        : `/instructor/${user.id}/students`;
      
      const response = await apiCall(endpoint, 'GET');
      
      if (response.success) {
        setStudents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const sendMessage = async (studentId) => {
    try {
      console.log('Send message to student:', studentId);
      // Implement messaging functionality
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const exportStudentData = () => {
    const csvContent = [
      ['Name', 'Email', 'Course', 'Enrollment Date', 'Progress', 'Last Accessed'],
      ...filteredStudents.map(student => [
        student.name,
        student.email,
        student.courseName || 'All Courses',
        new Date(student.enrollmentDate).toLocaleDateString(),
        `${student.progress}%`,
        new Date(student.lastAccessed).toLocaleDateString()
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    return 'progress-low';
  };

  const getStatusBadge = (lastAccessed) => {
    const daysSinceAccess = Math.floor((Date.now() - new Date(lastAccessed)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceAccess <= 1) {
      return <span className="status-badge status-active">Active</span>;
    } else if (daysSinceAccess <= 7) {
      return <span className="status-badge status-recent">Recent</span>;
    } else {
      return <span className="status-badge status-inactive">Inactive</span>;
    }
  };

  // Custom SearchBar component
  const CustomSearchBar = ({ value, onChange, placeholder }) => (
    <div className="search-container">
      <div className="search-icon">
        <svg className="search-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
    </div>
  );

  // Custom Button component
  const CustomButton = ({ children, variant = 'primary', onClick, className = '' }) => {
    return (
      <button
        onClick={onClick}
        className={`custom-btn custom-btn-${variant} ${className}`}
      >
        {children}
      </button>
    );
  };

  // Custom Loading component
  const CustomLoading = () => (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading...</span>
      </div>
    </div>
  );

  // Custom Modal component
  const CustomModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-backdrop" onClick={onClose}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{title}</h3>
              <button onClick={onClose} className="modal-close">
                <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };

  // Custom Pagination component
  const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-mobile">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
        <div className="pagination-desktop">
          <nav className="pagination-nav">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="pagination-arrow"
            >
              &#8249;
            </button>
            {pages.map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`pagination-number ${page === currentPage ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="pagination-arrow"
            >
              &#8250;
            </button>
          </nav>
        </div>
      </div>
    );
  };

  // Mobile card component for better mobile experience
  const MobileStudentCard = ({ student }) => (
    <div className="mobile-card">
      <div className="mobile-card-header">
        <img
          className="student-avatar"
          src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3B82F6&color=fff`}
          alt=""
          loading="lazy"
        />
        <div className="student-info">
          <h3 className="student-name">{student.name}</h3>
          <p className="student-email">{student.email}</p>
        </div>
        {getStatusBadge(student.lastAccessed)}
      </div>
      
      {!courseId && student.courseName && (
        <p className="student-course">
          <span className="course-label">Course:</span> {student.courseName}
        </p>
      )}
      
      <div className="progress-section">
        <div className="progress-label">
          <span className="progress-text">Progress:</span>
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${student.progress}%` }}
              ></div>
            </div>
            <span className={`progress-badge ${getProgressColor(student.progress)}`}>
              {student.progress}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="mobile-card-dates">
        <span>Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
        <span>Last active: {new Date(student.lastAccessed).toLocaleDateString()}</span>
      </div>
      
      <div className="mobile-card-actions">
        <button
          onClick={() => handleStudentClick(student)}
          className="action-btn action-btn-primary"
        >
          View Details
        </button>
        <button
          onClick={() => sendMessage(student.id)}
          className="action-btn action-btn-secondary"
        >
          Message
        </button>
      </div>
    </div>
  );

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  if (loading) return <CustomLoading />;

  return (
    <div className={`students-list ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <div className="students-header">
        <div className="header-content">
          <h2 className="page-title">
            {courseId ? 'Course Students' : 'All Students'}
            <span className="students-count">
              ({filteredStudents.length} total)
            </span>
          </h2>
          
          <div className="header-actions">
            <CustomButton variant="outline" onClick={exportStudentData}>
              {isMobile ? 'Export' : 'Export CSV'}
            </CustomButton>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="filters-container">
          <div className="search-wrapper">
            <CustomSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search students by name, email, or course..."
            />
          </div>
          
          <div className="sort-wrapper">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="sort-select"
            >
              <option value="enrollmentDate-desc">Newest First</option>
              <option value="enrollmentDate-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="progress-desc">Highest Progress</option>
              <option value="progress-asc">Lowest Progress</option>
              <option value="lastAccessed-desc">Recently Active</option>
              <option value="lastAccessed-asc">Least Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Display */}
      {currentStudents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-message">
            {searchTerm ? 'No students match your search.' : 'No students enrolled yet.'}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          {isMobile ? (
            <div className="mobile-cards-container">
              {currentStudents.map((student) => (
                <MobileStudentCard 
                  key={`${student.id}-${student.courseId || 'all'}`} 
                  student={student} 
                />
              ))}
            </div>
          ) : (
            /* Desktop Table View */
            <div className="table-container">
              <div className="table-wrapper">
                <table className="students-table">
                  <thead className="table-header">
                    <tr>
                      <th 
                        className={`table-th sortable ${sortBy === 'name' ? 'sorted' : ''}`}
                        onClick={() => handleSort('name')}
                      >
                        Student Name
                        {sortBy === 'name' && (
                          <span className="sort-indicator">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th className="table-th">Email</th>
                      {!courseId && (
                        <th className="table-th">Course</th>
                      )}
                      <th 
                        className={`table-th sortable ${sortBy === 'enrollmentDate' ? 'sorted' : ''}`}
                        onClick={() => handleSort('enrollmentDate')}
                      >
                        Enrolled
                        {sortBy === 'enrollmentDate' && (
                          <span className="sort-indicator">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className={`table-th sortable ${sortBy === 'progress' ? 'sorted' : ''}`}
                        onClick={() => handleSort('progress')}
                      >
                        Progress
                        {sortBy === 'progress' && (
                          <span className="sort-indicator">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th className="table-th">Status</th>
                      <th className="table-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {currentStudents.map((student) => (
                      <tr key={`${student.id}-${student.courseId || 'all'}`} className="table-row">
                        <td className="table-td">
                          <div className="student-cell">
                            <div className="avatar-container">
                              <img
                                className="table-avatar"
                                src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3B82F6&color=fff`}
                                alt=""
                                loading="lazy"
                              />
                            </div>
                            <div className="student-details">
                              <div className="table-student-name">
                                {student.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-td table-email">
                          {student.email}
                        </td>
                        {!courseId && (
                          <td className="table-td">
                            {student.courseName || 'Multiple Courses'}
                          </td>
                        )}
                        <td className="table-td table-date">
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </td>
                        <td className="table-td">
                          <div className="table-progress">
                            <div className="table-progress-bar">
                              <div
                                className="table-progress-fill"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <span className={`table-progress-badge ${getProgressColor(student.progress)}`}>
                              {student.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="table-td">
                          {getStatusBadge(student.lastAccessed)}
                        </td>
                        <td className="table-td">
                          <div className="table-actions">
                            <button
                              onClick={() => handleStudentClick(student)}
                              className="table-action-btn table-action-view"
                              aria-label={`View details for ${student.name}`}
                            >
                              View
                            </button>
                            <button
                              onClick={() => sendMessage(student.id)}
                              className="table-action-btn table-action-message"
                              aria-label={`Send message to ${student.name}`}
                            >
                              Message
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Student Details Modal */}
      <CustomModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedStudent(null);
        }}
        title="Student Details"
      >
        {selectedStudent && (
          <div className="modal-body">
            <div className="modal-student-header">
              <img
                className="modal-avatar"
                src={selectedStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=3B82F6&color=fff`}
                alt=""
                loading="lazy"
              />
              <div className="modal-student-info">
                <h3 className="modal-student-name">{selectedStudent.name}</h3>
                <p className="modal-student-email">{selectedStudent.email}</p>
              </div>
            </div>

            <div className="modal-details-grid">
              <div className="modal-section">
                <h4 className="modal-section-title">Enrollment Information</h4>
                <div className="modal-section-content">
                  <p className="modal-detail-item">
                    <span className="detail-label">Enrolled:</span> {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                  </p>
                  <p className="modal-detail-item">
                    <span className="detail-label">Last Accessed:</span> {new Date(selectedStudent.lastAccessed).toLocaleDateString()}
                  </p>
                  {selectedStudent.courseName && (
                    <p className="modal-detail-item">
                      <span className="detail-label">Course:</span> {selectedStudent.courseName}
                    </p>
                  )}
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Progress Information</h4>
                <div className="modal-section-content">
                  <p className="modal-detail-item">
                    <span className="detail-label">Overall Progress:</span> {selectedStudent.progress}%
                  </p>
                  <p className="modal-detail-item">
                    <span className="detail-label">Lessons Completed:</span> {selectedStudent.completedLessons || 0} / {selectedStudent.totalLessons || 0}
                  </p>
                  <p className="modal-detail-item">
                    <span className="detail-label">Time Spent:</span> {selectedStudent.timeSpent || '0h 0m'}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <CustomButton
                variant="outline"
                onClick={() => sendMessage(selectedStudent.id)}
              >
                Send Message
              </CustomButton>
              <CustomButton
                variant="primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedStudent(null);
                }}
              >
                Close
              </CustomButton>
            </div>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default StudentsList;