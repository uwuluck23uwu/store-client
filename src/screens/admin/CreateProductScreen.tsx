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
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import { useCreateProductMutation } from "../../api/productApi";
import { useGetCategoriesQuery } from "../../api/productApi";
import PrimaryButton from "../../components/common/PrimaryButton";

// Validation Schema
const productValidationSchema = Yup.object().shape({
  productName: Yup.string()
    .required("กรุณากรอกชื่อสินค้า")
    .min(2, "ชื่อสินค้าต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อสินค้าต้องไม่เกิน 100 ตัวอักษร"),
  description: Yup.string()
    .required("กรุณากรอกรายละเอียดสินค้า")
    .min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(500, "รายละเอียดต้องไม่เกิน 500 ตัวอักษร"),
  price: Yup.number()
    .required("กรุณากรอกราคา")
    .positive("ราคาต้องมากกว่า 0")
    .max(1000000, "ราคาต้องไม่เกิน 1,000,000 บาท"),
  stock: Yup.number()
    .required("กรุณากรอกจำนวนสต็อก")
    .min(0, "จำนวนสต็อกต้องไม่น้อยกว่า 0")
    .integer("จำนวนสต็อกต้องเป็นจำนวนเต็ม"),
  unit: Yup.string().required("กรุณาเลือกหน่วย"),
  categoryId: Yup.string().required("กรุณาเลือกหมวดหมู่"),
});

