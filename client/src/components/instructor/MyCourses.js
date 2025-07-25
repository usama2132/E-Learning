import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useCourses from '../../hooks/useCourses';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import '../../styles/dashboards/CourseCard.css';
import '../../styles/dashboards/MyCourses.css';

const MyCourses = () => {
  const { user } = useAuth();
  const { getCoursesByInstructor, deleteCourse } = useCourses();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(6);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await getCoursesByInstructor(user.id);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteCourse(courseToDelete.id);
      setCourses(courses.filter(course => course.id !== courseToDelete.id));
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredAndSortedCourses = () => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      
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

      if (sortBy === 'enrollmentCount' || sortBy === 'price') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    return filtered;
  };

  const paginatedCourses = () => {
    const filtered = filteredAndSortedCourses();
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    return filtered.slice(indexOfFirstCourse, indexOfLastCourse);
  };

  const totalPages = Math.ceil(filteredAndSortedCourses().length / coursesPerPage);

  const getStatusBadge = (isPublished) => (
    <span className={`status-badge ${isPublished ? 'published' : 'draft'}`}>
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return <Loading message="Loading your courses..." />;
  }

  return (
    <div className="my-courses">
      <div className="my-courses-header">
        <div className="header-content">
          <h1>My Courses</h1>
          <p>Manage and track your course content</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/instructor/create-course')}
        >
          Create New Course
        </Button>
      </div>

      <div className="courses-controls">
        <div className="controls-left">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search courses..."
          />
          
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

        <div className="controls-right">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="updatedAt">Last Updated</option>
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
            <option value="enrollmentCount">Enrollments</option>
            <option value="price">Price</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="courses-stats">
        <div className="stat-card">
          <h3>Total Courses</h3>
          <span className="stat-value">{courses.length}</span>
        </div>
        <div className="stat-card">
          <h3>Published</h3>
          <span className="stat-value">
            {courses.filter(course => course.isPublished).length}
          </span>
        </div>
        <div className="stat-card">
          <h3>Drafts</h3>
          <span className="stat-value">
            {courses.filter(course => !course.isPublished).length}
          </span>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <span className="stat-value">
            {courses.reduce((total, course) => total + (course.enrollmentCount || 0), 0)}
          </span>
        </div>
      </div>

      {paginatedCourses().length === 0 ? (
        <div className="empty-state">
          {courses.length === 0 ? (
            <>
              <h2>No courses yet</h2>
              <p>Create your first course to get started teaching!</p>
              <Button
                variant="primary"
                onClick={() => navigate('/instructor/create-course')}
              >
                Create Your First Course
              </Button>
            </>
          ) : (
            <>
              <h2>No courses found</h2>
              <p>Try adjusting your search or filters</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="courses-grid">
            {paginatedCourses().map(course => (
              <div key={course.id} className="course-card instructor-course">
                <div className="course-thumbnail">
                  <img
                    src={course.thumbnail || '/placeholder-course.jpg'}
                    alt={course.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-course.jpg';
                    }}
                  />
                  <div className="course-overlay">
                    <div className="course-actions">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="course-content">
                  <div className="course-header">
                    <h3 className="course-title">
                      <Link to={`/instructor/courses/${course.id}`}>
                        {course.title}
                      </Link>
                    </h3>
                    {getStatusBadge(course.isPublished)}
                  </div>

                  <p className="course-description">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="course-meta">
                    <span className="course-category">{course.category}</span>
                    <span className="course-level">{course.level}</span>
                    <span className="course-duration">{course.duration}h</span>
                  </div>

                  <div className="course-stats">
                    <div className="stat">
                      <span className="stat-label">Students:</span>
                      <span className="stat-value">{course.enrollmentCount || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Rating:</span>
                      <span className="stat-value">
                        {course.averageRating ? `${course.averageRating.toFixed(1)}★` : 'N/A'}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Reviews:</span>
                      <span className="stat-value">{course.reviewCount || 0}</span>
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
                    <div className="course-dates">
                      <small>Updated: {formatDate(course.updatedAt)}</small>
                    </div>
                    
                    <div className="course-actions-footer">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => navigate(`/instructor/courses/${course.id}/analytics`)}
                      >
                        Analytics
                      </Button>
                      <Button
                        size="small"
                        variant="danger-outline"
                        onClick={() => handleDeleteCourse(course)}
                      >
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

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Course"
      >
        <div className="delete-modal-content">
          <p>
            Are you sure you want to delete "<strong>{courseToDelete?.title}</strong>"?
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
