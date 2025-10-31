import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  useGetCategoryQuery,
  useUpdateCategoryMutation,
} from "../../api/productApi";
import { convertImageUrl } from "../../api/baseApi";
import PrimaryButton from "../../components/common/PrimaryButton";
import LoadingState from "../../components/common/LoadingState";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../theme";

const EditCategoryScreen = ({ route, navigation }: any) => {
  const { categoryId } = route.params;

  const { data: categoryData, isLoading: loadingCategory } =
    useGetCategoryQuery(categoryId);
  const category = categoryData?.data;

  const [categoryName, setCategoryName] = useState(category?.categoryName || "");
  const [description, setDescription] = useState(category?.description || "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [image, setImage] = useState<{ uri: string; file: any } | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ categoryName?: string }>({});

  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  React.useEffect(() => {
    if (category) {
      setCategoryName(category.categoryName);
      setDescription(category.description || "");
      setIsActive(category.isActive);
      setExistingImageUrl(category.imageUrl ? convertImageUrl(category.imageUrl) : null);
    }
  }, [category]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตการเข้าถึงคลังรูปภาพ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const filename = uri.split("/").pop() || "category.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      setImage({
        uri,
        file: {
          uri,
          name: filename,
          type,
        },
      });
      setExistingImageUrl(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setExistingImageUrl(null);
  };

  const validate = () => {
    const newErrors: { categoryName?: string } = {};

    if (!categoryName.trim()) {
      newErrors.categoryName = "กรุณากรอกชื่อหมวดหมู่";
    } else if (categoryName.trim().length < 2) {
      newErrors.categoryName = "ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      const result = await updateCategory({
        id: categoryId,
        data: {
          categoryName: categoryName.trim(),
          description: description.trim() || undefined,
          isActive,
          image: image?.file,
        },
      }).unwrap();

      if (result.isSuccess) {
        Alert.alert("สำเร็จ", "แก้ไขหมวดหมู่เรียบร้อยแล้ว", [
          {
            text: "ตกลง",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("ไม่สำเร็จ", result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error: any) {
      console.error("Update category error:", error);
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error?.data?.message || "ไม่สามารถแก้ไขหมวดหมู่ได้"
      );
    }
  };

  if (loadingCategory || !category) {
    return <LoadingState />;
  }

  const currentImageUri = image?.uri || existingImageUrl;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>รูปภาพหมวดหมู่</Text>

          {currentImageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: currentImageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                <Icon name="close-circle" size={24} color="#f44336" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
              <Icon name="camera-plus" size={48} color="#4CAF50" />
              <Text style={styles.placeholderText}>เลือกรูปภาพ</Text>
            </TouchableOpacity>
          )}

          {currentImageUri && (
            <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
              <Icon name="image-edit" size={20} color="#4CAF50" />
              <Text style={styles.changeImageText}>เปลี่ยนรูปภาพ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ข้อมูลหมวดหมู่</Text>

          <Text style={styles.label}>ชื่อหมวดหมู่ *</Text>
          <TextInput
            style={[styles.input, errors.categoryName && styles.inputError]}
            value={categoryName}
            onChangeText={(text) => {
              setCategoryName(text);
              if (errors.categoryName) {
                setErrors({ ...errors, categoryName: undefined });
              }
            }}
            placeholder="กรอกชื่อหมวดหมู่"
            placeholderTextColor="#999"
          />
          {errors.categoryName && (
            <Text style={styles.errorText}>{errors.categoryName}</Text>
          )}

          <Text style={styles.label}>รายละเอียด (ไม่บังคับ)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="กรอกรายละเอียดหมวดหมู่"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>สถานะ</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            </Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: "#ccc", true: "#4CAF50" }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <PrimaryButton
          label="บันทึกการแก้ไข"
          icon="check"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    paddingBottom: 100,
  },
  section: {
    backgroundColor: "#fff",
    padding: spacing.base,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 4,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: fontSize.base,
    color: "#999",
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  changeImageText: {
    fontSize: fontSize.base,
    color: "#4CAF50",
    marginLeft: 8,
    fontWeight: fontWeight.medium,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: spacing.base,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#f44336",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: "#f44336",
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  switchLabel: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default EditCategoryScreen;
