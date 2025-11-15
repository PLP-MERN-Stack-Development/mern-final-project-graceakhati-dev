import { Link } from 'react-router-dom';
import ImageLoader from './ImageLoader';
import { heroImages } from '@/utils/imagePaths';

/**
 * HeroSection Component
 * 
 * Displays hero images with animated floating elements
 * Uses hero-landscape-1.png, hero-landscape-2.png, and hero-earth-soft.png
 */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white py-12 md:py-20">
      {/* Background Landscape 1 */}
      <div className="absolute inset-0 opacity-30">
        <ImageLoader
          src={heroImages.landscape1}
          alt="Planet Path landscape background"
          className="w-full h-full object-cover"
          lazy={false}
        />
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
              <span className="inline-block animate-wiggle">Learn</span> Climate Action.
              <br />
              <span className="text-green-600 animate-pulse inline-block">Create Impact.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
              Join verified projects. Earn certificates. Build green skills for a sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/catalog"
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
              >
                Start Learning
              </Link>
              <Link
                to="/projects"
                className="px-8 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all duration-300 transform hover:scale-105 text-center"
              >
                View Projects
              </Link>
            </div>
          </div>

          {/* Right Column - Animated Earth */}
          <div className="relative flex justify-center items-center">
            {/* Floating Earth Animation */}
            <div className="relative animate-bounce-slow">
              <ImageLoader
                src={heroImages.earthSoft}
                alt="Planet Path Earth mascot"
                className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 drop-shadow-2xl"
                lazy={false}
              />
              {/* Floating decorative elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-200 rounded-full opacity-60 animate-float-1"></div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-yellow-200 rounded-full opacity-50 animate-float-2"></div>
              <div className="absolute top-1/2 -right-8 w-6 h-6 bg-blue-200 rounded-full opacity-70 animate-float-3"></div>
            </div>
          </div>
        </div>

        {/* Landscape 2 - Bottom Section */}
        <div className="mt-12 md:mt-16 rounded-lg overflow-hidden shadow-xl">
          <ImageLoader
            src={heroImages.landscape2}
            alt="Planet Path mountains and forest"
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

