import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { inputStyles } from "../utils/commonStyles";

interface CommonInputProps extends TextInputProps {
  label: string;
  error?: string;
  charCount?: {
    current: number;
    max: number;
  };
}

export const CommonInput: React.FC<CommonInputProps> = ({
  label,
  error,
  charCount,
  style,
  ...props
}) => {
  return (
    <View style={inputStyles.container}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={[inputStyles.input, error && inputStyles.inputError, style]}
        placeholderTextColor="#8a9a8a"
        {...props}
      />
      {charCount && (
        <Text style={inputStyles.charCount}>
          {charCount.current}/{charCount.max} caractères
        </Text>
      )}
      {error && <Text style={inputStyles.errorText}>{error}</Text>}
    </View>
  );
};
