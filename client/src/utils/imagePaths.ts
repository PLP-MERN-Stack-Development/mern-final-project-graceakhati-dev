/**
 * Type-safe image paths for Planet Path assets
 * 
 * All paths are relative to /client/public/assets/
 * Usage: <ImageLoader src={heroImages.landscape1} alt="..." />
 */

// Hero Images
export const heroImages = {
  landscape1: '/assets/hero/hero-landscape-1.png',
  landscape2: '/assets/hero/hero-landscape-2.png',
  earthSoft: '/assets/hero/hero-earth-soft.png',
  youthPlanting: '/assets/hero/hero-youth-planting.png',
  youthLearning: '/assets/hero/hero-youth-learning.png',
} as const;

// Hero Icons
export const heroIcons = {
  solar: '/assets/hero/icon-solar.svg',
  windmill: '/assets/hero/icon-windmill.svg',
  energyPlant: '/assets/hero/icon-energy-plant.svg',
} as const;

// Course Icons
export const courseIcons = {
  climateBasics: '/assets/courses/course-climate-basics.svg',
  wasteManagement: '/assets/courses/course-waste-management.svg',
  renewableEnergy: '/assets/courses/course-renewable-energy.svg',
  treePlanting: '/assets/courses/course-tree-planting.svg',
  waterConservation: '/assets/courses/course-water-conservation.svg',
  climateEntrepreneurship: '/assets/courses/course-climate-entrepreneurship.svg',
} as const;

// Dashboard Badges
export const dashboardBadges = {
  leaf: '/assets/dashboard/badge-leaf.png',
  sun: '/assets/dashboard/badge-sun.png',
  water: '/assets/dashboard/badge-water.png',
  energy: '/assets/dashboard/badge-energy.png',
  recycling: '/assets/dashboard/badge-recycling.png',
  community: '/assets/dashboard/badge-community.png',
} as const;

// Dashboard Avatars
export const dashboardAvatars = {
  default: '/assets/dashboard/avatar-default.png',
  female: '/assets/dashboard/avatar-female.png',
  male: '/assets/dashboard/avatar-male.png',
  neutral: '/assets/dashboard/avatar-neutral.png',
} as const;

// Dashboard Certificate
export const dashboardCertificate = {
  frame: '/assets/dashboard/certificate-frame.png',
} as const;

// Project Images
export const projectImages = {
  treePlanting: '/assets/projects/project-tree-planting.jpg',
  cleanup: '/assets/projects/project-cleanup.jpg',
  waterConservation: '/assets/projects/project-water-conservation.jpg',
  urbanGardening: '/assets/projects/project-urban-gardening.jpg',
  youthActivity: '/assets/projects/project-youth-activity.jpg',
  plantingIllustration: '/assets/projects/project-planting-illustration.png',
  cleanupIllustration: '/assets/projects/project-cleanup-illustration.png',
} as const;

// UI Illustrations
export const uiIllustrations = {
  emptyCourses: '/assets/illustrations/empty-courses.png',
  emptyProjects: '/assets/illustrations/empty-projects.png',
  emptyProgress: '/assets/illustrations/empty-progress.png',
  emptyNotifications: '/assets/illustrations/empty-notifications.png',
  onboardingEarthSmile: '/assets/illustrations/onboarding-earth-smile.png',
  onboardingWelcome: '/assets/illustrations/onboarding-welcome.png',
  onboardingMobile: '/assets/illustrations/onboarding-mobile.png',
  error404: '/assets/illustrations/error-404-earth.png',
  errorOffline: '/assets/illustrations/error-offline-plant.png',
} as const;

// Navigation Icons
export const navIcons = {
  home: '/assets/icons/icon-home.svg',
  courses: '/assets/icons/icon-courses.svg',
  dashboard: '/assets/icons/icon-dashboard.svg',
  projects: '/assets/icons/icon-projects.svg',
  badges: '/assets/icons/icon-badges.svg',
  certificates: '/assets/icons/icon-certificates.svg',
  settings: '/assets/icons/icon-settings.svg',
  leaf: '/assets/icons/icon-leaf.svg',
} as const;

// Type exports for type-safe usage
export type HeroImagePath = typeof heroImages[keyof typeof heroImages];
export type HeroIconPath = typeof heroIcons[keyof typeof heroIcons];
export type CourseIconPath = typeof courseIcons[keyof typeof courseIcons];
export type DashboardBadgePath = typeof dashboardBadges[keyof typeof dashboardBadges];
export type DashboardAvatarPath = typeof dashboardAvatars[keyof typeof dashboardAvatars];
export type ProjectImagePath = typeof projectImages[keyof typeof projectImages];
export type UIIllustrationPath = typeof uiIllustrations[keyof typeof uiIllustrations];
export type NavIconPath = typeof navIcons[keyof typeof navIcons];

// Union type for all image paths
export type ImagePath =
  | HeroImagePath
  | HeroIconPath
  | CourseIconPath
  | DashboardBadgePath
  | DashboardAvatarPath
  | ProjectImagePath
  | UIIllustrationPath
  | NavIconPath;