const CreateProductScreen = ({ navigation }: any) => {
  const [images, setImages] = useState<Array<{ uri: string; file: any }>>([]);

  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const [createProduct, { isLoading }] = useCreateProductMutation();

  const buildUploadFile = (asset: any, index: number) => {
    // Prefer asset.mimeType if available
    let mime = (asset.mimeType as string) || "";
    let extFromMime = mime.split("/")[1];
    // Try derive extension from URI
    let extFromUri = (asset.uri as string).split("?")[0].split(".").pop();

    let ext = (extFromMime || extFromUri || "jpg").toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    if (ext === "heic" || ext === "heif") {
      // Convert HEIC/HEIF to jpg type for backend compatibility
      ext = "jpg";
      mime = "image/jpeg";
    }

    const type = mime && mime.startsWith("image/") ? mime : `image/${ext || "jpeg"}`;
    const fileName = `product_${Date.now()}_${index}.${ext || "jpg"}`;

    return {
      uri: asset.uri,
      file: {
        uri: asset.uri,
        name: fileName,
        type,
      },
    };
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ขออภัย", "จำเป็นต้องอนุญาตการเข้าถึงคลังรูปภาพ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset, index) => buildUploadFile(asset, index));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (values: any) => {
    if (images.length === 0) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกรูปภาพสินค้าอย่างน้อย 1 รูป");
      return;
    }

    try {
      const productData = {
        productName: values.productName,
        description: values.description,
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        unit: values.unit,
        categoryId: parseInt(values.categoryId),
        images: images.map((img) => img.file),
      };

      const result = await createProduct(productData).unwrap();

      Alert.alert("สำเร็จ", "เพิ่มสินค้าเรียบร้อยแล้ว", [
        { text: "ตกลง", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Create product error:", error);

      if (error.status === 401) {
        Alert.alert(
          "กรุณาเข้าสู่ระบบ",
          "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่",
          [
            {
              text: "ตกลง",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "เกิดข้อผิดพลาด",
          error?.data?.message || "ไม่สามารถเพิ่มสินค้าได้ กรุณาลองใหม่อีกครั้ง"
        );
      }
    }
  };

  return (
    <Formik
      initialValues={{
        productName: "",
        description: "",
        price: "",
        stock: "",
        unit: "ชิ้น",
        categoryId: "",
      }}
      validationSchema={productValidationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
      }) => (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              รูปภาพสินค้า ({images.length})
            </Text>

            {images.length > 0 && (
              <FlatList
                data={images}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                style={styles.imageList}
                renderItem={({ item, index }) => (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: item.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Icon name="close-circle" size={24} color="#f44336" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>หลัก</Text>
                      </View>
                    )}
                  </View>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImages}
            >
              <View style={styles.placeholderContainer}>
                <Icon name="camera-plus" size={48} color="#4CAF50" />
                <Text style={styles.placeholderText}>
                  {images.length === 0 ? "เลือกรูปภาพ" : "เพิ่มรูปภาพ"}
                </Text>
                <Text style={styles.helperText}>สามารถเลือกได้หลายรูป</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ข้อมูลสินค้า</Text>

            <Text style={styles.label}>ชื่อสินค้า *</Text>
            <TextInput
              style={[
                styles.input,
                touched.productName && errors.productName && styles.inputError,
              ]}
              value={values.productName}
              onChangeText={handleChange("productName")}
              onBlur={handleBlur("productName")}
              placeholder="กรอกชื่อสินค้า"
              placeholderTextColor="#999"
            />
            {touched.productName && errors.productName && (
              <Text style={styles.errorText}>{errors.productName}</Text>
            )}

            <Text style={styles.label}>รายละเอียด *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                touched.description && errors.description && styles.inputError,
              ]}
              value={values.description}
              onChangeText={handleChange("description")}
              onBlur={handleBlur("description")}
              placeholder="กรอกรายละเอียดสินค้า"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {touched.description && errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}

            <Text style={styles.label}>ราคา (บาท) *</Text>
            <TextInput
              style={[
                styles.input,
                touched.price && errors.price && styles.inputError,
              ]}
              value={values.price}
              onChangeText={handleChange("price")}
              onBlur={handleBlur("price")}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
            {touched.price && errors.price && (
              <Text style={styles.errorText}>{errors.price}</Text>
            )}

            <Text style={styles.label}>จำนวนสต็อก *</Text>
            <TextInput
              style={[
                styles.input,
                touched.stock && errors.stock && styles.inputError,
              ]}
              value={values.stock}
              onChangeText={handleChange("stock")}
              onBlur={handleBlur("stock")}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            {touched.stock && errors.stock && (
              <Text style={styles.errorText}>{errors.stock}</Text>
            )}

            <Text style={styles.label}>หน่วย</Text>
            <View
              style={[
                styles.pickerContainer,
                touched.unit && errors.unit && styles.inputError,
              ]}
            >
              <Picker
                selectedValue={values.unit}
                onValueChange={(value) => setFieldValue("unit", value)}
                style={styles.picker}
              >
                <Picker.Item label="ชิ้น" value="ชิ้น" />
                <Picker.Item label="กิโลกรัม" value="กก." />
                <Picker.Item label="กรัม" value="กรัม" />
                <Picker.Item label="แพ็ค" value="แพ็ค" />
                <Picker.Item label="ลัง" value="ลัง" />
              </Picker>
            </View>
            {touched.unit && errors.unit && (
              <Text style={styles.errorText}>{errors.unit}</Text>
            )}

            <Text style={styles.label}>หมวดหมู่ *</Text>
            <View
              style={[
                styles.pickerContainer,
                touched.categoryId && errors.categoryId && styles.inputError,
              ]}
            >
              <Picker
                selectedValue={values.categoryId}
                onValueChange={(value) => setFieldValue("categoryId", value)}
                style={styles.picker}
              >
                <Picker.Item label="-- เลือกหมวดหมู่ --" value="" />
                {categories.map((category: any) => (
                  <Picker.Item
                    key={category.categoryId}
                    label={category.categoryName}
                    value={category.categoryId.toString()}
                  />
                ))}
              </Picker>
            </View>
            {touched.categoryId && errors.categoryId && (
              <Text style={styles.errorText}>{errors.categoryId}</Text>
            )}
          </View>

          <PrimaryButton
            label={isLoading ? "กำลังบันทึก..." : "บันทึกสินค้า"}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          />
        </ScrollView>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  imageList: {
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  primaryBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  imagePickerButton: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderStyle: "dashed",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8f0",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputError: {
    borderColor: "#f44336",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CreateProductScreen;
