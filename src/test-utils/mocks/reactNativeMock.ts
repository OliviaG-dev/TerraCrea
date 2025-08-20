import React from "react";

// Mock des composants React Native pour les tests
export const View = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "view", ...props },
    children
  );
};

export const Text = ({ children, ...props }: any) => {
  return React.createElement(
    "span",
    { "data-testid": "text", ...props },
    children
  );
};

export const TextInput = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  placeholderTextColor,
  returnKeyType,
  ...props
}: any) => {
  return React.createElement("input", {
    "data-testid": "text-input",
    placeholder,
    value,
    onChange: (e: any) => onChangeText?.(e.target.value),
    onFocus,
    onBlur,
    ...props,
  });
};

export const TouchableOpacity = ({
  children,
  onPress,
  disabled,
  style,
  accessibilityLabel,
  ...props
}: any) => {
  return React.createElement(
    "button",
    {
      "data-testid": "touchable-opacity",
      onClick: onPress,
      disabled,
      style,
      "aria-label": accessibilityLabel,
      ...props,
    },
    children
  );
};

export const FlatList = ({ data, renderItem, keyExtractor, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "flat-list", ...props },
    data?.map((item: any, index: number) =>
      React.createElement(
        "div",
        {
          key: keyExtractor?.(item, index) || index,
        },
        renderItem({ item, index })
      )
    )
  );
};

export const Image = ({ source, resizeMode, ...props }: any) => {
  return React.createElement("img", {
    "data-testid": "image",
    src: source?.uri || source,
    alt: "image",
    ...props,
  });
};

export const ActivityIndicator = ({ size, color, ...props }: any) => {
  return React.createElement(
    "div",
    {
      "data-testid": "activity-indicator",
      style: { size, color },
      ...props,
    },
    "Loading..."
  );
};

export const ScrollView = ({
  children,
  horizontal,
  showsHorizontalScrollIndicator,
  showsVerticalScrollIndicator,
  ...props
}: any) => {
  return React.createElement(
    "div",
    {
      "data-testid": "scroll-view",
      style: {
        overflow: horizontal ? "auto" : "scroll",
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
      },
      ...props,
    },
    children
  );
};

export const StyleSheet = {
  create: (styles: any) => styles,
};

export const Dimensions = {
  get: () => ({ width: 375, height: 667 }),
};

export const Platform = {
  OS: "web",
  select: (spec: any) => spec.web || spec.default,
};

export const StatusBar = {
  setBarStyle: () => {},
  setHidden: () => {},
  setBackgroundColor: () => {},
  setTranslucent: () => {},
};

export const Keyboard = {
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
};

export const Animated = {
  Value: class {
    value: number;
    constructor(value: number) {
      this.value = value;
    }
    setValue(value: number) {
      this.value = value;
    }
    addListener() {}
    removeListener() {}
  },
  timing: () => ({
    start: (callback?: () => void) => callback?.(),
  }),
  spring: () => ({
    start: (callback?: () => void) => callback?.(),
  }),
  View,
  Text,
  Image,
};

export const Easing = {
  linear: () => {},
  ease: () => {},
  easeIn: () => {},
  easeOut: () => {},
  easeInOut: () => {},
};

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

export const PanGestureHandler = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "pan-gesture-handler", ...props },
    children
  );
};

export const TapGestureHandler = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "tap-gesture-handler", ...props },
    children
  );
};

export const FlingGestureHandler = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "fling-gesture-handler", ...props },
    children
  );
};

export const LongPressGestureHandler = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "long-press-gesture-handler", ...props },
    children
  );
};

export const ForceTouchGestureHandler = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "force-touch-gesture-handler", ...props },
    children
  );
};

export const PinchGestureHandler = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "pinch-gesture-handler", ...props },
    children
  );
};

export const RotationGestureHandler = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "rotation-gesture-handler", ...props },
    children
  );
};

export const WaitGestureHandler = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "wait-gesture-handler", ...props },
    children
  );
};

export const NativeViewGestureHandler = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "native-view-gesture-handler", ...props },
    children
  );
};

export const RawButton = ({ children, ...props }: any) => {
  return React.createElement(
    "button",
    { "data-testid": "raw-button", ...props },
    children
  );
};

export const BorderlessButton = ({ children, ...props }: any) => {
  return React.createElement(
    "button",
    { "data-testid": "borderless-button", ...props },
    children
  );
};

export const RectButton = ({ children, ...props }: any) => {
  return React.createElement(
    "button",
    { "data-testid": "rect-button", ...props },
    children
  );
};

export const Swipeable = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "swipeable", ...props },
    children
  );
};

export const DrawerLayout = ({ children, ...props }: any) => {
  return React.createElement(
    "div",
    { "data-testid": "drawer-layout", ...props },
    children
  );
};

export const GestureState = State;

export default {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Keyboard,
  Animated,
  Easing,
  PanGestureHandler,
  State,
  TapGestureHandler,
  FlingGestureHandler,
  LongPressGestureHandler,
  ForceTouchGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  WaitGestureHandler,
  NativeViewGestureHandler,
  RawButton,
  BorderlessButton,
  RectButton,
  Swipeable,
  DrawerLayout,
  GestureState,
};
