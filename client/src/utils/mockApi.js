// Create this file: src/utils/mockApi.js
// This will simulate a backend server for testing all dashboards

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// Mock user data for different roles
const MOCK_USERS = {
  student: {
    id: 1,
    email: 'student@test.com',
    password: 'password123',
    name: 'John Student',
    role: 'student',
    avatar: '/images/student-avatar.jpg',
    enrolledCourses: 3,
    completedCourses: 1,
    phone: '+1-234-567-8901',
    dateJoined: '2024-01-15',
    bio: 'Passionate learner interested in web development and data science.',
    location: 'New York, USA'
  },
  instructor: {
    id: 2,
    email: 'instructor@test.com',
    password: 'password123',
    name: 'Sarah Instructor',
    role: 'instructor',
    avatar: '/images/instructor-avatar.jpg',
    coursesCreated: 5,
    totalStudents: 150,
    totalEarnings: 2500,
    phone: '+1-234-567-8902',
    dateJoined: '2023-06-10',
    bio: 'Experienced developer with 8+ years in full-stack development.',
    location: 'San Francisco, USA',
    expertise: ['React', 'Node.js', 'Python', 'Machine Learning']
  },
  admin: {
    id: 3,
    email: 'admin@test.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin',
    avatar: '/images/admin-avatar.jpg',
    totalUsers: 500,
    totalCourses: 100,
    platformRevenue: 50000,
    phone: '+1-234-567-8903',
    dateJoined: '2022-01-01',
    bio: 'Platform administrator ensuring smooth operations.',
    location: 'Remote'
  }
};

// Mock courses data
const MOCK_COURSES = [
  {
    id: 1,
    title: 'React Fundamentals',
    description: 'Learn the basics of React.js from scratch',
    price: 99,
    instructor: 'Sarah Instructor',
    instructorId: 2,
    category: 'Web Development',
    level: 'Beginner',
    rating: 4.5,
    students: 45,
    duration: '8 hours',
    thumbnail: '/images/react-course.jpg',
    status: 'published',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    lessons: 24,
    language: 'English',
    prerequisites: 'Basic HTML & CSS',
    learningOutcomes: ['Understand React components', 'Build interactive UIs', 'Manage state with hooks']
  },
  {
    id: 2,
    title: 'Node.js Advanced',
    description: 'Advanced Node.js concepts and best practices',
    price: 149,
    instructor: 'Sarah Instructor',
    instructorId: 2,
    category: 'Backend Development',
    level: 'Advanced',
    rating: 4.8,
    students: 32,
    duration: '12 hours',
    thumbnail: '/images/nodejs-course.jpg',
    status: 'published',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-05',
    lessons: 36,
    language: 'English',
    prerequisites: 'Basic Node.js knowledge',
    learningOutcomes: ['Master async programming', 'Build scalable APIs', 'Implement security best practices']
  },
  {
    id: 3,
    title: 'Python for Beginners',
    description: 'Complete Python programming course for beginners',
    price: 79,
    instructor: 'John Teacher',
    instructorId: 4,
    category: 'Programming',
    level: 'Beginner',
    rating: 4.3,
    students: 67,
    duration: '15 hours',
    thumbnail: '/images/python-course.jpg',
    status: 'published',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-25',
    lessons: 42,
    language: 'English',
    prerequisites: 'No prior programming experience',
    learningOutcomes: ['Learn Python syntax', 'Build projects', 'Understand OOP concepts']
  },
  {
    id: 4,
    title: 'Machine Learning Basics',
    description: 'Introduction to machine learning concepts',
    price: 199,
    instructor: 'Sarah Instructor',
    instructorId: 2,
    category: 'Data Science',
    level: 'Intermediate',
    rating: 4.7,
    students: 28,
    duration: '20 hours',
    thumbnail: '/images/ml-course.jpg',
    status: 'pending',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-12',
    lessons: 48,
    language: 'English',
    prerequisites: 'Basic Python knowledge',
    learningOutcomes: ['Understand ML algorithms', 'Work with datasets', 'Build predictive models']
  }
];

