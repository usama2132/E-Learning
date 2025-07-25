import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Filter, Search, Calendar } from 'lucide-react';
import '../../styles/dashboards/AdminDashboard.css';
import '../../styles/dashboards/PendingCourses.css';

const PendingCourses = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      // API call to fetch pending courses
      const response = await fetch('/api/admin/courses/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPendingCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching pending courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setPendingCourses(prev => prev.filter(course => course.id !== courseId));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error approving course:', error);
    }
  };

  const handleReject = async (courseId, reason) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        setPendingCourses(prev => prev.filter(course => course.id !== courseId));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error rejecting course:', error);
    }
  };

  const filteredCourses = pendingCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && new Date(course.submittedAt) >= weekAgo;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="pending-courses">
        <div className="loading-spinner">Loading pending courses...</div>
      </div>
    );
  }

  return (
    <div className="pending-courses">
      <div className="page-header">
        <h2>Pending Course Approvals</h2>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Pending</option>
            <option value="recent">Recent (7 days)</option>
          </select>
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <h3>No pending courses</h3>
            <p>All courses have been reviewed</p>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card pending">
              <div className="course-thumbnail">
                <img src={course.thumbnail} alt={course.title} />
                <div className="course-duration">{course.duration}</div>
              </div>
              
              <div className="course-content">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <span className="category-tag">{course.category}</span>
                </div>
                
                <div className="instructor-info">
                  <img src={course.instructor.avatar} alt={course.instructor.name} />
                  <div>
                    <p className="instructor-name">{course.instructor.name}</p>
                    <p className="submission-date">
                      <Calendar size={14} />
                      Submitted {new Date(course.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="course-stats">
                  <span>{course.lessonsCount} lessons</span>
                  <span>₹{course.price}</span>
                </div>
                
                <div className="course-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowModal(true);
                    }}
                  >
                    <Eye size={16} />
                    Review
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(course.id)}
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(course.id, 'Quick rejection')}
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Review Modal */}
      {showModal && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content course-review-modal">
            <div className="modal-header">
              <h3>Review Course: {selectedCourse.title}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="course-preview">
                <img src={selectedCourse.thumbnail} alt={selectedCourse.title} />
                <div className="course-details">
                  <h4>{selectedCourse.title}</h4>
                  <p className="description">{selectedCourse.description}</p>
                  <div className="course-meta">
                    <span>Category: {selectedCourse.category}</span>
                    <span>Price: ₹{selectedCourse.price}</span>
                    <span>Duration: {selectedCourse.duration}</span>
                    <span>Lessons: {selectedCourse.lessonsCount}</span>
                  </div>
                </div>
              </div>
              
              <div className="instructor-details">
                <h5>Instructor Information</h5>
                <div className="instructor-card">
                  <img src={selectedCourse.instructor.avatar} alt={selectedCourse.instructor.name} />
                  <div>
                    <p><strong>{selectedCourse.instructor.name}</strong></p>
                    <p>Email: {selectedCourse.instructor.email}</p>
                    <p>Experience: {selectedCourse.instructor.experience}</p>
                    <p>Rating: {selectedCourse.instructor.rating}/5</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={() => handleApprove(selectedCourse.id)}
              >
                <Check size={16} />
                Approve Course
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  const reason = prompt('Please provide a reason for rejection:');
                  if (reason) {
                    handleReject(selectedCourse.id, reason);
                  }
                }}
              >
                <X size={16} />
                Reject Course
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingCourses;
