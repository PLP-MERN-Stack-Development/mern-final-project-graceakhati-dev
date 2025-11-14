import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Learn Climate Action. Create Impact.
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Join verified projects. Earn certificates. Build green skills.
        </p>
        <Link
          to="/catalog"
          className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Start Learning
        </Link>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 border border-gray-200 rounded-lg text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="font-bold mb-2">Courses</h3>
          <p className="text-sm text-gray-600">
            Interactive climate education modules
          </p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h3 className="font-bold mb-2">Impact Projects</h3>
          <p className="text-sm text-gray-600">
            Verified community climate action
          </p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="font-bold mb-2">Certificates</h3>
          <p className="text-sm text-gray-600">Earn badges and credentials</p>
        </div>
      </section>
    </div>
  );
}

export default Landing;

