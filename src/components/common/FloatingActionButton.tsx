import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Icon.glyphMap;
  iconSize?: number;
  iconColor?: string;
  backgroundColor?: string;
  size?: number;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = "plus",
  iconSize = 28,
  iconColor = "#FFFFFF",
  backgroundColor = "#4CAF50",
  size = 60,
  visible = true,
  style,
  position = "bottom-right",
}) => {
  if (!visible) {
    return null;
  }

  const positionStyles: ViewStyle = {};
  const spacing = 20;

  switch (position) {
    case "bottom-right":
      positionStyles.bottom = spacing;
      positionStyles.right = spacing;
      break;
    case "bottom-left":
      positionStyles.bottom = spacing;
      positionStyles.left = spacing;
      break;
    case "top-right":
      positionStyles.top = spacing;
      positionStyles.right = spacing;
      break;
    case "top-left":
      positionStyles.top = spacing;
      positionStyles.left = spacing;
      break;
  }

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        positionStyles,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name={icon} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default FloatingActionButton;
