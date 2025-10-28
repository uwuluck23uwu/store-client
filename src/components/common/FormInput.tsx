import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  isPassword?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required = false,
  icon,
  isPassword = false,
  editable = true,
  ...textInputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color="#666"
            style={styles.icon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            isPassword && styles.inputWithPassword,
            !editable && styles.inputDisabled,
            error && styles.inputError,
          ]}
          editable={editable}
          secureTextEntry={isPassword && !showPassword}
          {...textInputProps}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#F44336',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  inputWithIcon: {
    paddingLeft: 45,
  },
  inputWithPassword: {
    paddingRight: 45,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  inputError: {
    borderColor: '#F44336',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 5,
  },
});
