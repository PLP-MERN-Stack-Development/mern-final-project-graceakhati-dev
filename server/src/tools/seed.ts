/**
 * Database Seed Script
 * 
 * Populates the database with sample data for development/testing
 * 
 * Usage:
 *   ts-node src/tools/seed.ts
 * 
 * Or with npm script:
 *   npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Course from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import Assignment from '../models/Assignment';
import { connectDB, disconnectDB } from '../config/db';

// Load environment variables
dotenv.config();

/**
 * Clear existing data (optional - set CLEAR_DB=true to clear)
 */
const clearDatabase = async (): Promise<void> => {
  const shouldClear = process.env.CLEAR_DB === 'true';
  
  if (!shouldClear) {
    console.log('ℹ️  Skipping database clear (set CLEAR_DB=true to clear)');
    return;
  }

  console.log('🗑️  Clearing existing data...');
  
  try {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Assignment.deleteMany({});
    
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

/**
 * Create sample users
 */
const createUsers = async (): Promise<{ admin: any; instructor: any }> => {
  console.log('👥 Creating users...');

  try {
    // Create admin user
    let admin = await User.findOne({ email: 'admin@planetpath.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@planetpath.com',
        password: 'admin123', // Will be hashed automatically
        role: 'admin',
        xp: 500,
        badges: ['admin-badge', 'founder'],
      });
      console.log('✅ Created admin user:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists:', admin.email);
    }

    // Create instructor user
    let instructor = await User.findOne({ email: 'instructor@planetpath.com' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Dr. Sarah Green',
        email: 'instructor@planetpath.com',
        password: 'instructor123', // Will be hashed automatically
        role: 'instructor',
        xp: 1000,
        badges: ['expert-instructor', 'climate-champion'],
      });
      console.log('✅ Created instructor user:', instructor.email);
    } else {
      console.log('ℹ️  Instructor user already exists:', instructor.email);
    }

    return { admin, instructor };
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
};

/**
 * Create sample courses with modules and lessons
 */
const createCourses = async (instructorId: mongoose.Types.ObjectId): Promise<any[]> => {
  console.log('📚 Creating courses with modules and lessons...');

  const courses = [];

  try {
    // Course 1: Climate Change Basics
    let course1 = await Course.findOne({ slug: 'climate-change-basics' });
    if (!course1) {
      course1 = await Course.create({
        title: 'Climate Change Basics',
        slug: 'climate-change-basics',
        description: 'Learn the fundamentals of climate change, including the science behind global warming, greenhouse gases, and the impact on our planet. This comprehensive course covers everything from the basics to actionable solutions.',
        authorId: instructorId,
        modules: [],
        tags: ['climate', 'environment', 'basics', 'science'],
        price: 0,
        impact_type: 'climate',
        status: 'published',
      });

      // Module 1.1: Introduction
      const module1_1 = await Module.create({
        title: 'Introduction to Climate Science',
        courseId: course1._id,
        order: 1,
        lessons: [],
      });

      // Lessons for Module 1.1
      const lesson1_1_1 = await Lesson.create({
        title: 'What is Climate Change?',
        content: 'Climate change refers to long-term shifts in global temperatures and weather patterns. While climate variations are natural, scientific evidence shows that human activities have been the main driver of climate change since the mid-20th century.',
        videoUrl: 'https://example.com/videos/climate-intro.mp4',
        duration: 10,
        order: 1,
        moduleId: module1_1._id,
      });

      const lesson1_1_2 = await Lesson.create({
        title: 'The Greenhouse Effect',
        content: 'The greenhouse effect is a natural process that warms the Earth\'s surface. When the Sun\'s energy reaches the Earth, some of it is reflected back to space and the rest is absorbed and re-radiated by greenhouse gases.',
        videoUrl: 'https://example.com/videos/greenhouse-effect.mp4',
        duration: 15,
        order: 2,
        moduleId: module1_1._id,
      });

      // Update module with lessons
      module1_1.lessons = [lesson1_1_1._id, lesson1_1_2._id];
      await module1_1.save();

      // Module 1.2: Impacts
      const module1_2 = await Module.create({
        title: 'Impacts of Climate Change',
        courseId: course1._id,
        order: 2,
        lessons: [],
      });

      const lesson1_2_1 = await Lesson.create({
        title: 'Rising Sea Levels',
        content: 'Sea levels are rising due to thermal expansion of seawater and melting ice sheets. This poses significant risks to coastal communities worldwide.',
        videoUrl: 'https://example.com/videos/sea-levels.mp4',
        duration: 12,
        order: 1,
        moduleId: module1_2._id,
      });

      module1_2.lessons = [lesson1_2_1._id];
      await module1_2.save();

      // Update course with modules
      course1.modules = [module1_1._id, module1_2._id];
      await course1.save();

      courses.push(course1);
      console.log('✅ Created course: Climate Change Basics');
    } else {
      console.log('ℹ️  Course already exists: Climate Change Basics');
      courses.push(course1);
    }

    // Course 2: Waste Management Solutions
    let course2 = await Course.findOne({ slug: 'waste-management-solutions' });
    if (!course2) {
      course2 = await Course.create({
        title: 'Waste Management Solutions',
        slug: 'waste-management-solutions',
        description: 'Discover effective strategies for reducing, reusing, and recycling waste. Learn about circular economy principles and how to implement zero-waste practices in your daily life and community.',
        authorId: instructorId,
        modules: [],
        tags: ['waste', 'recycling', 'sustainability', 'zero-waste'],
        price: 0,
        impact_type: 'waste',
        status: 'published',
      });

      // Module 2.1: Reduce
      const module2_1 = await Module.create({
        title: 'Reduce Waste at Source',
        courseId: course2._id,
        order: 1,
        lessons: [],
      });

      const lesson2_1_1 = await Lesson.create({
        title: 'The 5 R\'s of Waste Management',
        content: 'Refuse, Reduce, Reuse, Repurpose, Recycle. Learn how to apply these principles to minimize waste generation.',
        videoUrl: 'https://example.com/videos/5rs.mp4',
        duration: 18,
        order: 1,
        moduleId: module2_1._id,
      });

      module2_1.lessons = [lesson2_1_1._id];
      await module2_1.save();

      // Module 2.2: Recycle
      const module2_2 = await Module.create({
        title: 'Effective Recycling Practices',
        courseId: course2._id,
        order: 2,
        lessons: [],
      });

      const lesson2_2_1 = await Lesson.create({
        title: 'Understanding Recycling Symbols',
        content: 'Learn to identify different recycling symbols and what materials can be recycled in your area.',
        videoUrl: 'https://example.com/videos/recycling-symbols.mp4',
        duration: 14,
        order: 1,
        moduleId: module2_2._id,
      });

      module2_2.lessons = [lesson2_2_1._id];
      await module2_2.save();

      course2.modules = [module2_1._id, module2_2._id];
      await course2.save();

      courses.push(course2);
      console.log('✅ Created course: Waste Management Solutions');
    } else {
      console.log('ℹ️  Course already exists: Waste Management Solutions');
      courses.push(course2);
    }

    // Course 3: Renewable Energy Fundamentals
    let course3 = await Course.findOne({ slug: 'renewable-energy-fundamentals' });
    if (!course3) {
      course3 = await Course.create({
        title: 'Renewable Energy Fundamentals',
        slug: 'renewable-energy-fundamentals',
        description: 'Explore the world of renewable energy sources including solar, wind, hydroelectric, and geothermal power. Understand how these technologies work and their role in transitioning to a sustainable energy future.',
        authorId: instructorId,
        modules: [],
        tags: ['energy', 'renewable', 'solar', 'wind', 'sustainability'],
        price: 0,
        impact_type: 'energy',
        status: 'published',
      });

      // Module 3.1: Solar Energy
      const module3_1 = await Module.create({
        title: 'Solar Power',
        courseId: course3._id,
        order: 1,
        lessons: [],
      });

      const lesson3_1_1 = await Lesson.create({
        title: 'How Solar Panels Work',
        content: 'Solar panels convert sunlight into electricity using photovoltaic cells. Learn about the technology behind solar energy and its applications.',
        videoUrl: 'https://example.com/videos/solar-panels.mp4',
        duration: 20,
        order: 1,
        moduleId: module3_1._id,
      });

      module3_1.lessons = [lesson3_1_1._id];
      await module3_1.save();

      // Module 3.2: Wind Energy
      const module3_2 = await Module.create({
        title: 'Wind Power',
        courseId: course3._id,
        order: 2,
        lessons: [],
      });

      const lesson3_2_1 = await Lesson.create({
        title: 'Wind Turbines and Energy Generation',
        content: 'Wind turbines harness the kinetic energy of wind to generate electricity. Discover how wind farms contribute to clean energy production.',
        videoUrl: 'https://example.com/videos/wind-turbines.mp4',
        duration: 16,
        order: 1,
        moduleId: module3_2._id,
      });

      module3_2.lessons = [lesson3_2_1._id];
      await module3_2.save();

      course3.modules = [module3_1._id, module3_2._id];
      await course3.save();

      courses.push(course3);
      console.log('✅ Created course: Renewable Energy Fundamentals');
    } else {
      console.log('ℹ️  Course already exists: Renewable Energy Fundamentals');
      courses.push(course3);
    }

    return courses;
  } catch (error) {
    console.error('❌ Error creating courses:', error);
    throw error;
  }
};

/**
 * Create sample assignments
 */
const createAssignments = async (courses: any[]): Promise<any[]> => {
  console.log('📝 Creating assignments...');

  const assignments = [];

  try {
    // Assignment 1: Climate Action Project
    if (courses.length > 0) {
      let assignment1 = await Assignment.findOne({ 
        title: 'Climate Action Project',
        courseId: courses[0]._id,
      });

      if (!assignment1) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

        assignment1 = await Assignment.create({
          title: 'Climate Action Project',
          description: 'Create a project demonstrating climate action in your community. Document your project with photos, a written report, and geolocation data. Projects can include tree planting, community cleanups, energy conservation initiatives, or educational campaigns.',
          courseId: courses[0]._id,
          dueDate: dueDate,
          maxScore: 100,
          attachments: [],
        });

        assignments.push(assignment1);
        console.log('✅ Created assignment: Climate Action Project');
      } else {
        console.log('ℹ️  Assignment already exists: Climate Action Project');
        assignments.push(assignment1);
      }
    }

    // Assignment 2: Waste Audit and Reduction Plan
    if (courses.length > 1) {
      let assignment2 = await Assignment.findOne({
        title: 'Waste Audit and Reduction Plan',
        courseId: courses[1]._id,
      });

      if (!assignment2) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 21); // Due in 21 days

        assignment2 = await Assignment.create({
          title: 'Waste Audit and Reduction Plan',
          description: 'Conduct a waste audit of your household or workplace for one week. Document all waste generated, categorize it, and create a reduction plan with specific goals and timelines. Include photos of your waste audit process.',
          courseId: courses[1]._id,
          dueDate: dueDate,
          maxScore: 100,
          attachments: [],
        });

        assignments.push(assignment2);
        console.log('✅ Created assignment: Waste Audit and Reduction Plan');
      } else {
        console.log('ℹ️  Assignment already exists: Waste Audit and Reduction Plan');
        assignments.push(assignment2);
      }
    }

    return assignments;
  } catch (error) {
    console.error('❌ Error creating assignments:', error);
    throw error;
  }
};

/**
 * Main seed function
 */
const seed = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to database
    await connectDB();

    // Clear database if requested
    await clearDatabase();

    // Create users
    const { admin, instructor } = await createUsers();
    console.log('');

    // Create courses with modules and lessons
    const courses = await createCourses(instructor._id);
    console.log('');

    // Create assignments
    const assignments = await createAssignments(courses);
    console.log('');

    // Summary
    console.log('📊 Seed Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Users: ${await User.countDocuments()}`);
    console.log(`✅ Courses: ${await Course.countDocuments()}`);
    console.log(`✅ Modules: ${await Module.countDocuments()}`);
    console.log(`✅ Lessons: ${await Lesson.countDocuments()}`);
    console.log(`✅ Assignments: ${await Assignment.countDocuments()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔐 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@planetpath.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Instructor:');
    console.log('  Email: instructor@planetpath.com');
    console.log('  Password: instructor123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

// Run seed if executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('👋 Seed script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export default seed;