// Mock analytics data
const MOCK_ANALYTICS = {
  instructor: {
    totalEarnings: 2847,
    monthlyEarnings: 450,
    totalStudents: 150,
    newStudents: 12,
    courseViews: 1250,
    completionRate: 78,
    averageRating: 4.6,
    earningsData: [
      { month: 'Jan', earnings: 400 },
      { month: 'Feb', earnings: 600 },
      { month: 'Mar', earnings: 450 },
      { month: 'Apr', earnings: 750 },
      { month: 'May', earnings: 520 },
      { month: 'Jun', earnings: 680 }
    ],
    studentProgressData: [
      { course: 'React Fundamentals', completed: 35, inProgress: 10 },
      { course: 'Node.js Advanced', completed: 24, inProgress: 8 },
      { course: 'ML Basics', completed: 18, inProgress: 10 }
    ]
  },
  admin: {
    totalUsers: 1250,
    totalCourses: 156,
    totalRevenue: 125000,
    monthlyRevenue: 15000,
    activeUsers: 850,
    newRegistrations: 45,
    platformStats: {
      userGrowth: [
        { month: 'Jan', users: 800 },
        { month: 'Feb', users: 920 },
        { month: 'Mar', users: 1050 },
        { month: 'Apr', users: 1150 },
        { month: 'May', users: 1200 },
        { month: 'Jun', users: 1250 }
      ],
      revenueData: [
        { month: 'Jan', revenue: 8500 },
        { month: 'Feb', revenue: 11200 },
        { month: 'Mar', revenue: 13800 },
        { month: 'Apr', revenue: 16500 },
        { month: 'May', revenue: 14200 },
        { month: 'Jun', revenue: 15000 }
      ],
      categoryDistribution: [
        { category: 'Web Development', count: 45 },
        { category: 'Data Science', count: 32 },
        { category: 'Mobile Development', count: 28 },
        { category: 'Design', count: 25 },
        { category: 'Business', count: 26 }
      ]
    }
  }
};

// Mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Course Enrollment',
    message: 'You have been enrolled in React Fundamentals',
    type: 'success',
    read: false,
    createdAt: '2024-02-15T10:30:00Z'
  },
  {
    id: 2,
    title: 'Assignment Due',
    message: 'Your assignment for Node.js Advanced is due tomorrow',
    type: 'warning',
    read: false,
    createdAt: '2024-02-14T15:45:00Z'
  },
  {
    id: 3,
    title: 'Course Completed',
    message: 'Congratulations! You completed Python for Beginners',
    type: 'success',
    read: true,
    createdAt: '2024-02-13T09:20:00Z'
  }
];

// Mock transactions
const MOCK_TRANSACTIONS = [
  {
    id: 'txn_001',
    userId: 1,
    courseId: 1,
    amount: 99,
    status: 'completed',
    paymentMethod: 'credit_card',
    createdAt: '2024-02-10T14:30:00Z',
    courseName: 'React Fundamentals'
  },
  {
    id: 'txn_002',
    userId: 1,
    courseId: 2,
    amount: 149,
    status: 'completed',
    paymentMethod: 'paypal',
    createdAt: '2024-02-12T11:15:00Z',
    courseName: 'Node.js Advanced'
  },
  {
    id: 'txn_003',
    userId: 5,
    courseId: 3,
    amount: 79,
    status: 'pending',
    paymentMethod: 'credit_card',
    createdAt: '2024-02-14T16:45:00Z',
    courseName: 'Python for Beginners'
  }
];

