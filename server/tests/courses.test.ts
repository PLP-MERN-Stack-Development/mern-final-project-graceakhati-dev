/**
 * Courses API Integration Tests
 * 
 * Comprehensive tests for:
 * - GET /api/courses (public)
 *   - Successful retrieval
 *   - Filtering and pagination
 * - GET /api/courses/:id (public)
 *   - Successful retrieval by ID
 *   - Successful retrieval by slug
 *   - Course not found
 * - POST /api/courses (protected, instructor/admin only)
 *   - Successful creation
 *   - Validation errors
 *   - Unauthorized access
 *   - Forbidden access (student)
 * - PUT /api/courses/:id (protected, author/instructor/admin)
 *   - Successful update by author
 *   - Successful update by instructor/admin
 *   - Validation errors
 *   - Unauthorized access
 *   - Forbidden access (non-author student)
 *   - Course not found
 * - DELETE /api/courses/:id (protected, author/instructor/admin)
 *   - Successful deletion by author
 *   - Successful deletion by instructor/admin
 *   - Unauthorized access
 *   - Forbidden access (non-author student)
 *   - Course not found
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/User';
import Course from '../src/models/Course';
import { setupTestDB, teardownTestDB, clearDatabase } from './setup';
import jwt from 'jsonwebtoken';

describe('Courses API', () => {
  let studentToken: string;
  let instructorToken: string;
  let adminToken: string;
  let studentId: string;
  let instructorId: string;
  let adminId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create test users and get tokens
    const student = await User.create({
      name: 'Student User',
      email: 'student@example.com',
      password: 'password123',
      role: 'student',
    });

    const instructor = await User.create({
      name: 'Instructor User',
      email: 'instructor@example.com',
      password: 'password123',
      role: 'instructor',
    });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    studentId = (student._id as mongoose.Types.ObjectId).toString();
    instructorId = (instructor._id as mongoose.Types.ObjectId).toString();
    adminId = (admin._id as mongoose.Types.ObjectId).toString();

    // Generate JWT tokens (must match auth middleware format: { userId, email, role })
    const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
    const jwtExpire = process.env.JWT_EXPIRE || '7d';

    studentToken = jwt.sign(
      { userId: studentId, email: 'student@example.com', role: 'student' },
      jwtSecret,
      {
        expiresIn: jwtExpire,
      } as jwt.SignOptions
    );

    instructorToken = jwt.sign(
      { userId: instructorId, email: 'instructor@example.com', role: 'instructor' },
      jwtSecret,
      {
        expiresIn: jwtExpire,
      } as jwt.SignOptions
    );

    adminToken = jwt.sign(
      { userId: adminId, email: 'admin@example.com', role: 'admin' },
      jwtSecret,
      {
        expiresIn: jwtExpire,
      } as jwt.SignOptions
    );
  });

  describe('GET /api/courses', () => {
    beforeEach(async () => {
      // Create sample courses
      await Course.create([
        {
          title: 'Climate Change Basics',
          slug: 'climate-change-basics',
          description: 'Learn about climate change fundamentals',
          authorId: instructorId,
          modules: [],
          tags: ['climate', 'environment'],
          price: 0,
          impact_type: 'climate',
          status: 'published',
        },
        {
          title: 'Waste Management',
          slug: 'waste-management',
          description: 'Learn about waste reduction strategies',
          authorId: instructorId,
          modules: [],
          tags: ['waste', 'recycling'],
          price: 0,
          impact_type: 'waste',
          status: 'published',
        },
        {
          title: 'Draft Course',
          slug: 'draft-course',
          description: 'This is a draft course',
          authorId: instructorId,
          modules: [],
          tags: ['draft'],
          price: 0,
          impact_type: 'climate',
          status: 'draft',
        },
      ]);
    });

    it('should get all published courses (public access)', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('courses');
      expect(response.body.data).toHaveProperty('pagination');

      // Should only return published courses by default
      const courses = response.body.data.courses;
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeGreaterThanOrEqual(2);

      // Verify course structure
      if (courses.length > 0) {
        expect(courses[0]).toHaveProperty('_id');
        expect(courses[0]).toHaveProperty('title');
        expect(courses[0]).toHaveProperty('slug');
        expect(courses[0]).toHaveProperty('description');
        expect(courses[0]).toHaveProperty('status', 'published');
      }
    });

    it('should filter courses by status', async () => {
      const response = await request(app)
        .get('/api/courses?status=draft')
        .expect(200);

      const courses = response.body.data.courses;
      courses.forEach((course: any) => {
        expect(course.status).toBe('draft');
      });
    });

    it('should filter courses by impact_type', async () => {
      const response = await request(app)
        .get('/api/courses?impact_type=climate')
        .expect(200);

      const courses = response.body.data.courses;
      courses.forEach((course: any) => {
        expect(course.impact_type).toBe('climate');
      });
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/courses?page=1&limit=1')
        .expect(200);

      expect(response.body.data.courses.length).toBeLessThanOrEqual(1);
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 1);
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('pages');
    });

    it('should sort courses by createdAt descending by default', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      const courses = response.body.data.courses;
      if (courses.length > 1) {
        const firstDate = new Date(courses[0].createdAt).getTime();
        const secondDate = new Date(courses[1].createdAt).getTime();
        expect(firstDate).toBeGreaterThanOrEqual(secondDate);
      }
    });

    it('should return empty array when no courses match filters', async () => {
      const response = await request(app)
        .get('/api/courses?impact_type=water')
        .expect(200);

      expect(response.body.data.courses).toEqual([]);
    });
  });

  describe('POST /api/courses', () => {
    it('should create course as instructor', async () => {
      const courseData = {
        title: 'New Course',
        description: 'This is a new course created by instructor',
        modules: [],
        tags: ['test', 'new'],
        price: 0,
        impact_type: 'climate',
        status: 'draft',
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('course');
      expect(response.body.data.course).toHaveProperty('_id');
      expect(response.body.data.course).toHaveProperty('title', courseData.title);
      expect(response.body.data.course).toHaveProperty('slug');
      expect(response.body.data.course).toHaveProperty('description', courseData.description);
      expect(response.body.data.course).toHaveProperty('authorId');
      expect(response.body.data.course).toHaveProperty('status', courseData.status);

      // Verify course was saved in database
      const course = await Course.findById(response.body.data.course._id);
      expect(course).toBeTruthy();
      expect(course?.title).toBe(courseData.title);
      expect(course?.authorId.toString()).toBe(instructorId);
    });

    it('should create course as admin', async () => {
      const courseData = {
        title: 'Admin Course',
        description: 'Course created by admin',
        modules: [],
        tags: ['admin'],
        price: 0,
        impact_type: 'energy',
        status: 'published',
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      // authorId is populated as an object, check the _id property
      expect(response.body.data.course.authorId).toHaveProperty('_id');
      expect(response.body.data.course.authorId._id.toString()).toBe(adminId);
    });

    it('should auto-generate slug from title', async () => {
      const courseData = {
        title: 'My Amazing Course Title',
        description: 'Test description',
        modules: [],
        tags: [],
        price: 0,
        impact_type: 'climate',
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(201);

      expect(response.body.data.course.slug).toBe('my-amazing-course-title');
    });

    it('should return 401 without authentication token', async () => {
      const courseData = {
        title: 'Unauthorized Course',
        description: 'Should fail',
        modules: [],
        tags: [],
        price: 0,
        impact_type: 'climate',
      };

      const response = await request(app)
        .post('/api/courses')
        .send(courseData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 for student role', async () => {
      const courseData = {
        title: 'Student Course',
        description: 'Should fail',
        modules: [],
        tags: [],
        price: 0,
        impact_type: 'climate',
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(courseData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/access denied|permission|required role/i);
    });

    it('should return 400 for invalid data', async () => {
      const courseData = {
        title: 'AB', // Too short (min 3 characters)
        description: 'Short', // Too short (min 10 characters)
        modules: [],
        tags: [],
        price: -10, // Negative price
        impact_type: 'invalid', // Invalid impact type
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const courseData = {
        // Missing title and description
        modules: [],
        tags: [],
        price: 0,
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid token', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test description',
        modules: [],
        tags: [],
        price: 0,
        impact_type: 'climate',
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', 'Bearer invalid-token')
        .send(courseData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate tags array length', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test description',
        modules: [],
        tags: Array(11).fill('tag'), // More than 10 tags
        price: 0,
        impact_type: 'climate',
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/courses/:id', () => {
    let courseId: string;
    let courseSlug: string;

    beforeEach(async () => {
      const course = await Course.create({
        title: 'Test Course for Get',
        slug: 'test-course-for-get',
        description: 'This is a test course for GET endpoint',
        authorId: instructorId,
        modules: [],
        tags: ['test'],
        price: 0,
        impact_type: 'climate',
        status: 'published',
      });
      courseId = (course._id as mongoose.Types.ObjectId).toString();
      courseSlug = course.slug;
    });

    it('should get course by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('course');
      expect(response.body.data.course).toHaveProperty('_id', courseId);
      expect(response.body.data.course).toHaveProperty('title', 'Test Course for Get');
      expect(response.body.data.course).toHaveProperty('slug', courseSlug);
    });

    it('should get course by slug successfully', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseSlug}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.course).toHaveProperty('slug', courseSlug);
    });

    it('should return 404 for non-existent course ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/courses/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/courses/non-existent-slug')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/courses/:id', () => {
    let courseId: string;
    let otherInstructorId: string;
    let otherInstructorToken: string;

    beforeEach(async () => {
      // Create a course owned by the instructor
      const course = await Course.create({
        title: 'Course to Update',
        slug: 'course-to-update',
        description: 'This course will be updated',
        authorId: instructorId,
        modules: [],
        tags: ['test'],
        price: 0,
        impact_type: 'climate',
        status: 'draft',
      });
      courseId = (course._id as mongoose.Types.ObjectId).toString();

      // Create another instructor for testing
      const otherInstructor = await User.create({
        name: 'Other Instructor',
        email: 'other-instructor@example.com',
        password: 'password123',
        role: 'instructor',
      });
      otherInstructorId = (otherInstructor._id as mongoose.Types.ObjectId).toString();

      const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
      const jwtExpire = process.env.JWT_EXPIRE || '7d';
      otherInstructorToken = jwt.sign(
        { userId: otherInstructorId, email: 'other-instructor@example.com', role: 'instructor' },
        jwtSecret,
        { expiresIn: jwtExpire } as jwt.SignOptions
      );
    });

    it('should update course successfully by author', async () => {
      const updateData = {
        title: 'Updated Course Title',
        description: 'This course has been updated',
        status: 'published',
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Course updated successfully');
      expect(response.body.data.course).toHaveProperty('title', updateData.title);
      expect(response.body.data.course).toHaveProperty('description', updateData.description);
      expect(response.body.data.course).toHaveProperty('status', updateData.status);

      // Verify course was updated in database
      const updatedCourse = await Course.findById(courseId);
      expect(updatedCourse?.title).toBe(updateData.title);
      expect(updatedCourse?.status).toBe(updateData.status);
    });

    it('should update course successfully by admin', async () => {
      const updateData = {
        title: 'Updated by Admin',
        description: 'Updated by admin user',
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course).toHaveProperty('title', updateData.title);
    });

    it('should update course successfully by other instructor (admin privilege)', async () => {
      const updateData = {
        title: 'Updated by Other Instructor',
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${otherInstructorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course).toHaveProperty('title', updateData.title);
    });

    it('should return 401 without authentication token', async () => {
      const updateData = {
        title: 'Unauthorized Update',
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 for student trying to update course', async () => {
      const updateData = {
        title: 'Student Update Attempt',
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/permission|access denied/i);
    });

    it('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        title: 'Update Non-existent',
      };

      const response = await request(app)
        .put(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid course ID format', async () => {
      const updateData = {
        title: 'Invalid ID',
      };

      const response = await request(app)
        .put('/api/courses/invalid-id-format')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for validation errors - short title', async () => {
      const updateData = {
        title: 'AB', // Too short (min 3 characters)
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 400 for validation errors - short description', async () => {
      const updateData = {
        description: 'Short', // Too short (min 10 characters)
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for validation errors - negative price', async () => {
      const updateData = {
        price: -10,
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for validation errors - invalid status', async () => {
      const updateData = {
        status: 'invalid-status',
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for validation errors - invalid impact_type', async () => {
      const updateData = {
        impact_type: 'invalid-type',
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid token', async () => {
      const updateData = {
        title: 'Invalid Token Update',
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', 'Bearer invalid-token')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should allow partial updates', async () => {
      const updateData = {
        price: 99.99,
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course).toHaveProperty('price', 99.99);
      // Original title should remain unchanged
      expect(response.body.data.course).toHaveProperty('title', 'Course to Update');
    });
  });

  describe('DELETE /api/courses/:id', () => {
    let courseId: string;
    let otherInstructorId: string;
    let otherInstructorToken: string;

    beforeEach(async () => {
      // Create a course owned by the instructor
      const course = await Course.create({
        title: 'Course to Delete',
        slug: 'course-to-delete',
        description: 'This course will be deleted',
        authorId: instructorId,
        modules: [],
        tags: ['test'],
        price: 0,
        impact_type: 'climate',
        status: 'draft',
      });
      courseId = (course._id as mongoose.Types.ObjectId).toString();

      // Create another instructor for testing
      const otherInstructor = await User.create({
        name: 'Other Instructor',
        email: 'other-instructor2@example.com',
        password: 'password123',
        role: 'instructor',
      });
      otherInstructorId = (otherInstructor._id as mongoose.Types.ObjectId).toString();

      const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
      const jwtExpire = process.env.JWT_EXPIRE || '7d';
      otherInstructorToken = jwt.sign(
        { userId: otherInstructorId, email: 'other-instructor2@example.com', role: 'instructor' },
        jwtSecret,
        { expiresIn: jwtExpire } as jwt.SignOptions
      );
    });

    it('should delete course successfully by author', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Course deleted successfully');

      // Verify course was deleted from database
      const deletedCourse = await Course.findById(courseId);
      expect(deletedCourse).toBeNull();
    });

    it('should delete course successfully by admin', async () => {
      // Create a new course for admin to delete
      const course = await Course.create({
        title: 'Course for Admin Delete',
        slug: 'course-for-admin-delete',
        description: 'This course will be deleted by admin',
        authorId: instructorId,
        modules: [],
        tags: ['test'],
        price: 0,
        impact_type: 'climate',
        status: 'draft',
      });
      const adminCourseId = (course._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .delete(`/api/courses/${adminCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify course was deleted
      const deletedCourse = await Course.findById(adminCourseId);
      expect(deletedCourse).toBeNull();
    });

    it('should delete course successfully by other instructor (admin privilege)', async () => {
      // Create a new course for other instructor to delete
      const course = await Course.create({
        title: 'Course for Other Instructor Delete',
        slug: 'course-for-other-instructor-delete',
        description: 'This course will be deleted by other instructor',
        authorId: instructorId,
        modules: [],
        tags: ['test'],
        price: 0,
        impact_type: 'climate',
        status: 'draft',
      });
      const otherInstructorCourseId = (course._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .delete(`/api/courses/${otherInstructorCourseId}`)
        .set('Authorization', `Bearer ${otherInstructorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify course was deleted
      const deletedCourse = await Course.findById(otherInstructorCourseId);
      expect(deletedCourse).toBeNull();
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 for student trying to delete course', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/permission|access denied/i);
    });

    it('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

