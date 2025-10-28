import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store/store';

/**
 * Hook to check if user is authenticated
 * If not authenticated, will navigate to Login screen
 * @param immediate - If true, navigate immediately. If false, return isAuthenticated status
 */
export const useRequireAuth = (immediate: boolean = true) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && immediate) {
      navigation.navigate('Login');
    }
    setChecked(true);
  }, [isAuthenticated, immediate, navigation]);

  return { isAuthenticated, checked };
};
