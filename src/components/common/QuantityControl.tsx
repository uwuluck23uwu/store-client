import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max,
  showLabel = true,
  label = 'จำนวน',
  size = 'medium',
}) => {
  const isMinDisabled = quantity <= min;
  const isMaxDisabled = max !== undefined && quantity >= max;

  const sizeStyles = {
    small: {
      buttonPadding: 4,
      textSize: 14,
      iconSize: 18,
      horizontalSpacing: 8,
    },
    medium: {
      buttonPadding: 6,
      textSize: 16,
      iconSize: 20,
      horizontalSpacing: 12,
    },
    large: {
      buttonPadding: 8,
      textSize: 18,
      iconSize: 24,
      horizontalSpacing: 20,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      {showLabel && <Text style={styles.label}>{label}</Text>}
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={[styles.quantityButton, { padding: currentSize.buttonPadding }]}
          onPress={onDecrease}
          disabled={isMinDisabled}
        >
          <MaterialCommunityIcons
            name="minus"
            size={currentSize.iconSize}
            color={isMinDisabled ? '#ccc' : '#666'}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.quantityText,
            {
              fontSize: currentSize.textSize,
              marginHorizontal: currentSize.horizontalSpacing,
            },
          ]}
        >
          {quantity}
        </Text>
        <TouchableOpacity
          style={[styles.quantityButton, { padding: currentSize.buttonPadding }]}
          onPress={onIncrease}
          disabled={isMaxDisabled}
        >
          <MaterialCommunityIcons
            name="plus"
            size={currentSize.iconSize}
            color={isMaxDisabled ? '#ccc' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 5,
  },
  quantityButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontWeight: 'bold',
    color: '#333',
  },
});
