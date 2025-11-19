/**
 * CoursePlayer Component Tests
 * 
 * Tests for:
 * - Rendering course information
 * - Enrollment functionality
 * - Project submission flow
 * - Success message display
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CoursePlayer from './CoursePlayer';
import courseService from '@/services/courseService';
import submissionService from '@/services/submissionService';
import { useAuthStore } from '@/store/useAuthStore';

// Mock dependencies
vi.mock('@/services/courseService');
vi.mock('@/services/submissionService');
vi.mock('@/store/useAuthStore');

const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ id: 'test-course-id' }));
const mockUseLocation = vi.fn(() => ({ pathname: '/courses/test-course-id' }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

// Mock SubmitProjectModal
vi.mock('@/components/SubmitProjectModal', () => ({
  default: ({ isOpen, onSuccess, courseId }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="submit-project-modal">
        <div>Submit Project Modal</div>
        <button
          data-testid="mock-submit-button"
          onClick={() => {
            onSuccess({
              _id: 'submission-123',
              courseId: courseId,
              assignmentId: 'assignment-123',
              userId: 'user-123',
              files: ['file-url.jpg'],
              metadata: {
                notes: 'Test project description',
                geotag: { lat: 0, lng: 0 },
              },
              aiScore: 75,
              verified: true,
              status: 'submitted',
              createdAt: new Date(),
            });
          }}
        >
          Mock Submit
        </button>
      </div>
    );
  },
}));

describe('CoursePlayer Component', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'student' as const,
  };

  const mockCourse = {
    _id: 'test-course-id',
    id: 'test-course-id',
    title: 'Test Course Title',
    description: 'Test course description for learning',
    slug: 'test-course',
    authorId: {
      _id: 'instructor-123',
      name: 'Test Instructor',
      email: 'instructor@example.com',
    },
    modules: [],
    tags: ['test', 'course'],
    price: 0,
    impact_type: 'climate',
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubmission = {
    _id: 'submission-123',
    courseId: 'test-course-id',
    assignmentId: 'assignment-123',
    userId: 'user-123',
    files: ['file-url.jpg'],
    metadata: {
      notes: 'Test project description',
      geotag: { lat: 0, lng: 0 },
    },
    aiScore: 75,
    verified: true,
    status: 'submitted' as const,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useAuthStore
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock courseService.getCourse
    (courseService.getCourse as any).mockResolvedValue(mockCourse);
    
    // Mock courseService.checkEnrollment
    (courseService.checkEnrollment as any).mockResolvedValue(false);
    
    // Mock submissionService.getMySubmissions
    (courseService.enroll as any).mockResolvedValue({ success: true });
    (submissionService.getMySubmissions as any).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderCoursePlayer = () => {
    return render(
      <MemoryRouter initialEntries={['/courses/test-course-id']}>
        <CoursePlayer />
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('should render loading state initially', async () => {
      (useAuthStore as any).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      renderCoursePlayer();
      
      expect(screen.getByText(/loading course/i)).toBeInTheDocument();
    });

    it('should render course title and description after loading', async () => {
      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByText('Test Course Title')).toBeInTheDocument();
      });

      expect(screen.getByText('Test course description for learning')).toBeInTheDocument();
    });

    it('should render enroll button when not enrolled', async () => {
      (courseService.checkEnrollment as any).mockResolvedValue(false);

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('enroll-btn-test-course-id')).toBeInTheDocument();
      });

      const enrollButton = screen.getByTestId('enroll-btn-test-course-id');
      expect(enrollButton).toHaveTextContent('Enroll in Course');
    });

    it('should render enrolled state when already enrolled', async () => {
      (courseService.checkEnrollment as any).mockResolvedValue(true);

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByText('✓ Enrolled')).toBeInTheDocument();
      });

      expect(screen.getByTestId('submit-project-button')).toBeInTheDocument();
    });
  });

  describe('Enrollment Flow', () => {
    it('should handle enrollment successfully', async () => {
      const user = userEvent.setup();
      (courseService.checkEnrollment as any).mockResolvedValue(false);
      (courseService.enroll as any).mockResolvedValue({ success: true });

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('enroll-btn-test-course-id')).toBeInTheDocument();
      });

      const enrollButton = screen.getByTestId('enroll-btn-test-course-id');
      await user.click(enrollButton);

      await waitFor(() => {
        expect(courseService.enroll).toHaveBeenCalledWith('test-course-id');
      });
    });

    it('should show enrolling state during enrollment', async () => {
      const user = userEvent.setup();
      (courseService.checkEnrollment as any).mockResolvedValue(false);
      
      // Mock a delayed enrollment response
      let resolveEnroll: any;
      const enrollPromise = new Promise((resolve) => {
        resolveEnroll = resolve;
      });
      (courseService.enroll as any).mockReturnValue(enrollPromise);

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('enroll-btn-test-course-id')).toBeInTheDocument();
      });

      const enrollButton = screen.getByTestId('enroll-btn-test-course-id');
      await user.click(enrollButton);

      // Check for enrolling state
      await waitFor(() => {
        expect(screen.getByText('Enrolling...')).toBeInTheDocument();
      });

      // Resolve enrollment
      resolveEnroll({ success: true });
    });
  });

  describe('Project Submission Flow', () => {
    beforeEach(() => {
      (courseService.checkEnrollment as any).mockResolvedValue(true);
      (submissionService.getMySubmissions as any).mockResolvedValue([]);
    });

    it('should open submit project modal when submit button is clicked', async () => {
      const user = userEvent.setup();

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-button')).toBeInTheDocument();
      });

      const submitButton = screen.getByTestId('submit-project-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-modal')).toBeInTheDocument();
      });
    });

    it('should show error if trying to submit without enrollment', async () => {
      userEvent.setup();
      (courseService.checkEnrollment as any).mockResolvedValue(false);

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('enroll-btn-test-course-id')).toBeInTheDocument();
      });

      // Try to access submit functionality (should not be available)
      expect(screen.queryByTestId('submit-project-button')).not.toBeInTheDocument();
    });

    it('should display success message after project submission', async () => {
      const user = userEvent.setup();

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-button')).toBeInTheDocument();
      });

      // Open modal
      const submitButton = screen.getByTestId('submit-project-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-modal')).toBeInTheDocument();
      });

      // Simulate submission success
      const mockSubmitButton = screen.getByTestId('mock-submit-button');
      await user.click(mockSubmitButton);

      // Check for success message
      await waitFor(() => {
        expect(screen.getByText(/project submitted successfully/i)).toBeInTheDocument();
      });

      // Check for AI score display
      await waitFor(() => {
        expect(screen.getByText(/ai score/i)).toBeInTheDocument();
        expect(screen.getByText(/75\/100/i)).toBeInTheDocument();
      });

      // Check for verification status
      await waitFor(() => {
        expect(screen.getByText(/verified/i)).toBeInTheDocument();
        expect(screen.getByText(/you earned 50 xp/i)).toBeInTheDocument();
      });
    });

    it('should display success message with AI score below 60', async () => {
      const user = userEvent.setup();
      const lowScoreSubmission = {
        ...mockSubmission,
        aiScore: 45,
        verified: false,
      };

      // Mock the modal to return low score
      vi.mock('@/components/SubmitProjectModal', () => ({
        default: ({ isOpen, onSuccess }: any) => {
          if (!isOpen) return null;
          return (
            <div data-testid="submit-project-modal">
              <button
                data-testid="mock-submit-button"
                onClick={() => onSuccess(lowScoreSubmission)}
              >
                Mock Submit
              </button>
            </div>
          );
        },
      }));

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-button')).toBeInTheDocument();
      });

      const submitButton = screen.getByTestId('submit-project-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-modal')).toBeInTheDocument();
      });

      const mockSubmitButton = screen.getByTestId('mock-submit-button');
      await user.click(mockSubmitButton);

      // Check for low score message
      await waitFor(() => {
        expect(screen.getByText(/score below 60/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button if project already submitted', async () => {
      (submissionService.getMySubmissions as any).mockResolvedValue([mockSubmission]);

      renderCoursePlayer();

      await waitFor(() => {
        const submitButton = screen.getByTestId('submit-project-button');
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Project Already Submitted');
      });
    });

    it('should close modal after successful submission', async () => {
      const user = userEvent.setup();

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-button')).toBeInTheDocument();
      });

      // Open modal
      const submitButton = screen.getByTestId('submit-project-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-modal')).toBeInTheDocument();
      });

      // Submit project
      const mockSubmitButton = screen.getByTestId('mock-submit-button');
      await user.click(mockSubmitButton);

      // Modal should close after success
      await waitFor(() => {
        expect(screen.queryByTestId('submit-project-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when course fails to load', async () => {
      (courseService.getCourse as any).mockRejectedValue(new Error('Failed to load course'));

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByText(/failed to load course/i)).toBeInTheDocument();
      });
    });

    it('should display error message when enrollment fails', async () => {
      const user = userEvent.setup();
      (courseService.checkEnrollment as any).mockResolvedValue(false);
      (courseService.enroll as any).mockRejectedValue(new Error('Enrollment failed'));

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('enroll-btn-test-course-id')).toBeInTheDocument();
      });

      const enrollButton = screen.getByTestId('enroll-btn-test-course-id');
      await user.click(enrollButton);

      await waitFor(() => {
        expect(screen.getByText(/enrollment failed/i)).toBeInTheDocument();
      });
    });

    it('should redirect to login if not authenticated', async () => {
      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
          useParams: () => ({ id: 'test-course-id' }),
          useLocation: () => ({ pathname: '/courses/test-course-id' }),
        };
      });

      (useAuthStore as any).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      renderCoursePlayer();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Success Message Display', () => {
    it('should show success message with all details', async () => {
      const user = userEvent.setup();

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-button')).toBeInTheDocument();
      });

      const submitButton = screen.getByTestId('submit-project-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-modal')).toBeInTheDocument();
      });

      const mockSubmitButton = screen.getByTestId('mock-submit-button');
      await user.click(mockSubmitButton);

      // Verify all success message elements
      await waitFor(() => {
        expect(screen.getByText(/project submitted successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/ai score/i)).toBeInTheDocument();
        expect(screen.getByText(/75\/100/i)).toBeInTheDocument();
        expect(screen.getByText(/verified/i)).toBeInTheDocument();
        expect(screen.getByText(/you earned 50 xp/i)).toBeInTheDocument();
      });
    });

    it('should hide success message after timeout', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup();

      renderCoursePlayer();

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-button')).toBeInTheDocument();
      });

      const submitButton = screen.getByTestId('submit-project-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('submit-project-modal')).toBeInTheDocument();
      });

      const mockSubmitButton = screen.getByTestId('mock-submit-button');
      await user.click(mockSubmitButton);

      await waitFor(() => {
        expect(screen.getByText(/project submitted successfully/i)).toBeInTheDocument();
      });

      // Fast-forward time (10 seconds for CoursePlayer)
      vi.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(screen.queryByText(/project submitted successfully/i)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });
});

