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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useCreateBannerMutation } from "../../api/bannerApi";
import PrimaryButton from "../../components/common/PrimaryButton";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../theme";

const CreateBannerScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [image, setImage] = useState<{ uri: string; file: any } | null>(null);
  const [errors, setErrors] = useState<{ image?: string }>({});

  const [createBanner, { isLoading }] = useCreateBannerMutation();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตการเข้าถึงคลังรูปภาพ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const filename = uri.split("/").pop() || "banner.jpg";
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

      if (errors.image) {
        setErrors({ ...errors, image: undefined });
      }
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const validate = () => {
    const newErrors: { image?: string } = {};

    if (!image) {
      newErrors.image = "กรุณาเลือกรูปภาพแบนเนอร์";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      const result = await createBanner({
        title: title.trim() || undefined,
        linkUrl: linkUrl.trim() || undefined,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        image: image!.file,
        isActive: true,
      }).unwrap();

      if (result.isSuccess) {
        Alert.alert("สำเร็จ", "เพิ่มแบนเนอร์เรียบร้อยแล้ว", [
          {
            text: "ตกลง",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("ไม่สำเร็จ", result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error: any) {
      console.error("Create banner error:", error);
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error?.data?.message || "ไม่สามารถเพิ่มแบนเนอร์ได้"
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>รูปภาพแบนเนอร์ *</Text>
          <Text style={styles.sectionDescription}>
            แนะนำขนาด 16:9 (เช่น 1600x900px)
          </Text>

          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={removeImage}
              >
                <Icon name="close-circle" size={24} color="#f44336" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={pickImage}
            >
              <Icon name="image-plus" size={48} color="#4CAF50" />
              <Text style={styles.placeholderText}>เลือกรูปภาพแบนเนอร์</Text>
            </TouchableOpacity>
          )}

          {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}

          {image && (
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
            >
              <Icon name="image-edit" size={20} color="#4CAF50" />
              <Text style={styles.changeImageText}>เปลี่ยนรูปภาพ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Banner Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ข้อมูลแบนเนอร์</Text>

          <Text style={styles.label}>ชื่อแบนเนอร์ (ไม่บังคับ)</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="กรอกชื่อหรือคำอธิบายแบนเนอร์"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>ลิงก์ URL (ไม่บังคับ)</Text>
          <TextInput
            style={styles.input}
            value={linkUrl}
            onChangeText={setLinkUrl}
            placeholder="https://..."
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="url"
          />

          <Text style={styles.label}>ลำดับการแสดงผล (ไม่บังคับ)</Text>
          <TextInput
            style={styles.input}
            value={displayOrder}
            onChangeText={setDisplayOrder}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="บันทึกแบนเนอร์"
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
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  imageContainer: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.divider,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.divider,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  placeholderText: {
    marginTop: spacing.sm,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  removeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "white",
    borderRadius: 12,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.base,
    paddingVertical: spacing.sm,
  },
  changeImageText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.lg,
    color: "#4CAF50",
    fontWeight: fontWeight.semibold,
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});

export default CreateBannerScreen;
