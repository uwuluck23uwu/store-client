import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { updateUser } from "../../store/slices/authSlice";
import {
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useGetProfileQuery,
} from "../../api/userApi";
import { convertImageUrl } from "../../api/baseApi";

const EditProfileScreen = ({ navigation }: any) => {
  const { user: authUser } = useAuth();
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !authUser,
  });

  // Use profile data from API if available, otherwise use auth user
  const user = profileData?.data || authUser;

  const dispatch = useDispatch();
  const [updateProfile] = useUpdateProfileMutation();
  const [uploadAvatar] = useUploadAvatarMutation();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user]);

  useEffect(() => {
    // Request permissions
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "ขออนุญาต",
          "ต้องการสิทธิ์เข้าถึงรูปภาพเพื่ออัพโหลดรูปโปรไฟล์"
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเลือกรูปภาพได้");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("ขออนุญาต", "ต้องการสิทธิ์เข้าถึงกล้องเพื่อถ่ายรูปโปรไฟล์");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถถ่ายรูปได้");
    }
  };

  const showImageOptions = () => {
    Alert.alert("เลือกรูปโปรไฟล์", "เลือกวิธีการอัพโหลดรูปภาพ", [
      { text: "ถ่ายรูป", onPress: takePhoto },
      { text: "เลือกจากคลัง", onPress: pickImage },
      { text: "ยกเลิก", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อและนามสกุล");
      return;
    }

    if (!user) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่พบข้อมูลผู้ใช้");
      return;
    }

    setIsLoading(true);

    let newImageUrl = user.imageUrl;

    // Upload avatar if user selected a new image
    if (imageUri) {
      // Get file name and type from URI
      const uriParts = imageUri.split("/");
      const fileName = uriParts[uriParts.length - 1];
      const fileType = fileName.split(".").pop() || "jpg";

      // Create FormData with proper React Native format
      const formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        name: fileName || `profile_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      // Upload avatar
      const uploadResult = await uploadAvatar(formData).unwrap();

      if (uploadResult.isSuccess && uploadResult.data) {
        newImageUrl = uploadResult.data;
      }
    }

    const updateResult = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
    }).unwrap();

    if (updateResult.isSuccess) {
      // Update local user data
      const updatedUser = {
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        imageUrl: newImageUrl,
      };

      // Dispatch to Redux store and AsyncStorage
      dispatch(updateUser(updatedUser));

      // Show success message
      Alert.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อย", [
        { text: "ตกลง", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert(
        "เกิดข้อผิดพลาด",
        updateResult.message || "ไม่สามารถบันทึกข้อมูลได้"
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={showImageOptions} disabled={isLoading}>
          <View style={styles.avatarContainer}>
            {imageUri || user?.imageUrl ? (
              <Image
                source={{ uri: imageUri || convertImageUrl(user?.imageUrl) }}
                style={styles.avatar}
                onError={(error) => {
                  console.log("Image EditProfile:", error.nativeEvent.error);
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="account-circle" size={100} color="#4CAF50" />
              </View>
            )}
            <View style={styles.cameraButton}>
              <Icon name="camera" size={20} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>แตะเพื่อเปลี่ยนรูปโปรไฟล์</Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ชื่อ</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="กรอกชื่อ"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>นามสกุล</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="กรอกนามสกุล"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>เบอร์โทรศัพท์</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="กรอกเบอร์โทรศัพท์"
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>อีเมล</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user?.email}
            editable={false}
          />
          <Text style={styles.hint}>ไม่สามารถแก้ไขอีเมลได้</Text>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>ยกเลิก</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  avatarSection: {
    backgroundColor: "#fff",
    padding: 30,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarHint: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  formSection: {
    backgroundColor: "#fff",
    marginTop: 15,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  buttonSection: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: "#9E9E9E",
  },
});

export default EditProfileScreen;
