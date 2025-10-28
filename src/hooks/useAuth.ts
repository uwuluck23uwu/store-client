import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setCredentials,
  updateUser,
  logout as logoutAction,
} from "../store/slices/authSlice";
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} from "../api/authApi";
import { useGetProfileQuery } from "../api/userApi";
import { LoginRequest, RegisterRequest } from "../types/api.types";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const { refetch: refetchProfile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const login = async (data: LoginRequest) => {
    const response = await loginMutation(data).unwrap();

    if (response.isSuccess && response.data) {
      // Merge with existing user data from AsyncStorage if available
      const existingUserJson = await AsyncStorage.getItem("user");
      let mergedUser = response.data.user;

      if (existingUserJson) {
        const existingUser = JSON.parse(existingUserJson);
        // Check if user IDs match to ensure we're merging the same user's data
        if (existingUser.id === response.data.user.id) {
          // Keep updated profile data (firstName, lastName, phoneNumber, imageUrl)
          // but use new data for other fields (id, email, role)
          mergedUser = {
            ...response.data.user,
            firstName:
              existingUser.firstName !== undefined &&
              existingUser.firstName !== null
                ? existingUser.firstName
                : response.data.user.firstName,
            lastName:
              existingUser.lastName !== undefined &&
              existingUser.lastName !== null
                ? existingUser.lastName
                : response.data.user.lastName,
            phoneNumber:
              existingUser.phoneNumber !== undefined &&
              existingUser.phoneNumber !== null
                ? existingUser.phoneNumber
                : response.data.user.phoneNumber,
            imageUrl: existingUser.imageUrl || response.data.user.imageUrl,
          };
        }
      }

      dispatch(
        setCredentials({
          user: mergedUser,
          token: response.data.token,
        })
      );
      return { success: true, message: "Login successful" };
    }
    return { success: false, message: response.message || "Login failed" };
  };

  const register = async (data: RegisterRequest) => {
    const response = await registerMutation(data).unwrap();

    if (response.isSuccess && response.data) {
      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.token,
        })
      );
      return { success: true, message: "Registration successful" };
    }
    return {
      success: false,
      message: response.message || "Registration failed",
    };
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(logoutAction());
    }
  };

  const refreshUser = async () => {
    const response = await refetchProfile();
    if (response.data?.data) {
      dispatch(updateUser(response.data.data));
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };
};
