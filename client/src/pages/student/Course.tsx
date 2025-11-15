import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ImageLoader from '@/components/ImageLoader';
import { uiIllustrations } from '@/utils/imagePaths';

function CoursePlayer() {
  const { id } = useParams<{ id: string }>();

  // Dummy course data
  const course = {
    id: id || 'climate-basics',
    title: 'Climate Science Basics',
    description: 'Learn the fundamentals of climate change and environmental impact.',
  };

  const [currentLesson, setCurrentLesson] = useState(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([1]);

  // Dummy lesson data
  const lessons = [
    { id: 1, title: 'Introduction to Climate Change', duration: '15 min' },
    { id: 2, title: 'Understanding Greenhouse Gases', duration: '20 min' },
    { id: 3, title: 'Global Warming Effects', duration: '18 min' },
    { id: 4, title: 'Climate Solutions', duration: '25 min' },
    { id: 5, title: 'Taking Action', duration: '15 min' },
  ];

  const handleMarkComplete = () => {
    if (!completedLessons.includes(currentLesson)) {
      setCompletedLessons([...completedLessons, currentLesson]);
    }
  };

  const isLessonComplete = (lessonId: number) => {
    return completedLessons.includes(lessonId);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
        Course: {course.title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left: Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player Placeholder */}
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
            <div className="aspect-video flex flex-col items-center justify-center text-white relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
              <div className="relative z-10 text-center">
                <svg
                  className="w-20 h-20 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-semibold">Video Player</p>
                <p className="text-sm opacity-75 mt-2">
                  Lesson {currentLesson}: {lessons[currentLesson - 1]?.title}
                </p>
              </div>
            </div>
          </div>

          {/* Lesson Text Content */}
          <div className="bg-white rounded-xl border-2 border-green-100 shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {lessons[currentLesson - 1]?.title}
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                Welcome to this lesson! In this module, you'll learn about the
                fundamental concepts of climate science and how they impact our
                planet.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                Climate change refers to long-term shifts in global temperatures
                and weather patterns. While climate change is a natural
                phenomenon, scientific evidence shows that human activities have
                been the main driver of climate change since the mid-20th
                century.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                Understanding these concepts is crucial for taking informed
                action to protect our environment and create a sustainable
                future for generations to come.
              </p>
            </div>
          </div>

          {/* Mark Lesson Complete Button */}
          <div className="lg:hidden">
            <button
              onClick={handleMarkComplete}
              disabled={isLessonComplete(currentLesson)}
              className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                isLessonComplete(currentLesson)
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLessonComplete(currentLesson) ? (
                <span className="flex items-center justify-center gap-2">
                  <span>✓</span> Lesson Complete
                </span>
              ) : (
                'Mark Lesson Complete'
              )}
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Lesson Navigation Menu */}
          <div className="bg-white rounded-xl border-2 border-green-100 shadow-lg p-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              Course Outline
            </h3>
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLesson(lesson.id)}
                  className={`w-full text-left p-4 rounded-lg border-l-4 transition-all duration-200 ${
                    currentLesson === lesson.id
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isLessonComplete(lesson.id) ? (
                        <span className="text-green-600 font-bold text-lg">
                          ✓
                        </span>
                      ) : (
                        <span className="text-gray-400 font-bold text-lg">
                          {lesson.id}
                        </span>
                      )}
                      <div>
                        <p
                          className={`font-semibold text-sm md:text-base ${
                            currentLesson === lesson.id
                              ? 'text-green-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {lesson.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mark Lesson Complete Button (Desktop) */}
          <div className="hidden lg:block">
            <button
              onClick={handleMarkComplete}
              disabled={isLessonComplete(currentLesson)}
              className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                isLessonComplete(currentLesson)
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLessonComplete(currentLesson) ? (
                <span className="flex items-center justify-center gap-2">
                  <span>✓</span> Lesson Complete
                </span>
              ) : (
                'Mark Lesson Complete'
              )}
            </button>
          </div>

          {/* AI Assistant Panel */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                AI
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                AI Assistant
              </h3>
            </div>
            <div className="mb-4">
              <ImageLoader
                src={uiIllustrations.onboardingEarthSmile}
                alt="AI Assistant Illustration"
                className="w-full h-auto rounded-lg"
                lazy={false}
              />
            </div>
            <p className="text-gray-700 text-sm md:text-base mb-4">
              Need help? Ask me anything about this course or climate science!
            </p>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-white border-2 border-green-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-100 transition-all duration-200">
                💡 Explain this concept
              </button>
              <button className="w-full px-4 py-2 bg-white border-2 border-green-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-100 transition-all duration-200">
                ❓ Ask a question
              </button>
              <button className="w-full px-4 py-2 bg-white border-2 border-green-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-100 transition-all duration-200">
                📚 Get study tips
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePlayer;
