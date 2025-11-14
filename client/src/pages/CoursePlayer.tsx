import { useParams } from 'react-router-dom';

function CoursePlayer() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course {id}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-white">
            Video Player
          </div>
          <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Complete Lesson
          </button>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold mb-4">Course Outline</h3>
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((lesson) => (
                <li
                  key={lesson}
                  className="p-2 border-l-4 border-gray-300 hover:border-green-600 cursor-pointer"
                >
                  Lesson {lesson}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePlayer;

