import { vi } from "vitest";

// Mock pour NativeAnimatedHelper
export default {
  addListener: vi.fn(),
  removeListener: vi.fn(),
  removeAllListeners: vi.fn(),
};
