import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AlertCircleIcon } from '../AlertIcons';

describe('AlertCircleIcon', () => {
  it('should render an SVG element with the correct aria attribute', () => {
    const { container } = render(<AlertCircleIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should accept and merge className prop', () => {
    const { container } = render(<AlertCircleIcon className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('class', expect.stringContaining('custom-class'));
  });

  it('should forward additional SVG props', () => {
    const { container } = render(<AlertCircleIcon data-testid="alert-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('data-testid', 'alert-icon');
  });
});
