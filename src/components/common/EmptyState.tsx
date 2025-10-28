import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  message: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  iconSize?: number;
  iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  description,
  actionLabel,
  onAction,
  iconSize = 80,
  iconColor = '#ccc',
}) => {
  return (
    <View style={styles.centered}>
      <MaterialCommunityIcons name={icon} size={iconSize} color={iconColor} />
      <Text style={styles.emptyText}>{message}</Text>
      {description && <Text style={styles.descriptionText}>{description}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmptyState;
