import { useState, useRef, FormEvent } from 'react';
import submissionService, { Submission, SubmitProjectParams } from '@/services/submissionService';

interface SubmitProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  assignmentId?: string;
  onSuccess: (submission: Submission) => void;
  onError?: (error: string) => void;
}

/**
 * SubmitProjectModal - Modal for submitting a project with image, text, and geolocation
 * Uses POST /api/submissions with multipart/form-data
 */
function SubmitProjectModal({ 
  isOpen, 
  onClose, 
  courseId, 
  assignmentId, 
  onSuccess,
  onError 
}: SubmitProjectModalProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [geotag, setGeotag] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const errorMsg = 'Please select an image file';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        const errorMsg = 'Image size must be less than 10MB';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      setImage(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get current geolocation
  const handleGetLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser';
      setLocationError(errorMsg);
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeotag({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      () => {
        const errorMsg = 'Failed to get location. Please enable location permissions.';
        setLocationError(errorMsg);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!image) {
      const errorMsg = 'Please select an image';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    if (!description.trim()) {
      const errorMsg = 'Please enter a description';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    if (!courseId) {
      const errorMsg = 'Course ID is required';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      const submissionParams: SubmitProjectParams = {
        courseId,
        image,
        description,
      };

      if (geotag) {
        submissionParams.geotag = geotag;
      }

      if (assignmentId) {
        submissionParams.assignmentId = assignmentId;
      }

      // Call submissionService.submitProject() directly
      const submission = await submissionService.submitProject(submissionParams);

      // Reset form
      setImage(null);
      setImagePreview(null);
      setDescription('');
      setGeotag(null);
      setLocationError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback
      onSuccess(submission);

      // Close modal
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit project. Please try again.';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      setImage(null);
      setImagePreview(null);
      setDescription('');
      setGeotag(null);
      setLocationError(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Submit Project</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label 
              htmlFor="project-image-input"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Project Image *
            </label>
            <div className="space-y-4">
              <input
                id="project-image-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                aria-describedby="project-image-description"
              />
              {imagePreview && (
                <div className="mt-4" id="project-image-description">
                  <img
                    src={imagePreview}
                    alt="Project preview"
                    className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label 
              htmlFor="project-description-textarea"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Description *
            </label>
            <textarea
              id="project-description-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              placeholder="Describe your project..."
              aria-describedby="project-description-help"
            />
            <p id="project-description-help" className="sr-only">
              Enter a detailed description of your project submission
            </p>
          </div>

          {/* Geolocation */}
          <div>
            <label 
              htmlFor="location-button"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Location (Optional)
            </label>
            <div className="space-y-2">
              <button
                id="location-button"
                type="button"
                onClick={handleGetLocation}
                disabled={isLoading || isGettingLocation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby={geotag ? "location-captured" : locationError ? "location-error" : undefined}
              >
                {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
              </button>
              {geotag && (
                <div id="location-captured" className="p-3 bg-green-50 border border-green-200 rounded-lg" role="status">
                  <p className="text-sm text-green-800">
                    <strong>Location captured:</strong> {geotag.lat.toFixed(6)}, {geotag.lng.toFixed(6)}
                  </p>
                </div>
              )}
              {locationError && (
                <div id="location-error" className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                  <p className="text-sm text-red-800">{locationError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-semibold">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !image || !description.trim()}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitProjectModal;

