function Catalog() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course Catalog</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div
            key={id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-bold mb-2">Course Title {id}</h3>
              <p className="text-sm text-gray-600 mb-3">
                Course description placeholder
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Beginner
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;

