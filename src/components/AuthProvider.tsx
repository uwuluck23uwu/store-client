import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCredentials } from "../store/slices/authSlice";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load user data from AsyncStorage on app start
    const loadUserData = async () => {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");

      if (token && userJson) {
        const user = JSON.parse(userJson);
        dispatch(setCredentials({ user, token }));
      }
    };

    loadUserData();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
