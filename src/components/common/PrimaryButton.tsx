import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  variant?: 'primary' | 'secondary' | 'danger';
  backgroundColor?: string;
  textColor?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
  backgroundColor,
  textColor,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyle = () => {
    if (isDisabled) return styles.buttonDisabled;
    // If custom backgroundColor is provided, use it
    if (backgroundColor) {
      return { backgroundColor: isDisabled ? '#9E9E9E' : backgroundColor };
    }
    // Otherwise use variant
    switch (variant) {
      case 'primary':
        return styles.buttonPrimary;
      case 'secondary':
        return styles.buttonSecondary;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextColor = () => {
    // If custom textColor is provided, use it
    if (textColor) return textColor;
    // Otherwise use variant-based color
    if (variant === 'secondary' && !isDisabled) return '#4CAF50';
    return '#fff';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <>
          <ActivityIndicator color={getTextColor()} />
          <Text style={[styles.buttonText, { color: getTextColor(), marginLeft: 10 }, textStyle]}>
            {label}
          </Text>
        </>
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={getTextColor()}
              style={styles.icon}
            />
          )}
          <Text style={[styles.buttonText, { color: getTextColor() }, textStyle]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  buttonDanger: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 8,
  },
});

export default PrimaryButton;
