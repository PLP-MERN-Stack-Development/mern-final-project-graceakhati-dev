import { useState } from 'react';
import { useCourseStore, Course } from '@/store/useCourseStore';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ImageLoader from '@/components/ImageLoader';

/**
 * Course form data type (without id and status)
 */
interface CourseFormData {
  title: string;
  description: string;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  tags: string[];
  price: number;
}

/**
 * Initial form state
 */
const initialFormData: CourseFormData = {
  title: '',
  description: '',
  image: '',
  level: 'Beginner',
  tags: [],
  price: 0,
};

function Instructor() {
  const { pending, addCourse, rejectCourse } = useCourseStore();
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<CourseFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form input change
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  /**
   * Handle tag input (comma-separated or Enter key)
   */
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
        setTagInput('');
      }
    }
  };

  /**
   * Remove a tag
   */
  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Generate a unique ID (in production, this would come from the backend)
    const courseId = `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add course to pending
    addCourse({
      id: courseId,
      ...formData,
    });

    // Reset form
    setFormData(initialFormData);
    setTagInput('');
    setIsSubmitting(false);
  };

  /**
   * Start editing a course
   */
  const startEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setEditFormData({
      title: course.title,
      description: course.description,
      image: course.image,
      level: course.level,
      tags: course.tags,
      price: course.price,
    });
  };

  /**
   * Cancel editing
   */
  const cancelEdit = () => {
    setEditingCourseId(null);
    setEditFormData(initialFormData);
  };

  /**
   * Handle edit form input change
   */
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  // Note: These functions are defined but not currently used in the UI
  // They can be enabled when tag editing is added to the edit form
  // const handleEditTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter' || e.key === ',') {
  //     e.preventDefault();
  //     const tag = tagInput.trim();
  //     if (tag && !editFormData.tags.includes(tag)) {
  //       setEditFormData((prev) => ({
  //         ...prev,
  //         tags: [...prev.tags, tag],
  //       }));
  //       setTagInput('');
  //     }
  //   }
  // };

  // const removeEditTag = (tagToRemove: string) => {
  //   setEditFormData((prev) => ({
  //     ...prev,
  //     tags: prev.tags.filter((tag) => tag !== tagToRemove),
  //   }));
  // };

  /**
   * Save edited course
   */
  const saveEdit = () => {
    if (!editingCourseId) return;

    // Remove old course and add updated one
    rejectCourse(editingCourseId);
    addCourse({
      id: editingCourseId,
      ...editFormData,
    });

    // Reset edit state
    setEditingCourseId(null);
    setEditFormData(initialFormData);
    setTagInput('');
  };

  /**
   * Delete a course
   */
  const handleDelete = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      rejectCourse(courseId);
    }
  };

  /**
   * Get status badge color
   */
  const getStatusBadgeColor = (status: 'pending' | 'approved') => {
    return status === 'pending'
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
      : 'bg-green-100 text-green-800 border-green-200';
  };

  /**
   * Get level badge color
   */
  const getLevelBadgeColor = (level: string) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800 border-green-200',
      Intermediate: 'bg-amber-100 text-amber-800 border-amber-200',
      Expert: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[level as keyof typeof colors] || colors.Beginner;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-planet-green-dark mb-2 font-planet">
          Course Builder
        </h1>
        <p className="text-gray-600">
          Create and manage your courses. New courses will be submitted for approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Creation Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-planet-green-dark mb-6 font-planet">
              Create New Course
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe your course..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Level and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="level"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Level *
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark focus:border-transparent transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Price (KES) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark focus:border-transparent transition-all"
                />
                {formData.image && (
                  <div className="mt-2">
                    <ImageLoader
                      src={formData.image}
                      alt="Course preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      fallback="/assets/illustrations/error-offline-plant.png"
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  placeholder="Type tags and press Enter or comma..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark focus:border-transparent transition-all"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                          aria-label={`Remove tag ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  text={isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                  onClick={() => {}}
                  className="flex-1 bg-planet-green-dark hover:bg-planet-green-dark/90 text-white"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialFormData);
                    setTagInput('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Pending Courses List */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-planet-green-dark mb-4 font-planet">
              Pending Courses
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {pending.length} course{pending.length !== 1 ? 's' : ''} pending approval
            </p>

            {pending.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending courses</p>
                <p className="text-sm mt-2">Create a course to get started!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {pending.map((course) => (
                  <div key={course.id}>
                    {editingCourseId === course.id ? (
                      /* Edit Form */
                      <Card className="p-4 bg-green-50 border-2 border-green-200">
                        <h3 className="font-bold text-planet-green-dark mb-4">Edit Course</h3>
                        <div className="space-y-3">
                          <input
                            type="text"
                            name="title"
                            value={editFormData.title}
                            onChange={handleEditInputChange}
                            placeholder="Title"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark"
                          />
                          <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditInputChange}
                            placeholder="Description"
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark resize-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              name="level"
                              value={editFormData.level}
                              onChange={handleEditInputChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Expert">Expert</option>
                            </select>
                            <input
                              type="number"
                              name="price"
                              value={editFormData.price}
                              onChange={handleEditInputChange}
                              placeholder="Price"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark"
                            />
                          </div>
                          <input
                            type="url"
                            name="image"
                            value={editFormData.image}
                            onChange={handleEditInputChange}
                            placeholder="Image URL"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-green-dark"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={saveEdit}
                              className="flex-1 px-3 py-2 text-sm bg-planet-green-dark text-white rounded-lg hover:bg-planet-green-dark/90 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      /* Course Card */
                      <Card className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-2 flex-1">
                            {course.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${getStatusBadgeColor(
                              course.status
                            )}`}
                          >
                            {course.status}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${getLevelBadgeColor(
                              course.level
                            )}`}
                          >
                            {course.level}
                          </span>
                        </div>
                        {course.image && (
                          <div className="mb-3">
                            <ImageLoader
                              src={course.image}
                              alt={course.title}
                              className="w-full h-24 object-cover rounded-lg"
                              fallback="/assets/illustrations/error-offline-plant.png"
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(course)}
                            className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(course.id)}
                            className="flex-1 px-3 py-2 text-xs bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Instructor;