// Mock API responses
export const mockAPI = {
  auth: {
    login: async (credentials) => {
      await delay(1000);
      
      const { email, password } = credentials;
      
      // Find user by email
      const user = Object.values(MOCK_USERS).find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.password !== password) {
        throw new Error('Invalid password');
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword,
        token: `mock-token-${user.role}-${Date.now()}`,
        message: 'Login successful'
      };
    },

    register: async (userData) => {
      await delay(1000);
      
      // Simulate registration
      const newUser = {
        id: Date.now(),
        ...userData,
        role: userData.role || 'student',
        avatar: '/images/default-avatar.jpg',
        dateJoined: new Date().toISOString().split('T')[0]
      };
      
      const { password, ...userWithoutPassword } = newUser;
      
      return {
        success: true,
        user: userWithoutPassword,
        token: `mock-token-${newUser.role}-${Date.now()}`,
        message: 'Registration successful'
      };
    },

    verifyToken: async (token) => {
      await delay(500);
      
      if (!token || !token.startsWith('mock-token-')) {
        return { success: false, message: 'Invalid token' };
      }
      
      // Extract role from token
      const role = token.split('-')[2];
      const user = MOCK_USERS[role];
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      const { password, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword
      };
    },

    forgotPassword: async ({ email }) => {
      await delay(1000);
      return {
        success: true,
        message: 'Password reset email sent (mock)'
      };
    },

    resetPassword: async ({ token, password }) => {
      await delay(1000);
      return {
        success: true,
        message: 'Password reset successful (mock)'
      };
    }
  },

  users: {
    getProfile: async () => {
      await delay(500);
      return {
        success: true,
        user: MOCK_USERS.student
      };
    },

    updateProfile: async (profileData) => {
      await delay(800);
      return {
        success: true,
        user: { ...MOCK_USERS.student, ...profileData },
        message: 'Profile updated successfully'
      };
    },

    getAllUsers: async (params = {}) => {
      await delay(600);
      const users = Object.values(MOCK_USERS).map(({ password, ...user }) => user);
      
      return {
        success: true,
        users,
        total: users.length,
        page: params.page || 1,
        totalPages: Math.ceil(users.length / (params.limit || 10))
      };
    },

    deleteUser: async (userId) => {
      await delay(500);
      return {
        success: true,
        message: 'User deleted successfully'
      };
    }
  },

  courses: {
    getCourses: async (params = {}) => {
      await delay(800);
      let courses = [...MOCK_COURSES];
      
      // Filter by status if specified
      if (params.status) {
        courses = courses.filter(course => course.status === params.status);
      }
      
      return {
        success: true,
        courses,
        total: courses.length,
        page: params.page || 1,
        totalPages: Math.ceil(courses.length / (params.limit || 10))
      };
    },

    getCourseById: async (courseId) => {
      await delay(600);
      const course = MOCK_COURSES.find(c => c.id === parseInt(courseId));
      
      if (!course) {
        throw new Error('Course not found');
      }
      
      return {
        success: true,
        course
      };
    },

    createCourse: async (courseData) => {
      await delay(1200);
      const newCourse = {
        id: Date.now(),
        ...courseData,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
        students: 0,
        rating: 0
      };
      
      return {
        success: true,
        course: newCourse,
        message: 'Course created successfully'
      };
    },

    updateCourse: async (courseId, courseData) => {
      await delay(1000);
      return {
        success: true,
        course: { id: courseId, ...courseData },
        message: 'Course updated successfully'
      };
    },

    deleteCourse: async (courseId) => {
      await delay(500);
      return {
        success: true,
        message: 'Course deleted successfully'
      };
    },

    approveCourse: async (courseId) => {
      await delay(600);
      return {
        success: true,
        message: 'Course approved successfully'
      };
    },

    rejectCourse: async (courseId, reason) => {
      await delay(600);
      return {
        success: true,
        message: 'Course rejected'
      };
    },

    getInstructorCourses: async (instructorId) => {
      await delay(700);
      const instructorCourses = MOCK_COURSES.filter(c => c.instructorId === instructorId);
      
      return {
        success: true,
        courses: instructorCourses
      };
    },

    getEnrolledCourses: async (userId) => {
      await delay(600);
      // Return first 2 courses as enrolled for demo
      const enrolledCourses = MOCK_COURSES.slice(0, 2).map(course => ({
        ...course,
        progress: Math.floor(Math.random() * 100),
        enrolledAt: '2024-02-01',
        lastAccessed: '2024-02-14'
      }));
      
      return {
        success: true,
        courses: enrolledCourses
      };
    }
  },

  analytics: {
    getInstructorAnalytics: async (instructorId) => {
      await delay(900);
      return {
        success: true,
        analytics: MOCK_ANALYTICS.instructor
      };
    },

    getAdminAnalytics: async () => {
      await delay(900);
      return {
        success: true,
        analytics: MOCK_ANALYTICS.admin
      };
    },

    getPlatformStats: async () => {
      await delay(700);
      return {
        success: true,
        stats: MOCK_ANALYTICS.admin.platformStats
      };
    }
  },

  notifications: {
    getNotifications: async (userId) => {
      await delay(500);
      return {
        success: true,
        notifications: MOCK_NOTIFICATIONS
      };
    },

    markAsRead: async (notificationId) => {
      await delay(300);
      return {
        success: true,
        message: 'Notification marked as read'
      };
    },

    deleteNotification: async (notificationId) => {
      await delay(300);
      return {
        success: true,
        message: 'Notification deleted'
      };
    }
  },

  payments: {
    createPaymentIntent: async (courseId, amount) => {
      await delay(1000);
      return {
        success: true,
        clientSecret: 'mock_client_secret_12345',
        paymentIntent: {
          id: 'pi_mock_12345',
          amount: amount * 100,
          currency: 'usd'
        }
      };
    },

    confirmPayment: async (paymentIntentId) => {
      await delay(1500);
      return {
        success: true,
        payment: {
          id: paymentIntentId,
          status: 'succeeded',
          amount: 9900
        },
        message: 'Payment successful'
      };
    },

    getTransactions: async (params = {}) => {
      await delay(600);
      return {
        success: true,
        transactions: MOCK_TRANSACTIONS,
        total: MOCK_TRANSACTIONS.length
      };
    },

    getUserTransactions: async (userId) => {
      await delay(600);
      const userTransactions = MOCK_TRANSACTIONS.filter(t => t.userId === userId);
      return {
        success: true,
        transactions: userTransactions
      };
    }
  },

  progress: {
    getUserProgress: async (userId, courseId) => {
      await delay(400);
      return {
        success: true,
        progress: {
          courseId,
          userId,
          completedLessons: Math.floor(Math.random() * 20),
          totalLessons: 24,
          progressPercentage: Math.floor(Math.random() * 100),
          timeSpent: Math.floor(Math.random() * 300), // minutes
          lastAccessed: new Date().toISOString()
        }
      };
    },

    updateProgress: async (userId, courseId, progressData) => {
      await delay(300);
      return {
        success: true,
        message: 'Progress updated'
      };
    }
  },

  categories: {
    getCategories: async () => {
      await delay(400);
      return {
        success: true,
        categories: [
          { id: 1, name: 'Web Development', courseCount: 45 },
          { id: 2, name: 'Data Science', courseCount: 32 },
          { id: 3, name: 'Mobile Development', courseCount: 28 },
          { id: 4, name: 'Design', courseCount: 25 },
          { id: 5, name: 'Business', courseCount: 26 }
        ]
      };
    },

    createCategory: async (categoryData) => {
      await delay(500);
      return {
        success: true,
        category: { id: Date.now(), ...categoryData, courseCount: 0 },
        message: 'Category created successfully'
      };
    },

    updateCategory: async (categoryId, categoryData) => {
      await delay(500);
      return {
        success: true,
        message: 'Category updated successfully'
      };
    },

    deleteCategory: async (categoryId) => {
      await delay(400);
      return {
        success: true,
        message: 'Category deleted successfully'
      };
    }
  }
};

// Function to enable mock mode
export const enableMockAPI = () => {
  window.__MOCK_API_ENABLED__ = true;
  console.log('🟡 MOCK API ENABLED - Using fake data for testing');
  console.log('📋 Test accounts:');
  console.log('👨‍🎓 Student: student@test.com / password123');
  console.log('👨‍🏫 Instructor: instructor@test.com / password123');
  console.log('👨‍💼 Admin: admin@test.com / password123');
};

export default mockAPI;