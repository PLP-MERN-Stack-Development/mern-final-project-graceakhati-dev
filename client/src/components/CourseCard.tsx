import { Link } from 'react-router-dom';
import Card from './Card';

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  level?: string;
  lessonCount?: number;
}

function CourseCard({
  id,
  title,
  description,
  imageUrl,
  level = 'Beginner',
  lessonCount = 0,
}: CourseCardProps) {
  return (
    <Link to={`/course/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="h-48 bg-gray-200">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mb-3">{description}</p>
          )}
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {level}
            </span>
            {lessonCount > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {lessonCount} Lessons
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default CourseCard;

