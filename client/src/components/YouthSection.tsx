import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ImageLoader from './ImageLoader';
import { heroImages } from '@/utils/imagePaths';

/**
 * YouthSection Component
 * 
 * Displays youth planting and learning images with parallax effects
 * Uses hero-youth-planting.png and hero-youth-learning.png
 */
function YouthSection() {
  const plantingRef = useRef<HTMLDivElement>(null);
  const learningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!plantingRef.current || !learningRef.current) return;

      const plantingRect = plantingRef.current.getBoundingClientRect();
      const learningRect = learningRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Only apply parallax when elements are in viewport
      if (plantingRect.top < windowHeight && plantingRect.bottom > 0) {
        const plantingOffset = (windowHeight - plantingRect.top) * 0.1;
        plantingRef.current.style.transform = `translateY(${plantingOffset}px)`;
      }

      if (learningRect.top < windowHeight && learningRect.bottom > 0) {
        const learningOffset = (windowHeight - learningRect.top) * 0.15;
        learningRef.current.style.transform = `translateY(${learningOffset}px)`;
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Join the Climate Action Movement
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn, act, and make a real difference in your community
          </p>
        </div>

        {/* Youth Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Youth Planting */}
          <div 
            ref={plantingRef}
            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          >
            <div className="relative h-64 md:h-80 overflow-hidden">
              <ImageLoader
                src={heroImages.youthPlanting}
                alt="Youth planting trees for climate action"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Take Action</h3>
                <p className="text-sm md:text-base">
                  Join verified tree planting projects in your community
                </p>
              </div>
            </div>
          </div>

          {/* Youth Learning */}
          <div 
            ref={learningRef}
            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          >
            <div className="relative h-64 md:h-80 overflow-hidden">
              <ImageLoader
                src={heroImages.youthLearning}
                alt="Students learning about climate action"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Learn & Grow</h3>
                <p className="text-sm md:text-base">
                  Access interactive courses and build green skills
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-block bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Ready to Make a Difference?
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Start your climate action journey today. Learn, act, and earn certificates.
            </p>
            <Link
              to="/catalog"
              className="inline-block px-10 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl animate-pulse"
            >
              Start Your Climate Journey
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default YouthSection;

