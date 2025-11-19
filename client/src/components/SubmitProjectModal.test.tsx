import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubmitProjectModal from './submitprojectmodal';
import submissionService from '@/services/submissionService';

// Mock submissionService
vi.mock('@/services/submissionService', () => ({
  default: {
    submitProject: vi.fn(),
  },
}));

// Mock FileReader
global.FileReader = class FileReader extends EventTarget {
  result: string | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL(_file: Blob) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,mock-image-data';
      if (this.onloadend) {
        const event = new ProgressEvent('loadend') as ProgressEvent<FileReader>;
        this.onloadend.call(this, event);
      }
    }, 0);
  }
} as any;

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('SubmitProjectModal', () => {
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGeolocation.getCurrentPosition.mockClear();
  });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    courseId: 'course123',
    onSuccess: mockOnSuccess,
    onError: mockOnError,
  };

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<SubmitProjectModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Submit Project')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(<SubmitProjectModal {...defaultProps} />);
      expect(screen.getByText('Submit Project')).toBeInTheDocument();
    });

    it('should render form fields with correct htmlFor/id associations', () => {
      render(<SubmitProjectModal {...defaultProps} />);
      
      // Verify label and input are correctly associated via htmlFor/id
      const imageLabel = screen.getByText(/project image/i);
      expect(imageLabel).toHaveAttribute('for', 'project-image-input');
      const imageInput = screen.getByLabelText(/project image/i);
      expect(imageInput).toHaveAttribute('id', 'project-image-input');
      
      // Verify description label and textarea are correctly associated
      const descriptionLabel = screen.getByText(/description/i);
      expect(descriptionLabel).toHaveAttribute('for', 'project-description-textarea');
      const descriptionTextarea = screen.getByLabelText(/description/i);
      expect(descriptionTextarea).toHaveAttribute('id', 'project-description-textarea');
      
      expect(screen.getByText(/location/i)).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      render(<SubmitProjectModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /submit project/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Image Upload', () => {
    it('should handle image file selection', async () => {
      const user = userEvent.setup();
      render(<SubmitProjectModal {...defaultProps} />);

      const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
      // Use the id attribute to find the input (matches htmlFor on label)
      const input = screen.getByLabelText(/project image/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(input.files?.[0]).toBe(file);
        expect(input.files?.[0]?.name).toBe('test-image.png');
      });
    });

    it('should show error for non-image file', async () => {
      const user = userEvent.setup();
      render(<SubmitProjectModal {...defaultProps} />);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/project image/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/please select an image file/i)).toBeInTheDocument();
      });
    });

    it('should show error for file larger than 10MB', async () => {
      const user = userEvent.setup();
      render(<SubmitProjectModal {...defaultProps} />);

      // Create a file larger than 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large-image.png', {
        type: 'image/png',
      });
      const input = screen.getByLabelText(/project image/i) as HTMLInputElement;

      await user.upload(input, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/image size must be less than 10mb/i)).toBeInTheDocument();
      });
    });

    it('should display image preview after selection', async () => {
      const user = userEvent.setup();
      render(<SubmitProjectModal {...defaultProps} />);

      const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
      const input = screen.getByLabelText(/project image/i) as HTMLInputElement;

      await user.upload(input, file);

      // Wait for FileReader to complete and preview to appear
      await waitFor(() => {
        expect(screen.getByAltText('Project preview')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Description Input', () => {
    it('should update description on input', async () => {
      const user = userEvent.setup();
      render(<SubmitProjectModal {...defaultProps} />);

      // Use the id attribute to find the textarea (matches htmlFor on label)
      const textarea = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await user.type(textarea, 'This is my project description');

      expect(textarea.value).toBe('This is my project description');
    });
  });

  describe('Geolocation', () => {
    it('should get current location when button clicked', async () => {
      const user = userEvent.setup();
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
          },
        } as GeolocationPosition);
      });

      render(<SubmitProjectModal {...defaultProps} />);

      const locationButton = screen.getByRole('button', { name: /get current location/i });
      await user.click(locationButton);

      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
        expect(screen.getByText(/location captured/i)).toBeInTheDocument();
      });
    });

    it('should show error when geolocation is not supported', async () => {
      const user = userEvent.setup();
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true,
      });

      render(<SubmitProjectModal {...defaultProps} />);

      const locationButton = screen.getByRole('button', { name: /get current location/i });
      await user.click(locationButton);

      await waitFor(() => {
        expect(screen.getByText(/geolocation is not supported/i)).toBeInTheDocument();
      });
    });

    it('should show error when geolocation fails', async () => {
      const user = userEvent.setup();
      mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
        error({
          code: 1,
          message: 'User denied geolocation',
        } as GeolocationPositionError);
      });

      render(<SubmitProjectModal {...defaultProps} />);

      const locationButton = screen.getByRole('button', { name: /get current location/i });
      await user.click(locationButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to get location/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const mockSubmission = {
        _id: 'submission1',
        courseId: 'course123',
        userId: 'user1',
        files: ['file-url'],
        aiScore: 85,
        verified: true,
      };

      (submissionService.submitProject as any).mockResolvedValue(mockSubmission);

      render(<SubmitProjectModal {...defaultProps} />);

      // Upload image using the input with id="project-image-input"
      const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
      const imageInput = screen.getByLabelText(/project image/i) as HTMLInputElement;
      await user.upload(imageInput, file);

      // Wait for file to be processed
      await waitFor(() => {
        expect(imageInput.files?.[0]).toBe(file);
      });

      // Enter description using the textarea with id="project-description-textarea"
      const textarea = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await user.type(textarea, 'This is my project description');

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit project/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submissionService.submitProject).toHaveBeenCalledWith({
          courseId: 'course123',
          image: file,
          description: 'This is my project description',
        });
        expect(mockOnSuccess).toHaveBeenCalledWith(mockSubmission);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should submit with geotag if provided', async () => {
      const user = userEvent.setup();
      const mockSubmission = {
        _id: 'submission1',
        courseId: 'course123',
        userId: 'user1',
        files: ['file-url'],
      };

      (submissionService.submitProject as any).mockResolvedValue(mockSubmission);

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
          },
        } as GeolocationPosition);
      });

      render(<SubmitProjectModal {...defaultProps} />);

      // Upload image using the input with id="project-image-input"
      const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
      const imageInput = screen.getByLabelText(/project image/i) as HTMLInputElement;
      await user.upload(imageInput, file);

      // Wait for file to be processed
      await waitFor(() => {
        expect(imageInput.files?.[0]).toBe(file);
      });

      // Enter description using the textarea with id="project-description-textarea"
      const textarea = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await user.type(textarea, 'Description');

      // Get location
      const locationButton = screen.getByRole('button', { name: /get current location/i });
      await user.click(locationButton);

      await waitFor(() => {
        expect(screen.getByText(/location captured/i)).toBeInTheDocument();
      });

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit project/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submissionService.submitProject).toHaveBeenCalledWith(
          expect.objectContaining({
            geotag: { lat: 40.7128, lng: -74.006 },
          })
        );
      });
    });

    it('should show error when image is missing', async () => {
      const user = userEvent.setup();
      render(<SubmitProjectModal {...defaultProps} />);

      const textarea = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await user.type(textarea, 'Description without image');

      const submitButton = screen.getByRole('button', { name: /submit project/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select an image/i)).toBeInTheDocument();
        expect(submissionService.submitProject).not.toHaveBeenCalled();
      });
    });

    it('should show error when description is missing', async () => {
      const user = userEvent.setup();
      render(<SubmitProjectModal {...defaultProps} />);

      const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
      const imageInput = screen.getByLabelText(/project image/i) as HTMLInputElement;
      await user.upload(imageInput, file);

      // Wait for file to be processed
      await waitFor(() => {
        expect(imageInput.files?.[0]).toBe(file);
      });

      const submitButton = screen.getByRole('button', { name: /submit project/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a description/i)).toBeInTheDocument();
        expect(submissionService.submitProject).not.toHaveBeenCalled();
      });
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      (submissionService.submitProject as any).mockRejectedValue(
        new Error('Submission failed')
      );

      render(<SubmitProjectModal {...defaultProps} />);

      const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
      const imageInput = screen.getByLabelText(/project image/i) as HTMLInputElement;
      await user.upload(imageInput, file);

      const textarea = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await user.type(textarea, 'Description');

      const submitButton = screen.getByRole('button', { name: /submit project/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      (submissionService.submitProject as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<SubmitProjectModal {...defaultProps} />);

      const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
      const imageInput = screen.getByLabelText(/project image/i) as HTMLInputElement;
      await user.upload(imageInput, file);

      const textarea = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await user.type(textarea, 'Description');

      const submitButton = screen.getByRole('button', { name: /submit project/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Modal Close', () => {
    it('should call onClose when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(<SubmitProjectModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when close button clicked', async () => {
      const user = userEvent.setup();
      render(<SubmitProjectModal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /×/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close when loading', async () => {
      const user = userEvent.setup();
      (submissionService.submitProject as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<SubmitProjectModal {...defaultProps} />);

      const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
      const imageInput = screen.getByLabelText(/project image/i) as HTMLInputElement;
      await user.upload(imageInput, file);

      const textarea = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await user.type(textarea, 'Description');

      const submitButton = screen.getByRole('button', { name: /submit project/i });
      await user.click(submitButton);

      const closeButton = screen.getByRole('button', { name: /×/i });
      expect(closeButton).toBeDisabled();
    });
  });

  describe('Assignment ID', () => {
    it('should pass assignmentId if provided', async () => {
      const user = userEvent.setup();
      const mockSubmission = {
        _id: 'submission1',
        courseId: 'course123',
        assignmentId: 'assignment1',
      };

      (submissionService.submitProject as any).mockResolvedValue(mockSubmission);

      render(<SubmitProjectModal {...defaultProps} assignmentId="assignment1" />);

      const file = new File(['image content'], 'test-image.png', { type: 'image/png' });
      const imageInput = screen.getByLabelText(/project image/i) as HTMLInputElement;
      await user.upload(imageInput, file);

      const textarea = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await user.type(textarea, 'Description');

      const submitButton = screen.getByRole('button', { name: /submit project/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submissionService.submitProject).toHaveBeenCalledWith(
          expect.objectContaining({
            assignmentId: 'assignment1',
          })
        );
      });
    });
  });
});
