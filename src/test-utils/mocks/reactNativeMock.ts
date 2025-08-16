import { vi } from "vitest";

// Mock simple pour React Native
export default {
  // Composants de base
  View: "View",
  Text: "Text",
  Image: "Image",
  TouchableOpacity: "TouchableOpacity",
  ScrollView: "ScrollView",
  FlatList: "FlatList",
  TextInput: "TextInput",
  Button: "Button",
  Alert: {
    alert: vi.fn(),
  },
  // APIs
  Linking: {
    openURL: vi.fn(),
  },
  Platform: {
    OS: "ios",
    select: vi.fn((obj: any) => obj.ios || obj.default),
  },
  Dimensions: {
    get: vi.fn(() => ({ width: 375, height: 667 })),
  },
  // Hooks et utilitaires
  useWindowDimensions: vi.fn(() => ({ width: 375, height: 667 })),
  // Autres modules
  Animated: {
    Value: vi.fn(),
    timing: vi.fn(),
    spring: vi.fn(),
  },
};
