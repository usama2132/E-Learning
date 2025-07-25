import React, { useState, useEffect } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../student/CourseCard';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import '../../styles/dashboards/CourseManager.css';

const CourseManager = () => {
  const { user } = useAuth();
  const { courses, loading, error, fetchInstructorCourses, deleteCourse, updateCourseStatus } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(6);

  useEffect(() => {
    if (user?.id) {
      fetchInstructorCourses(user.id);
    }
  }, [user, fetchInstructorCourses]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      await updateCourseStatus(courseId, newStatus);
    } catch (error) {
      console.error('Error updating course status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="course-manager">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Manage Courses</h2>
          <Button 
            variant="primary"
            onClick={() => window.location.href = '/instructor/create-course'}
          >
            Create New Course
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search courses..."
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {currentCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'No courses match your filters.' 
              : 'You haven\'t created any courses yet.'
            }
          </div>
          {!searchTerm && statusFilter === 'all' && (
            <Button 
              variant="primary"
              onClick={() => window.location.href = '/instructor/create-course'}
            >
              Create Your First Course
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <CourseCard course={course} />
                
                {/* Course Actions */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    {getStatusBadge(course.status)}
                    <span className="text-sm text-gray-500">
                      {course.students?.length || 0} students
                    </span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/instructor/edit-course/${course.id}`}
                    >
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/instructor/course-analytics/${course.id}`}
                    >
                      Analytics
                    </Button>
                    
                    {course.status === 'draft' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(course.id, 'pending')}
                      >
                        Submit for Review
                      </Button>
                    )}
                    
                    {course.status === 'published' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusChange(course.id, 'draft')}
                      >
                        Unpublish
                      </Button>
                    )}
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCourse(null);
        }}
        title="Delete Course"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete "{selectedCourse?.title}"? 
            This action cannot be undone and will remove all course content and student enrollments.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedCourse(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteCourse(selectedCourse.id)}
            >
              Delete Course
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseManager;
