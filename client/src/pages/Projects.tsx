import { useState } from 'react';
import ImageLoader from '@/components/ImageLoader';
import EmptyState from '@/components/EmptyState';
import { projectImages } from '@/utils/imagePaths';

interface Project {
  id: string;
  title: string;
  location: string;
  sdgTag: string;
  sdgColor: string;
  progress: number;
  image: string;
  illustration?: string;
  description: string;
}

function Projects() {
  const [viewMode, setViewMode] = useState<'real' | 'illustrated'>('real');

  // Project data with real images
  const projects: Project[] = [
    {
      id: 'tree-planting',
      title: 'Community Tree Planting Initiative',
      location: 'Nairobi, Kenya',
      sdgTag: 'SDG 13: Climate Action',
      sdgColor: 'bg-green-600',
      progress: 75,
      image: projectImages.treePlanting,
      illustration: projectImages.plantingIllustration,
      description: 'Join us in planting 10,000 trees across Nairobi to combat climate change and restore local ecosystems.',
    },
    {
      id: 'cleanup',
      title: 'Beach & River Cleanup Drive',
      location: 'Mombasa, Kenya',
      sdgTag: 'SDG 13: Climate Action',
      sdgColor: 'bg-green-600',
      progress: 60,
      image: projectImages.cleanup,
      illustration: projectImages.cleanupIllustration,
      description: 'Help clean up beaches and rivers to protect marine life and reduce plastic pollution in our waterways.',
    },
    {
      id: 'water-conservation',
      title: 'Water Conservation & Rainwater Harvesting',
      location: 'Kisumu, Kenya',
      sdgTag: 'SDG 6: Clean Water',
      sdgColor: 'bg-blue-600',
      progress: 45,
      image: projectImages.waterConservation,
      description: 'Learn and implement rainwater harvesting systems to conserve water in drought-prone areas.',
    },
    {
      id: 'urban-gardening',
      title: 'Urban Gardening & Food Security',
      location: 'Eldoret, Kenya',
      sdgTag: 'SDG 2: Zero Hunger',
      sdgColor: 'bg-orange-600',
      progress: 80,
      image: projectImages.urbanGardening,
      description: 'Transform urban spaces into productive gardens to improve food security and reduce food miles.',
    },
    {
      id: 'youth-activity',
      title: 'Youth Climate Action Summit',
      location: 'Nakuru, Kenya',
      sdgTag: 'SDG 13: Climate Action',
      sdgColor: 'bg-green-600',
      progress: 90,
      image: projectImages.youthActivity,
      description: 'Empower young leaders through climate education, workshops, and community action projects.',
    },
  ];

  // Filter projects that have illustrations
  const projectsWithIllustrations = projects.filter((p) => p.illustration);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
          Impact Projects
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Join verified climate action projects and make a real difference in your community
        </p>

        {/* View Mode Toggle */}
        {projectsWithIllustrations.length > 0 && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode('real')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                viewMode === 'real'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Real Photos
            </button>
            <button
              onClick={() => setViewMode('illustrated')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                viewMode === 'illustrated'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Illustrated View
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {projects.map((project) => {
          // Determine which image to show based on view mode
          const displayImage =
            viewMode === 'illustrated' && project.illustration
              ? project.illustration
              : project.image;

          return (
            <div
              key={project.id}
              className="group bg-white rounded-xl border-2 border-green-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-2 flex flex-col"
            >
              {/* Project Image */}
              <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
                <ImageLoader
                  src={displayImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* SDG Tag Overlay */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`${project.sdgColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}
                  >
                    {project.sdgTag.split(':')[0]}
                  </span>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-5 md:p-6 flex-1 flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-800 group-hover:text-green-600 transition-colors duration-200">
                  {project.title}
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm md:text-base">{project.location}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base mb-4 flex-1">
                  {project.description}
                </p>

                {/* Progress Bar */}
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs md:text-sm font-semibold text-gray-700">
                      Progress
                    </span>
                    <span className="text-xs md:text-sm font-bold text-green-600">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 md:h-3">
                    <div
                      className={`${project.sdgColor} h-2.5 md:h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                  Join Project
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State (if no projects) */}
      {projects.length === 0 && (
        <EmptyState
          type="projects"
          actionLabel="Browse Courses"
          onAction={() => {
            // Navigate to catalog or refresh
            window.location.href = '/catalog';
          }}
        />
      )}
    </div>
  );
}

export default Projects;

