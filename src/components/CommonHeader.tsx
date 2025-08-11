import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { headerStyles } from "../utils/commonStyles";

interface CommonHeaderProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  rightButton?: {
    text: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    isFavorites?: boolean;
  };
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  onBack,
  backLabel = "Retour",
  rightButton,
}) => {
  return (
    <View style={headerStyles.container}>
      {onBack ? (
        <TouchableOpacity
          style={headerStyles.backButton}
          onPress={onBack}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
        >
          <Text style={headerStyles.backButtonText}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}

      <Text style={headerStyles.title}>{title}</Text>

      {rightButton ? (
        <TouchableOpacity
          style={[
            rightButton.isFavorites
              ? headerStyles.favoritesButton
              : headerStyles.actionButton,
            !rightButton.isFavorites &&
              rightButton.disabled &&
              headerStyles.actionButtonDisabled,
          ]}
          onPress={rightButton.onPress}
          disabled={rightButton.disabled || rightButton.loading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            rightButton.isFavorites ? "Mes favoris" : "Action"
          }
        >
          {rightButton.loading ? (
            <ActivityIndicator
              size="small"
              color={rightButton.isFavorites ? "#4a5c4a" : "#fff"}
            />
          ) : (
            <Text
              style={
                rightButton.isFavorites
                  ? headerStyles.favoritesButtonText
                  : headerStyles.actionButtonText
              }
            >
              {rightButton.text}
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={{ width: 80 }} />
      )}
    </View>
  );
};
