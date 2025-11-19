import ProtectedLink from './auth/protectedlink';
import ImageLoader from './imageloader';

export interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  image?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  price?: number;
}

function CourseCard({
  id,
  title,
  description,
  image,
  level = 'Beginner',
  tags = [],
  price,
}: CourseCardProps) {
  const levelColors = {
    Beginner: 'bg-green-100 text-green-800 border-green-200',
    Intermediate: 'bg-amber-100 text-amber-800 border-amber-200',
    Advanced: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <ProtectedLink
      to={`/courses/${id}`}
      className="block group"
      data-testid={`course-card-${id}`}
    >
      <div className="bg-white rounded-lg border-2 border-green-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
          {image ? (
            <div data-testid="course-image">
              <ImageLoader
                src={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-green-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          )}
          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${levelColors[level]}`}
              data-testid="level-badge"
            >
              {level}
            </span>
          </div>
          {/* Price Badge */}
          {price !== undefined && (
            <div className="absolute top-3 right-3">
              <span
                className="px-3 py-1.5 bg-green-600 text-white text-sm font-bold rounded-full shadow-md"
                data-testid="price-badge"
              >
                {price === 0 ? 'Free' : `KES ${price.toLocaleString()}`}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 flex-grow flex flex-col">
          <h3
            className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors duration-200 line-clamp-2"
            data-testid="course-title"
          >
            {title}
          </h3>

          {description && (
            <p
              className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow"
              data-testid="course-description"
            >
              {description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div
              className="flex flex-wrap gap-2 mb-4"
              data-testid="course-tags"
            >
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-green-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">View Course</span>
              <svg
                className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLink>
  );
}

export default CourseCard;
