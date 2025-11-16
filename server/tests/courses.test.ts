/**
 * Courses API Integration Tests
 * 
 * Tests for:
 * - GET /api/courses (public)
 * - POST /api/courses (protected, instructor/admin only)
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
});

