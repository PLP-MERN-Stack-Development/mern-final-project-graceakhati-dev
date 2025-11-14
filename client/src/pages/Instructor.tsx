function Instructor() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course Builder</h1>

      <div className="max-w-2xl">
        <div className="mb-6">
          <label className="block font-semibold mb-2">Course Title</label>
          <input
            type="text"
            placeholder="Enter course title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            placeholder="Describe your course..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Lessons</h2>
          <div className="border border-gray-300 rounded-lg p-4 mb-4">
            <input
              type="text"
              placeholder="Lesson title..."
              className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
            />
            <button className="px-4 py-2 bg-gray-200 rounded text-sm">
              Upload Video
            </button>
          </div>
          <button className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600">
            + Add New Lesson
          </button>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold">
            Save Draft
          </button>
          <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Publish Course
          </button>
        </div>
      </div>
    </div>
  );
}

export default Instructor;

