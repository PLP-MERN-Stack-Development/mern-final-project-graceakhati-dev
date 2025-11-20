import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '@/store/useCourseStore';
import Card from '@/components/Card';
import Button from '@/components/Button';

function CreateCourse() {
  const navigate = useNavigate();
  const { addCourse } = useCourseStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    tags: '',
    price: 0,
    image: '',
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    general?: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    if (!formData.description.trim()) {
      setErrors({ description: 'Description is required' });
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Map lowercase level to store format
      const levelMap: Record<string, 'Beginner' | 'Intermediate' | 'Expert'> = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Expert', // Map 'advanced' to 'Expert' for store compatibility
      };

      addCourse({
        id: `course-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image || '/assets/courses/course-climate-basics.svg',
        level: levelMap[formData.level] || 'Beginner',
        tags: tagsArray,
        price: formData.price,
      });

      navigate('/instructor/courses');
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create course',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-sand via-soft-white to-light-sand p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-playful text-forest-green mb-4 animate-scale-pulse">
            Create New Course 📚
          </h1>
          <p className="text-earth-brown text-lg font-medium">
            Share your knowledge and inspire climate action
          </p>
        </div>

        <Card className="p-6 md:p-8 bg-soft-white animate-fade-in">
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-semibold">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-earth-brown mb-2">
                Course Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.title
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-leaf-green/40 focus:border-leaf-green focus:ring-leaf-green/20 bg-white'
                }`}
                placeholder="e.g., Introduction to Climate Science"
                disabled={isSubmitting}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-earth-brown mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.description
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-leaf-green/40 focus:border-leaf-green focus:ring-leaf-green/20 bg-white'
                }`}
                placeholder="Describe what students will learn..."
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Level */}
            <div>
              <label htmlFor="level" className="block text-sm font-semibold text-earth-brown mb-2">
                Difficulty Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
                disabled={isSubmitting}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-semibold text-earth-brown mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
                placeholder="climate, science, environment"
                disabled={isSubmitting}
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-earth-brown mb-2">
                Price (KES)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="100"
                className="w-full px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className="block text-sm font-semibold text-earth-brown mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                text={isSubmitting ? 'Creating...' : 'Create Course'}
                onClick={() => {}}
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => navigate('/instructor/courses')}
                className="px-6 py-3 border-2 border-earth-brown text-earth-brown rounded-lg font-playful font-bold transition-all duration-300 transform hover:scale-105 active:scale-95"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default CreateCourse;

