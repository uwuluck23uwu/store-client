import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
}) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={colors.textTertiary}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear || (() => onChangeText(''))}
          style={styles.clearButton}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color={colors.textTertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    padding: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
});
