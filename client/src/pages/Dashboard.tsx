import { useState } from 'react';
import ImageLoader from '@/components/imageloader';
import {
  dashboardBadges,
  dashboardAvatars,
  dashboardCertificate,
} from '@/utils/imagePaths';

function Dashboard() {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    dashboardAvatars.default
  );

  // All available badges
  const badges = [
    { src: dashboardBadges.leaf, alt: 'Leaf Badge', name: 'Leaf' },
    { src: dashboardBadges.sun, alt: 'Sun Badge', name: 'Sun' },
    { src: dashboardBadges.water, alt: 'Water Badge', name: 'Water' },
    { src: dashboardBadges.energy, alt: 'Energy Badge', name: 'Energy' },
    { src: dashboardBadges.recycling, alt: 'Recycling Badge', name: 'Recycling' },
    { src: dashboardBadges.community, alt: 'Community Badge', name: 'Community' },
  ];

  // Available avatars
  const avatarOptions = [
    { src: dashboardAvatars.default, name: 'Default' },
    { src: dashboardAvatars.female, name: 'Female' },
    { src: dashboardAvatars.male, name: 'Male' },
    { src: dashboardAvatars.neutral, name: 'Neutral' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Avatar */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <ImageLoader
                src={selectedAvatar}
                alt="Profile Avatar"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-green-200 shadow-lg"
                lazy={false}
              />
            </div>
            {/* Avatar Selector */}
            <div className="flex gap-2 flex-wrap justify-center">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.name}
                  onClick={() => setSelectedAvatar(avatar.src)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    selectedAvatar === avatar.src
                      ? 'border-green-600 scale-110 shadow-md'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                  aria-label={`Select ${avatar.name} avatar`}
                >
                  <ImageLoader
                    src={avatar.src}
                    alt={avatar.name}
                    className="w-full h-full rounded-full"
                    lazy={false}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Welcome Text */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">
              Welcome back, Grace! 👋
            </h1>
            <p className="text-gray-600">
              Continue your climate action journey
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
          Learning Progress
        </h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-800">
                Climate Science Basics
              </span>
              <span className="font-bold text-green-600">60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: '60%' }}
              ></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-800">
                Waste Management
              </span>
              <span className="font-bold text-green-600">30%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: '30%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="p-4 border-l-4 border-green-600 bg-green-50 rounded-r-lg shadow-sm">
            <div className="font-semibold text-gray-800">
              ✅ Completed: Introduction to Climate Change
            </div>
            <div className="text-sm text-gray-600 mt-1">2 days ago</div>
          </div>
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg shadow-sm">
            <div className="font-semibold text-gray-800">
              📚 Started: Waste Management Course
            </div>
            <div className="text-sm text-gray-600 mt-1">5 days ago</div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
          Your Badges
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-center p-4 bg-white rounded-xl border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <ImageLoader
                src={badge.src}
                alt={badge.alt}
                className="w-16 h-16 md:w-20 md:h-20 group-hover:scale-110 transition-transform duration-300"
                lazy={false}
              />
              <span className="mt-2 text-xs font-semibold text-gray-700 text-center">
                {badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
          Your Certificates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mock Certificate */}
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-100 hover:border-green-300 transition-all duration-300 transform hover:scale-105">
            {/* Certificate Frame */}
            <div className="relative">
              <ImageLoader
                src={dashboardCertificate.frame}
                alt="Certificate Frame"
                className="w-full h-auto"
                lazy={false}
              />
              {/* Certificate Content Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Certificate of Completion
                </div>
                <div className="text-lg md:text-xl text-gray-700 mb-4">
                  Climate Science Basics
                </div>
                <div className="text-sm md:text-base text-gray-600 mb-6">
                  This certifies that <span className="font-semibold">Grace Akhati</span> has
                  successfully completed the Climate Science Basics course.
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  Issued on January 15, 2025
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder for additional certificates */}
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200 flex items-center justify-center min-h-[300px]">
            <div className="text-center p-6">
              <div className="text-4xl mb-3">📜</div>
              <p className="text-gray-600 font-semibold">
                Complete more courses to earn certificates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

