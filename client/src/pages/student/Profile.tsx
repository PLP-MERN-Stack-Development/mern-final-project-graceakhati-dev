import { useState } from 'react';
import ImageLoader from '@/components/ImageLoader';
import {
  dashboardAvatars,
  dashboardBadges,
  dashboardCertificate,
} from '@/utils/imagePaths';

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    dashboardAvatars.female
  );
  const [userInfo, setUserInfo] = useState({
    name: 'Grace Akhati',
    email: 'grace.akhati@example.com',
    location: 'Nairobi, Kenya',
    bio: 'Passionate about climate action and environmental sustainability. Learning and making a difference, one step at a time!',
    joinDate: 'January 2024',
  });

  const handleAvatarChange = () => {
    // Cycle through avatars or open avatar selector
    const avatars: string[] = [
      dashboardAvatars.female,
      dashboardAvatars.male,
      dashboardAvatars.default,
      dashboardAvatars.neutral,
    ];
    const currentIndex = avatars.indexOf(selectedAvatar);
    const nextIndex = (currentIndex + 1) % avatars.length;
    setSelectedAvatar(avatars[nextIndex] || dashboardAvatars.female);
  };

  // All badges
  const badges = [
    { src: dashboardBadges.leaf, alt: 'Leaf Badge', name: 'Leaf' },
    { src: dashboardBadges.sun, alt: 'Sun Badge', name: 'Sun' },
    { src: dashboardBadges.water, alt: 'Water Badge', name: 'Water' },
    { src: dashboardBadges.energy, alt: 'Energy Badge', name: 'Energy' },
    { src: dashboardBadges.recycling, alt: 'Recycling Badge', name: 'Recycling' },
    { src: dashboardBadges.community, alt: 'Community Badge', name: 'Community' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border-2 border-green-100 shadow-lg p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="hover:animate-bounce transition-transform duration-200">
                <ImageLoader
                  src={selectedAvatar}
                  alt="Profile Avatar"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-green-200 shadow-xl"
                  lazy={false}
                />
              </div>
              {/* Avatar overlay on hover */}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold">
                  Change
                </span>
              </div>
            </div>
            <button
              onClick={handleAvatarChange}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-sm"
            >
              Change Avatar
            </button>
          </div>

          {/* Name and Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {userInfo.name}
            </h1>
            <p className="text-gray-600 text-lg mb-4">{userInfo.email}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                📍 {userInfo.location}
              </span>
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                📅 Joined {userInfo.joinDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white rounded-2xl border-2 border-green-100 shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Personal Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md text-sm"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={userInfo.bio}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, bio: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-all"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 text-base leading-relaxed">
                    {userInfo.bio}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-all"
                    />
                  ) : (
                    <p className="text-gray-700">{userInfo.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userInfo.location}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, location: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-all"
                    />
                  ) : (
                    <p className="text-gray-700">{userInfo.location}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Section */}
          <div className="bg-white rounded-2xl border-2 border-green-100 shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Certificate 1 */}
              <div className="relative bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-100 hover:border-green-300 transition-all duration-300 transform hover:scale-105">
                <ImageLoader
                  src={dashboardCertificate.frame}
                  alt="Certificate Frame"
                  className="w-full h-auto"
                  lazy={false}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8 text-center">
                  <div className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    Certificate of Completion
                  </div>
                  <div className="text-base md:text-lg text-gray-700 mb-2">
                    Climate Science Basics
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    Issued January 2024
                  </div>
                </div>
              </div>

              {/* Certificate 2 */}
              <div className="relative bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-100 hover:border-green-300 transition-all duration-300 transform hover:scale-105">
                <ImageLoader
                  src={dashboardCertificate.frame}
                  alt="Certificate Frame"
                  className="w-full h-auto"
                  lazy={false}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8 text-center">
                  <div className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    Certificate of Completion
                  </div>
                  <div className="text-base md:text-lg text-gray-700 mb-2">
                    Waste Management
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    Issued February 2024
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Badges */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border-2 border-green-100 shadow-lg p-6 md:p-8 sticky top-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Badges Earned
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="group flex flex-col items-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-semibold">
                {badges.length} Badges Earned
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

