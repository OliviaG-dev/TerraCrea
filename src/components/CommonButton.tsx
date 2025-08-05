import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";
import { buttonStyles } from "../utils/commonStyles";

type ButtonVariant = "primary" | "secondary" | "danger" | "disabled";

interface CommonButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

export const CommonButton: React.FC<CommonButtonProps> = ({
  title,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    if (disabled || variant === "disabled") return buttonStyles.disabled;
    switch (variant) {
      case "secondary":
        return buttonStyles.secondary;
      case "danger":
        return buttonStyles.danger;
      default:
        return buttonStyles.primary;
    }
  };

  const getTextStyle = () => {
    if (disabled || variant === "disabled") return buttonStyles.disabledText;
    switch (variant) {
      case "secondary":
        return buttonStyles.secondaryText;
      case "danger":
        return buttonStyles.dangerText;
      default:
        return buttonStyles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      <Text style={getTextStyle()}>{loading ? "..." : title}</Text>
    </TouchableOpacity>
  );
};
