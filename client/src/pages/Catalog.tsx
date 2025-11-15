import { useState } from 'react';
import CourseCard from '@/components/CourseCard';
import EmptyState from '@/components/EmptyState';
import { courseIcons } from '@/utils/imagePaths';

// Course data with icon mapping
const courses = [
  {
    id: 'climate-basics',
    title: 'Climate Science Basics',
    description: 'Learn the fundamentals of climate change, greenhouse gases, and environmental impact.',
    image: courseIcons.climateBasics,
    level: 'Beginner' as const,
    tags: ['Climate', 'Science', 'Basics'],
    price: 0,
  },
  {
    id: 'waste-management',
    title: 'Waste Management & Recycling',
    description: 'Master sustainable waste reduction, recycling techniques, and circular economy principles.',
    image: courseIcons.wasteManagement,
    level: 'Beginner' as const,
    tags: ['Waste', 'Recycling', 'Sustainability'],
    price: 0,
  },
  {
    id: 'renewable-energy',
    title: 'Renewable Energy Solutions',
    description: 'Explore solar, wind, and hydroelectric power systems and their implementation.',
    image: courseIcons.renewableEnergy,
    level: 'Intermediate' as const,
    tags: ['Energy', 'Solar', 'Wind'],
    price: 5000,
  },
  {
    id: 'tree-planting',
    title: 'Tree Planting & Reforestation',
    description: 'Learn proper tree planting techniques, forest restoration, and carbon sequestration.',
    image: courseIcons.treePlanting,
    level: 'Beginner' as const,
    tags: ['Trees', 'Forest', 'Carbon'],
    price: 0,
  },
  {
    id: 'water',
    title: 'Water Conservation',
    description: 'Discover water-saving strategies, rainwater harvesting, and sustainable water management.',
    image: courseIcons.waterConservation,
    level: 'Beginner' as const,
    tags: ['Water', 'Conservation', 'Sustainability'],
    price: 0,
  },
  {
    id: 'entrepreneurship',
    title: 'Climate Entrepreneurship',
    description: 'Build green businesses, access climate finance, and create sustainable startups.',
    image: courseIcons.climateEntrepreneurship,
    level: 'Advanced' as const,
    tags: ['Business', 'Finance', 'Startup'],
    price: 10000,
  },
];

function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
        Course Catalog
      </h1>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
        />
      </div>

      {/* Course Cards */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="transform hover:scale-105 transition-transform duration-300"
            >
              <CourseCard
                id={course.id}
                title={course.title}
                description={course.description}
                image={course.image}
                level={course.level}
                tags={course.tags}
                price={course.price}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          type="courses"
          title="No Courses Found"
          message="No courses match your search. Try adjusting your search terms or browse all courses."
          actionLabel="View All Courses"
          onAction={() => setSearchQuery('')}
        />
      )}
    </div>
  );
}

export default Catalog;

