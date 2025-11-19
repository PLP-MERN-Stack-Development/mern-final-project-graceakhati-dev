import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageLoader from './imageloader';

describe('ImageLoader', () => {

  it('renders with required props', () => {
    render(<ImageLoader src="/test-image.png" alt="Test image" />);
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-image.png');
  });

  it('applies custom className', () => {
    render(
      <ImageLoader
        src="/test-image.png"
        alt="Test"
        className="custom-class"
      />
    );
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    // Check if custom class is in className string
    expect(img.className).toContain('custom-class');
  });

  it('uses default fallback path', () => {
    render(<ImageLoader src="/invalid-image.png" alt="Test" />);
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    // Initially renders with src, fallback is used on error
    expect(img).toHaveAttribute('src', '/invalid-image.png');
  });

  it('accepts custom fallback prop', () => {
    const customFallback = '/custom-fallback.png';
    render(
      <ImageLoader
        src="/invalid-image.png"
        alt="Test"
        fallback={customFallback}
      />
    );
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/invalid-image.png');
  });

  it('disables lazy loading when lazy is false', () => {
    render(<ImageLoader src="/test-image.png" alt="Test" lazy={false} />);
    const img = screen.getByAltText('Test');
    expect(img).not.toHaveAttribute('loading');
  });

  it('enables lazy loading by default for non-SVG images', async () => {
    render(<ImageLoader src="/test-image.png" alt="Test" />);
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    // Check loading attribute
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('does not add loading attribute for SVG images', () => {
    render(<ImageLoader src="/test-image.svg" alt="Test" />);
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('loading')).toBeNull();
  });
});

