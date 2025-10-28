import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingStateProps {
  message?: string;
  color?: string;
  size?: 'small' | 'large';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'กำลังโหลด...',
  color = '#4CAF50',
  size = 'large',
}) => {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
});

export default LoadingState;
