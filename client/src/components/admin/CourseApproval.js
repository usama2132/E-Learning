import React, { useState, useEffect } from 'react';

const CourseApproval = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [reviewNotes, setReviewNotes] = useState('');

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
          description: 'Complete React course covering hooks, context, and advanced patterns with modern development practices',
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
          description: 'Master data analysis with Python, pandas, matplotlib, and advanced visualization techniques',
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
          description: 'Create stunning mobile app interfaces with modern design principles and user experience best practices',
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
          reviewNotes: 'Content needs more practical examples and updated algorithms.',
          description: 'Introduction to machine learning concepts, algorithms, and implementations',
          duration: '12 hours',
          price: 129.99,
          thumbnail: 'https://via.placeholder.com/120x90/ff6b6b/ffffff?text=ML'
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
              reviewDate: new Date().toISOString()
            }
          : course
      ));
      
      setShowModal(false);
      setSelectedCourse(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating course status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        <div>Loading courses...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '32px',
            fontWeight: '700'
          }}>Course Approval Dashboard</h1>
          <p style={{
            margin: '0',
            fontSize: '16px',
            opacity: '0.9'
          }}>Review and manage course submissions</p>
        </div>

        {/* Filter Buttons */}
        <div style={{
          padding: '30px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: `All Courses (${courses.length})` },
            { key: 'pending', label: `Pending (${courses.filter(c => c.status === 'pending').length})` },
            { key: 'approved', label: `Approved (${courses.filter(c => c.status === 'approved').length})` },
            { key: 'rejected', label: `Rejected (${courses.filter(c => c.status === 'rejected').length})` }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: filter === key ? '#667eea' : '#f1f5f9',
                color: filter === key ? 'white' : '#475569',
                ...(filter !== key && {
                  ':hover': {
                    backgroundColor: '#e2e8f0'
                  }
                })
              }}
              onMouseEnter={(e) => {
                if (filter !== key) {
                  e.target.style.backgroundColor = '#e2e8f0';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== key) {
                  e.target.style.backgroundColor = '#f1f5f9';
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {filteredCourses.length > 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <th style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Course</th>
                    <th style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Instructor</th>
                    <th style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Category</th>
                    <th style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Submitted</th>
                    <th style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Status</th>
                    <th style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course, index) => (
                    <tr key={course.id} style={{
                      borderBottom: index < filteredCourses.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '20px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            style={{
                              width: '50px',
                              height: '38px',
                              borderRadius: '6px',
                              objectFit: 'cover'
                            }}
                          />
                          <div>
                            <h4 style={{
                              margin: '0 0 4px 0',
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#111827'
                            }}>{course.title}</h4>
                            <p style={{
                              margin: '0',
                              fontSize: '14px',
                              color: '#6b7280',
                              fontWeight: '500'
                            }}>${course.price} • {course.duration}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div>
                          <p style={{
                            margin: '0 0 4px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#111827'
                          }}>{course.instructor}</p>
                          <p style={{
                            margin: '0',
                            fontSize: '13px',
                            color: '#6b7280'
                          }}>{course.instructorEmail}</p>
                        </div>
                      </td>
                      <td style={{
                        padding: '20px',
                        fontSize: '14px',
                        color: '#374151'
                      }}>{course.category}</td>
                      <td style={{
                        padding: '20px',
                        fontSize: '14px',
                        color: '#374151'
                      }}>{new Date(course.submittedDate).toLocaleDateString()}</td>
                      <td style={{ padding: '20px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          backgroundColor: `${getStatusColor(course.status)}20`,
                          color: getStatusColor(course.status),
                          border: `1px solid ${getStatusColor(course.status)}40`
                        }}>
                          {course.status}
                        </span>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <button 
                            onClick={() => handleViewCourse(course)}
                            style={{
                              padding: '8px 16px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              backgroundColor: 'white',
                              color: '#374151',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f9fafb';
                              e.target.style.borderColor = '#9ca3af';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.borderColor = '#d1d5db';
                            }}
                          >
                            Review
                          </button>
                          {course.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleCourseAction(course.id, 'approved')}
                                style={{
                                  padding: '8px 16px',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleCourseAction(course.id, 'rejected')}
                                style={{
                                  padding: '8px 16px',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
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
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '2px dashed #d1d5db'
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '20px',
                color: '#6b7280'
              }}>No courses found</h3>
              <p style={{
                margin: '0',
                fontSize: '16px',
                color: '#9ca3af'
              }}>No courses match your current filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 30px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              borderRadius: '16px 16px 0 0'
            }}>
              <h2 style={{
                margin: '0',
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>Course Review</h2>
              <button style={{
                border: 'none',
                background: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                setShowModal(false);
                setSelectedCourse(null);
                setReviewNotes('');
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6b7280';
              }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '30px' }}>
              {/* Course Info */}
              <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px'
              }}>
                <img 
                  src={selectedCourse.thumbnail} 
                  alt={selectedCourse.title}
                  style={{
                    width: '100px',
                    height: '75px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827'
                  }}>{selectedCourse.title}</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {[
                      { label: 'Instructor', value: selectedCourse.instructor },
                      { label: 'Category', value: selectedCourse.category },
                      { label: 'Duration', value: selectedCourse.duration },
                      { label: 'Price', value: `$${selectedCourse.price}` }
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '4px'
                        }}>{label}</div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827'
                        }}>{value}</div>
                      </div>
                    ))}
                    <div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px'
                      }}>Status</div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        backgroundColor: `${getStatusColor(selectedCourse.status)}20`,
                        color: getStatusColor(selectedCourse.status),
                        border: `1px solid ${getStatusColor(selectedCourse.status)}40`
                      }}>
                        {selectedCourse.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827'
                }}>Description</h4>
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#6b7280',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>{selectedCourse.description}</p>
              </div>

              {/* Review Notes Input */}
              {selectedCourse.status === 'pending' && (
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>Review Notes</h4>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes here..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              )}

              {/* Previous Review Notes */}
              {selectedCourse.reviewNotes && (
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>Previous Review Notes</h4>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #fbbf24'
                  }}>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#92400e'
                    }}>{selectedCourse.reviewNotes}</p>
                    <small style={{
                      fontSize: '12px',
                      color: '#78350f'
                    }}>Reviewed: {new Date(selectedCourse.reviewDate).toLocaleString()}</small>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px 30px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              backgroundColor: '#f9fafb',
              borderRadius: '0 0 16px 16px'
            }}>
              {selectedCourse.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => handleCourseAction(selectedCourse.id, 'approved', reviewNotes)}
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      backgroundColor: loading ? '#9ca3af' : '#10b981',
                      color: 'white',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.target.style.backgroundColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.target.style.backgroundColor = '#10b981';
                    }}
                  >
                    {loading ? 'Processing...' : 'Approve'}
                  </button>
                  <button 
                    onClick={() => handleCourseAction(selectedCourse.id, 'rejected', reviewNotes)}
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      backgroundColor: loading ? '#9ca3af' : '#ef4444',
                      color: 'white',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.target.style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.target.style.backgroundColor = '#ef4444';
                    }}
                  >
                    {loading ? 'Processing...' : 'Reject'}
                  </button>
                  <button 
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '12px 24px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: '#667eea',
                    color: 'white',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseApproval;