import { create } from 'zustand';

/**
 * Course type definition
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  tags: string[];
  price: number;
  status: 'pending' | 'approved';
}

/**
 * User enrollment record
 */
interface Enrollment {
  courseId: string;
  userId: string;
  enrolledAt: Date;
}

/**
 * Course Store State
 */
interface CourseStore {
  // State
  courses: Course[];
  pending: Course[];
  enrollments: Enrollment[];

  // Actions
  addCourse: (course: Omit<Course, 'status'>) => void;
  approveCourse: (id: string) => void;
  rejectCourse: (id: string) => void;
  enrollCourse: (courseId: string, userId: string) => void;
  getEnrolledCourses: (userId: string) => Course[];
  isEnrolled: (courseId: string, userId: string) => boolean;
}

/**
 * Zustand store for managing courses and pending approvals
 * 
 * Features:
 * - Manage approved courses
 * - Manage pending course approvals
 * - Track user enrollments
 * - Course approval/rejection workflow
 */
export const useCourseStore = create<CourseStore>((set, get) => ({
  // Initial state
  courses: [],
  pending: [],
  enrollments: [],

  /**
   * Add a new course to pending approvals
   * @param course - Course data without status (will be set to 'pending')
   */
  addCourse: (course) => {
    set((state) => ({
      pending: [
        ...state.pending,
        {
          ...course,
          status: 'pending' as const,
        },
      ],
    }));
  },

  /**
   * Approve a course - move from pending to courses
   * @param id - Course ID to approve
   */
  approveCourse: (id) => {
    set((state) => {
      const courseToApprove = state.pending.find((c) => c.id === id);
      if (!courseToApprove) {
        console.warn(`Course with id ${id} not found in pending list`);
        return state;
      }

      return {
        pending: state.pending.filter((c) => c.id !== id),
        courses: [
          ...state.courses,
          {
            ...courseToApprove,
            status: 'approved' as const,
          },
        ],
      };
    });
  },

  /**
   * Reject a course - remove from pending
   * @param id - Course ID to reject
   */
  rejectCourse: (id) => {
    set((state) => ({
      pending: state.pending.filter((c) => c.id !== id),
    }));
  },

  /**
   * Enroll a user in a course
   * @param courseId - Course ID to enroll in
   * @param userId - User ID enrolling
   */
  enrollCourse: (courseId, userId) => {
    set((state) => {
      // Check if already enrolled
      const alreadyEnrolled = state.enrollments.some(
        (e) => e.courseId === courseId && e.userId === userId
      );

      if (alreadyEnrolled) {
        console.warn(`User ${userId} is already enrolled in course ${courseId}`);
        return state;
      }

      return {
        enrollments: [
          ...state.enrollments,
          {
            courseId,
            userId,
            enrolledAt: new Date(),
          },
        ],
      };
    });
  },

  /**
   * Get all courses a user is enrolled in
   * @param userId - User ID
   * @returns Array of enrolled courses
   */
  getEnrolledCourses: (userId) => {
    const state = get();
    const enrolledCourseIds = state.enrollments
      .filter((e) => e.userId === userId)
      .map((e) => e.courseId);

    return state.courses.filter((c) => enrolledCourseIds.includes(c.id));
  },

  /**
   * Check if a user is enrolled in a course
   * @param courseId - Course ID
   * @param userId - User ID
   * @returns True if enrolled, false otherwise
   */
  isEnrolled: (courseId, userId) => {
    const state = get();
    return state.enrollments.some(
      (e) => e.courseId === courseId && e.userId === userId
    );
  },
}));

