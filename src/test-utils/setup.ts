import "@testing-library/jest-dom";

// Mock global objects
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now()),
} as any;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn();

// Mock getComputedStyle
global.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ""),
}));

// Mock window.scrollTo
global.scrollTo = vi.fn();

// Mock window.scroll
global.scroll = vi.fn();

// Mock window.scrollBy
global.scrollBy = vi.fn();

// Mock window.scrollIntoView
global.scrollIntoView = vi.fn();

// Mock window.scrollTo
global.scrollTo = vi.fn();

// Mock window.scroll
global.scroll = vi.fn();

// Mock window.scrollBy
global.scrollBy = vi.fn();

// Mock window.scrollIntoView
global.scrollIntoView = vi.fn();
