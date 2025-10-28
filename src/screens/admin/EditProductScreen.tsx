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
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  useGetProductQuery,
  useUpdateProductMutation,
} from "../../api/productApi";
import { useGetCategoriesQuery } from "../../api/productApi";
import PrimaryButton from "../../components/common/PrimaryButton";
import LoadingState from "../../components/common/LoadingState";

// Validation Schema (same as CreateProductScreen but with optional fields)
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
  isActive: Yup.boolean(),
});

const EditProductScreen = ({ route, navigation }: any) => {
  // Support both 'id' and 'productId' parameter names
  const { productId, id } = route.params;
  const actualProductId = productId || id;

  const { data: productData, isLoading: loadingProduct } =
    useGetProductQuery(actualProductId);
  const product = productData?.data;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);

  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  // Set initial image from product
  React.useEffect(() => {
    if (product?.imageUrl) {
      setImageUri(product.imageUrl);
    }
  }, [product]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ขออภัย", "จำเป็นต้องอนุญาตการเข้าถึงคลังรูปภาพ");
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
      setImageUri(asset.uri);

      // Create file object for upload
      const fileExtension = asset.uri.split(".").pop();
      const fileName = `product_${Date.now()}.${fileExtension}`;
      const fileType = `image/${fileExtension}`;

      setImageFile({
        uri: asset.uri,
        name: fileName,
        type: fileType,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const updateData: any = {
        productName: values.productName,
        description: values.description,
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        unit: values.unit,
        categoryId: parseInt(values.categoryId),
        isActive: values.isActive,
      };

      if (imageFile) {
        updateData.image = imageFile;
      }

      const result = await updateProduct({ id: actualProductId, data: updateData }).unwrap();

      Alert.alert("สำเร็จ", "อัพเดทสินค้าเรียบร้อยแล้ว", [
        { text: "ตกลง", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Update product error:", error);

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
          error?.data?.message || "ไม่สามารถอัพเดทสินค้าได้ กรุณาลองใหม่อีกครั้ง"
        );
      }
    }
  };

  if (loadingProduct || !product) {
    return <LoadingState />;
  }

  return (
    <Formik
      initialValues={{
        productName: product.productName || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        unit: product.unit || "ชิ้น",
        categoryId: product.categoryId?.toString() || "",
        isActive: product.isActive ?? true,
      }}
      validationSchema={productValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
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
            <Text style={styles.sectionTitle}>รูปภาพสินค้า</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Icon name="camera-plus" size={48} color="#999" />
                  <Text style={styles.placeholderText}>เลือกรูปภาพ</Text>
                </View>
              )}
            </TouchableOpacity>
            {imageFile && (
              <Text style={styles.helperText}>รูปภาพใหม่ถูกเลือกแล้ว</Text>
            )}
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

            <View style={styles.switchContainer}>
              <Text style={styles.label}>สถานะสินค้า</Text>
              <Switch
                value={values.isActive}
                onValueChange={(value) => {
                  void setFieldValue("isActive", value);
                }}
                trackColor={{ false: "#ccc", true: "#4CAF50" }}
                thumbColor="#fff"
              />
            </View>
            <Text style={styles.helperText}>
              {values.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            </Text>
          </View>

          <PrimaryButton
            label={isLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
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
  imagePickerButton: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    color: "#999",
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default EditProductScreen;
