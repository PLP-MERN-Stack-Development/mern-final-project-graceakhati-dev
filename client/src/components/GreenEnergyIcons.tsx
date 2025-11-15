import ImageLoader from './ImageLoader';
import { heroIcons } from '@/utils/imagePaths';

/**
 * GreenEnergyIcons Component
 * 
 * Displays green energy icons in a responsive grid
 * Uses icon-solar.svg, icon-windmill.svg, and icon-energy-plant.svg
 */
function GreenEnergyIcons() {
  const energyIcons = [
    {
      src: heroIcons.solar,
      alt: 'Solar Energy',
      title: 'Solar Power',
      description: 'Harness the power of the sun',
    },
    {
      src: heroIcons.windmill,
      alt: 'Wind Energy',
      title: 'Wind Energy',
      description: 'Clean energy from wind turbines',
    },
    {
      src: heroIcons.energyPlant,
      alt: 'Green Energy Plant',
      title: 'Green Energy',
      description: 'Sustainable energy solutions',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Green Energy Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore renewable energy technologies and their impact
          </p>
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {energyIcons.map((icon, index) => (
            <div
              key={index}
              className="group text-center p-6 md:p-8 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border-2 border-green-100 hover:border-green-300"
            >
              {/* Icon Container with Animation */}
              <div className="mb-6 flex justify-center">
                <div className="relative group-hover:scale-110 transition-transform duration-300">
                  <ImageLoader
                    src={icon.src}
                    alt={icon.alt}
                    className="w-24 h-24 md:w-32 md:h-32 drop-shadow-lg"
                    lazy={false}
                  />
                  {/* Animated Ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-green-300 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                {icon.title}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                {icon.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GreenEnergyIcons;

