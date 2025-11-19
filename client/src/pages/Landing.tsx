import HeroSection from '@/components/herosection';
import YouthSection from '@/components/youthsection';
import GreenEnergyIcons from '@/components/greenenergyicons';

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with animated elements */}
      <HeroSection />

      {/* Features Grid */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-6 md:p-8 border-2 border-green-100 rounded-xl text-center hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-5xl mb-4 animate-bounce">📚</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Courses</h3>
              <p className="text-sm md:text-base text-gray-600">
                Interactive climate education modules
              </p>
            </div>
            <div className="p-6 md:p-8 border-2 border-green-100 rounded-xl text-center hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-5xl mb-4 animate-bounce" style={{ animationDelay: '0.2s' }}>
                🌱
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Impact Projects</h3>
              <p className="text-sm md:text-base text-gray-600">
                Verified community climate action
              </p>
            </div>
            <div className="p-6 md:p-8 border-2 border-green-100 rounded-xl text-center hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-5xl mb-4 animate-bounce" style={{ animationDelay: '0.4s' }}>
                🏆
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Certificates</h3>
              <p className="text-sm md:text-base text-gray-600">
                Earn badges and credentials
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Youth Section with parallax effects */}
      <YouthSection />

      {/* Green Energy Icons Section */}
      <GreenEnergyIcons />
    </div>
  );
}

export default Landing;

