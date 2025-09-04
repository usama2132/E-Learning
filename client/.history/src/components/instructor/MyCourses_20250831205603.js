import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import '../../styles/dashboards/MyCourses.css';
import { 
  Plus, 
  Edit3, 
  Eye, 
  BarChart3, 
  Trash2, 
  BookOpen, 
  Users, 
  Star, 
  Calendar,
  TrendingUp,
  Filter,
  ArrowUpDown
} from 'lucide-react';

const MyCourses = () => {
  const { user, getToken } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // FIXED: Get token from multiple sources
  const getTokenFromStorage = useCallback(() => {
    return getToken() || 
           localStorage.getItem('token') || 
           localStorage.getItem('lms_auth_token') ||
           localStorage.getItem('auth_token') ||
           sessionStorage.getItem('token');
  }, [getToken]);

  // FIXED: Proper API call with authentication
// Replace the makeAuthenticatedRequest function (lines 51-77) with:

const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
  const authToken = getTokenFromStorage();
  
  if (!authToken) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
        throw new Error('Session expired');
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return {}; // Return empty object if no JSON content
    }
  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw new Error('Invalid response format from server');
    }
    throw error;
  }
}, [getTokenFromStorage, navigate]);

  // FIXED: Fetch instructor courses from correct endpoint
  const fetchMyCourses = useCallback(async () => {
    try {
      setLoading(true);
      
      // FIXED: Use the correct backend endpoint
      const data = await makeAuthenticatedRequest('http://localhost:5000/api/courses/instructor/my-courses');
      
      if (data.success) {
        setCourses(data.data?.courses || []);
        console.log('✅ Instructor courses loaded:', data.data?.courses?.length || 0);
      } else {
        console.error('❌ Failed to fetch courses:', data.message);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setCourses([]);
      
      if (error.message.includes('Session expired')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest, navigate]);

  // Fetch courses on component mount
  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  // Delete course handlers
  const handleDeleteCourse = useCallback((course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!courseToDelete) return;

    try {
      setDeleteLoading(true);
      
      await makeAuthenticatedRequest(`http://localhost:5000/api/courses/${courseToDelete._id}`, {
        method: 'DELETE'
      });

      setCourses(prev => prev.filter(course => course._id !== courseToDelete._id));
      setShowDeleteModal(false);
      setCourseToDelete(null);
      console.log('✅ Course deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  }, [courseToDelete, makeAuthenticatedRequest]);

  // Memoized filtered and sorted courses
  const processedCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'published' && course.isPublished) ||
                           (statusFilter === 'draft' && !course.isPublished);
      
      return matchesSearch && matchesStatus;
    });

    // Sort courses
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortBy === 'totalStudents' || sortBy === 'price') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    return filtered;
  }, [courses, searchTerm, statusFilter, sortBy, sortOrder]);

  // Memoized paginated courses
  const paginatedCourses = useMemo(() => {
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    return processedCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  }, [processedCourses, currentPage, coursesPerPage]);

  // Memoized statistics
  const courseStats = useMemo(() => ({
    total: courses.length,
    published: courses.filter(course => course.isPublished).length,
    drafts: courses.filter(course => !course.isPublished).length,
    totalStudents: courses.reduce((total, course) => total + (course.totalEnrollments || 0), 0),
    totalRevenue: courses.reduce((total, course) => total + ((course.price || 0) * (course.totalEnrollments || 0)), 0)
  }), [courses]);

  const totalPages = Math.ceil(processedCourses.length / coursesPerPage);

  // Utility functions
  const getStatusBadge = useCallback((isPublished) => (
    <span className={`status-badge ${isPublished ? 'published' : 'draft'}`}>
      {isPublished ? 'Published' : 'Draft'}
    </span>
  ), []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  }, []);

  const formatCompactNumber = useCallback((num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  // Navigation handlers
  const handleCreateCourse = useCallback(() => {
    navigate('/instructor/create-course');
  }, [navigate]);

  const handleEditCourse = useCallback((courseId) => {
    navigate(`/instructor/courses/${courseId}/edit`);
  }, [navigate]);

  const handlePreviewCourse = useCallback((courseId) => {
    navigate(`/course/${courseId}`);
  }, [navigate]);

  const handleAnalytics = useCallback((courseId) => {
    navigate(`/instructor/courses/${courseId}/analytics`);
  }, [navigate]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  if (loading) {
    return <Loading message="Loading your courses..." />;
  }

  return (
    <div className={`my-courses-dashboard ${theme}`}>
      {/* Header Section */}
      <div className="my-courses-header">
        <div className="header-content">
          <div className="header-text">
            <h1>My Courses</h1>
            <p>Manage and track your course content</p>
          </div>
          <div className="header-stats">
            <div className="quick-stat">
              <span className="stat-number">{courseStats.total}</span>
              <span className="stat-label">Total Courses</span>
            </div>
            <div className="quick-stat">
              <span className="stat-number">{formatCompactNumber(courseStats.totalStudents)}</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateCourse}
          className="create-course-btn"
        >
          <Plus size={18} />
          Create Course
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="courses-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Courses</h3>
            <span className="stat-value">{courseStats.total}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon published">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Published</h3>
            <span className="stat-value">{courseStats.published}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon draft">
            <Edit3 size={24} />
          </div>
          <div className="stat-content">
            <h3>Drafts</h3>
            <span className="stat-value">{courseStats.drafts}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon students">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <span className="stat-value">{formatCompactNumber(courseStats.totalStudents)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>Revenue</h3>
            <span className="stat-value">{formatPrice(courseStats.totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="courses-controls">
        <div className="controls-left">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search courses..."
            className="course-search"
          />
          
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="controls-right">
          <div className="sort-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Date Created</option>
              <option value="title">Title</option>
              <option value="totalEnrollments">Enrollments</option>
              <option value="price">Price</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-order-btn"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown size={16} />
            </button>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <div className="grid-icon"></div>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <div className="list-icon"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {processedCourses.length > 0 && (
        <div className="results-info">
          <p>
            Showing {((currentPage - 1) * coursesPerPage) + 1}-{Math.min(currentPage * coursesPerPage, processedCourses.length)} of {processedCourses.length} courses
          </p>
        </div>
      )}

      {/* Courses Content */}
      {paginatedCourses.length === 0 ? (
        <div className="empty-state">
          {courses.length === 0 ? (
            <>
              <div className="empty-icon">
                <BookOpen size={64} />
              </div>
              <h2>No courses yet</h2>
              <p>Create your first course to get started teaching!</p>
              <Button
                variant="primary"
                onClick={handleCreateCourse}
                size="large"
              >
                <Plus size={18} />
                Create Your First Course
              </Button>
            </>
          ) : (
            <>
              <div className="empty-icon">
                <BookOpen size={64} />
              </div>
              <h2>No courses found</h2>
              <p>Try adjusting your search or filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className={`courses-container ${viewMode}`}>
            {paginatedCourses.map(course => (
              <div key={course._id} className="course-card">
                <div className="course-thumbnail">
                  <img
                    src={course.thumbnail?.url || '/placeholder-course.jpg'}
                    alt={course.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-course.jpg';
                    }}
                    loading="lazy"
                  />
                  <div className="course-overlay">
                    <div className="course-actions">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleEditCourse(course._id)}
                        title="Edit Course"
                      >
                        <Edit3 size={14} />
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handlePreviewCourse(course._id)}
                        title="Preview Course"
                      >
                        <Eye size={14} />
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="course-content">
                  <div className="course-header">
                    <h3 className="course-title">
                      <Link to={`/instructor/courses/${course._id}`}>
                        {course.title}
                      </Link>
                    </h3>
                    {getStatusBadge(course.isPublished)}
                  </div>

                  <p className="course-description">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="course-meta">
                    <span className="course-category">{course.category?.name || 'Uncategorized'}</span>
                    <span className="course-level">{course.level}</span>
                    {course.totalDuration && (
                      <span className="course-duration">{course.totalDuration}h</span>
                    )}
                  </div>

                  <div className="course-stats">
                    <div className="stat">
                      <Users size={14} />
                      <span>{course.totalEnrollments || 0}</span>
                    </div>
                    <div className="stat">
                      <Star size={14} />
                      <span>
                        {course.averageRating ? `${course.averageRating.toFixed(1)}` : 'N/A'}
                      </span>
                    </div>
                    <div className="stat">
                      <Calendar size={14} />
                      <span>{formatDate(course.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="course-pricing">
                    {course.discountPrice ? (
                      <>
                        <span className="discount-price">{formatPrice(course.discountPrice)}</span>
                        <span className="original-price">{formatPrice(course.price)}</span>
                      </>
                    ) : (
                      <span className="price">{formatPrice(course.price)}</span>
                    )}
                  </div>

                  <div className="course-footer">
                    <div className="course-actions-footer">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleAnalytics(course._id)}
                        title="View Analytics"
                      >
                        <BarChart3 size={14} />
                        Analytics
                      </Button>
                      <Button
                        size="small"
                        variant="danger-outline"
                        onClick={() => handleDeleteCourse(course)}
                        title="Delete Course"
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Course"
        className="delete-modal"
      >
        <div className="delete-modal-content">
          <div className="warning-icon">
            <Trash2 size={48} />
          </div>
          <h3>Are you sure?</h3>
          <p>
            You're about to delete "<strong>{courseToDelete?.title}</strong>".
          </p>
          <p className="warning-text">
            This action cannot be undone. All course content, student enrollments, 
            and associated data will be permanently removed.
          </p>
          
          <div className="modal-actions">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Course'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyCourses;