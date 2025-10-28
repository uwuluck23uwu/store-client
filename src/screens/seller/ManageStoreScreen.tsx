import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import {
  useGetSellerInfoQuery,
  useCreateSellerMutation,
  useUpdateSellerInfoMutation,
  useUploadShopImageMutation,
  useUploadLogoMutation,
  useUploadQRCodeMutation,
} from "../../api/sellerApi";
import { API_BASE_URL } from "../../api/baseApi";
import * as ImagePicker from "expo-image-picker";
import { PrimaryButton } from "../../components/common";
import { LocationDetailModal } from "../../components/map";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useUploadLocationImageMutation,
} from "../../api/locationApi";
import { Formik } from "formik";
import * as Yup from "yup";

const { width, height } = Dimensions.get("window");
const MAP_WIDTH = width;
const MAP_HEIGHT = height - 100;

// Validation Schema for Location
const locationValidationSchema = Yup.object().shape({
  locationName: Yup.string()
    .required("กรุณากรอกชื่อสถานที่")
    .min(2, "ชื่อสถานที่ต้องมีอย่างน้อย 2 ตัวอักษร"),
  description: Yup.string(),
  phoneNumber: Yup.string().matches(
    /^[0-9]{9,10}$/,
    "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9-10 หลัก)"
  ),
});

const initialLocationFormValues = {
  locationName: "",
  description: "",
  phoneNumber: "",
};

const ManageStoreScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const {
    data: sellerData,
    isLoading,
    refetch,
  } = useGetSellerInfoQuery(user?.id || 0, {
    skip: !user?.id,
  });
  const [createSeller, { isLoading: isCreating }] = useCreateSellerMutation();
  const [updateSellerInfo, { isLoading: isUpdating }] =
    useUpdateSellerInfoMutation();
  const [uploadShopImage, { isLoading: isUploadingShop }] =
    useUploadShopImageMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadLogoMutation();
  const [uploadQRCode, { isLoading: isUploadingQR }] =
    useUploadQRCodeMutation();

  // Location API hooks
  const {
    data: locationsData,
    isLoading: isLoadingLocations,
    refetch: refetchLocations,
  } = useGetLocationsQuery();
  const [createLocation, { isLoading: isCreatingLocation }] =
    useCreateLocationMutation();
  const [updateLocation, { isLoading: isUpdatingLocation }] =
    useUpdateLocationMutation();
  const [deleteLocation, { isLoading: isDeletingLocation }] =
    useDeleteLocationMutation();
  const [uploadLocationImage, { isLoading: isUploadingLocationImage }] =
    useUploadLocationImageMutation();

  const [formData, setFormData] = useState({
    shopName: "",
    shopDescription: "",
    phoneNumber: "",
    address: "",
    shopImageUrl: "",
    logoUrl: "",
    qrCodeUrl: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);

  // Track newly selected images (local URIs)
  const [newShopImage, setNewShopImage] = useState<string | null>(null);
  const [newLogo, setNewLogo] = useState<string | null>(null);
  const [newQRCode, setNewQRCode] = useState<string | null>(null);
  const [newLocationImage, setNewLocationImage] = useState<string | null>(null);

  // Map modal state
  const [showMapModal, setShowMapModal] = useState(false);
  const [isAddMarkerMode, setIsAddMarkerMode] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showLocationDetail, setShowLocationDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Zoom and Pan state for map
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    if (sellerData?.data) {
      const seller = sellerData.data;
      setFormData({
        shopName: seller.shopName || "",
        shopDescription: seller.shopDescription || "",
        phoneNumber: seller.phoneNumber || "",
        address: seller.address || "",
        shopImageUrl: seller.shopImageUrl || "",
        logoUrl: seller.logoUrl || "",
        qrCodeUrl: seller.qrCodeUrl || "",
      });

      // Convert relative paths to full URLs for image preview
      const getFullUrl = (path: string | undefined | null) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `${API_BASE_URL}${path}`;
      };

      setImagePreview(getFullUrl(seller.shopImageUrl));
      setLogoPreview(getFullUrl(seller.logoUrl));
      setQrCodePreview(getFullUrl(seller.qrCodeUrl));
    }
  }, [sellerData]);

  // Refetch seller info when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  // Set location image when opening edit mode
  useEffect(() => {
    if (isEditMode && selectedLocation?.imageUrl && showLocationForm) {
      // Don't override if user already selected a new image
      if (!newLocationImage) {
        // Convert relative path to full URL
        const imageUrl = selectedLocation.imageUrl;
        const fullUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `${API_BASE_URL}${imageUrl}`;
        setNewLocationImage(fullUrl);
      }
    } else if (!showLocationForm) {
      // Reset when closing form
      setNewLocationImage(null);
    }
  }, [isEditMode, selectedLocation, showLocationForm, newLocationImage]);

  const handleImagePick = async (
    type: "shop" | "logo" | "qrcode" | "location"
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("ขออภัย", "ต้องการสิทธิ์ในการเข้าถึงคลังรูปภาพ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "logo" || type === "qrcode" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      if (type === "shop") {
        setImagePreview(imageUri);
        setNewShopImage(imageUri);
      } else if (type === "logo") {
        setLogoPreview(imageUri);
        setNewLogo(imageUri);
      } else if (type === "qrcode") {
        setQrCodePreview(imageUri);
        setNewQRCode(imageUri);
      } else if (type === "location") {
        setNewLocationImage(imageUri);
      }
    }
  };

  const uploadImageToServer = async (imageUri: string, filename: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: filename,
    } as any);
    return formData;
  };

  // Map gesture handlers
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      // Limit zoom between 1x and 4x
      scale.value = Math.max(1, Math.min(scale.value, 4));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const maxX = (MAP_WIDTH * scale.value - MAP_WIDTH) / 2;
      const maxY = (MAP_HEIGHT * scale.value - MAP_HEIGHT) / 2;

      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;

      // Limit pan to map bounds
      translateX.value = Math.max(-maxX, Math.min(translateX.value, maxX));
      translateY.value = Math.max(-maxY, Math.min(translateY.value, maxY));
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Tap gesture for adding markers
  const tapGesture = Gesture.Tap().onEnd((event) => {
    if (!isAddMarkerMode) return;

    const x = event.x;
    const y = event.y;

    // Convert screen coordinates to map coordinates (accounting for zoom and pan)
    const mapX = (x - translateX.value) / scale.value;
    const mapY = (y - translateY.value) / scale.value;

    runOnJS(setNewMarkerPosition)({ x: mapX, y: mapY });
    runOnJS(setShowLocationForm)(true);
  });

  const composedGesture = Gesture.Simultaneous(
    Gesture.Exclusive(pinchGesture, panGesture),
    tapGesture
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const handleOpenMap = () => {
    // Reset zoom and pan when opening map
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setShowMapModal(true);
  };

  const handleCloseMap = () => {
    setShowMapModal(false);
    setIsAddMarkerMode(false);
    setNewMarkerPosition(null);
    setSelectedLocation(null);
    setShowLocationForm(false);
    setShowLocationDetail(false);
    setIsEditMode(false);
  };

  // Location Management Functions
  const getSellerLocation = () => {
    if (!sellerData?.data?.sellerId) return null;
    const sellerId = sellerData.data.sellerId;
    const locations = locationsData?.data || [];
    return locations.find((loc) => loc.sellerId === sellerId);
  };

  const getMarkerPosition = (location: any) => {
    const lat = Number(location.latitude);
    const lng = Number(location.longitude);
    const y = ((lat - 13.7563) / 0.2 + 0.5) * MAP_HEIGHT;
    const x = ((lng - 100.5018) / 0.2 + 0.5) * MAP_WIDTH;
    return { x, y };
  };

  const handleMarkerPress = (location: any) => {
    setSelectedLocation(location);
    setIsEditMode(true);
    setShowLocationForm(true);
  };

  const handleSubmitLocation = async (
    values: typeof initialLocationFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    if (!newMarkerPosition && !isEditMode) {
      Alert.alert("ข้อผิดพลาด", "กรุณาเลือกตำแหน่งบนแผนที่");
      setSubmitting(false);
      return;
    }

    if (!sellerData?.data?.sellerId) {
      Alert.alert("ข้อผิดพลาด", "กรุณาสร้างร้านค้าก่อน");
      setSubmitting(false);
      return;
    }

    try {
      if (isEditMode && selectedLocation) {
        // Update existing location
        await updateLocation({
          refId: selectedLocation.locationId,
          data: {
            locationName: values.locationName.trim(),
            description: values.description.trim() || undefined,
            phoneNumber: values.phoneNumber.trim() || undefined,
          },
        }).unwrap();

        // Upload image if selected (only if it's a new local image)
        if (
          newLocationImage &&
          selectedLocation.id &&
          !newLocationImage.startsWith("http")
        ) {
          try {
            const formData = new FormData();
            formData.append("file", {
              uri: newLocationImage,
              type: "image/jpeg",
              name: `location-${selectedLocation.id}-${Date.now()}.jpg`,
            } as any);

            await uploadLocationImage({
              locationId: selectedLocation.id,
              formData,
            }).unwrap();
          } catch (uploadError) {
            console.error("Error uploading location image:", uploadError);
            // Don't show error, location is already updated
          }
        }

        Alert.alert("สำเร็จ", "แก้ไขตำแหน่งเรียบร้อยแล้ว");
      } else {
        // Create new location
        const latitude =
          13.7563 + (newMarkerPosition!.y / MAP_HEIGHT - 0.5) * 0.2;
        const longitude =
          100.5018 + (newMarkerPosition!.x / MAP_WIDTH - 0.5) * 0.2;

        const result = await createLocation({
          locationName: values.locationName.trim(),
          description: values.description.trim() || undefined,
          locationType: "Store",
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          address: formData.address || undefined,
          phoneNumber: values.phoneNumber.trim() || undefined,
          iconColor: "#4CAF50",
          sellerId: sellerData.data.sellerId,
          isActive: true,
        }).unwrap();

        // Upload image if selected or use shop image
        const imageToUpload = newLocationImage || imagePreview;
        if (imageToUpload && result.data) {
          try {
            const locationId = result.data;
            const formData = new FormData();
            formData.append("file", {
              uri: imageToUpload,
              type: "image/jpeg",
              name: `location-${locationId}-${Date.now()}.jpg`,
            } as any);

            await uploadLocationImage({ locationId, formData }).unwrap();
          } catch (uploadError) {
            console.error("Error uploading location image:", uploadError);
            // Don't show error, location is already created
          }
        }

        Alert.alert("สำเร็จ", "เพิ่มตำแหน่งร้านค้าเรียบร้อยแล้ว");
      }

      resetForm();
      setShowLocationForm(false);
      setNewMarkerPosition(null);
      setSelectedLocation(null);
      setIsEditMode(false);
      setIsAddMarkerMode(false);
      setNewLocationImage(null);
      refetchLocations();
    } catch (error: any) {
      console.error("Error saving location:", error);
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error?.data?.message || "ไม่สามารถบันทึกตำแหน่งได้"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLocation = () => {
    if (!selectedLocation) return;

    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบตำแหน่ง "${selectedLocation.locationName}" ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLocation(selectedLocation.id).unwrap();
              Alert.alert("สำเร็จ", "ลบตำแหน่งเรียบร้อยแล้ว");
              setShowLocationForm(false);
              setSelectedLocation(null);
              setIsEditMode(false);
              refetchLocations();
            } catch (error: any) {
              console.error("Error deleting location:", error);
              Alert.alert(
                "เกิดข้อผิดพลาด",
                error?.data?.message || "ไม่สามารถลบตำแหน่งได้"
              );
            }
          },
        },
      ]
    );
  };

  const closeLocationForm = () => {
    setShowLocationForm(false);
    setNewMarkerPosition(null);
    setSelectedLocation(null);
    setIsEditMode(false);
    setNewLocationImage(null);
  };

  const handleSave = async () => {
    if (!formData.shopName.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกชื่อร้านค้า");
      return;
    }

    try {
      const isNewSeller = !sellerData?.data?.sellerId;

      // If this is a new seller, create seller first
      if (isNewSeller) {
        const createResult = await createSeller({
          shopName: formData.shopName,
          shopDescription: formData.shopDescription,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        }).unwrap();

        if (createResult.isSuccess) {
          Alert.alert("สำเร็จ", "สร้างร้านค้าเรียบร้อยแล้ว กรุณารอสักครู่...");
          // Refetch to get the new seller data
          await refetch();

          // If there are images to upload, show a message to save again
          if (newShopImage || newLogo || newQRCode) {
            Alert.alert(
              "แจ้งเตือน",
              "ร้านค้าถูกสร้างเรียบร้อยแล้ว กรุณากดบันทึกอีกครั้งเพื่ออัพโหลดรูปภาพ"
            );
          }
          return;
        }
      }

      // Update existing seller
      let updatedFormData = { ...formData };

      // Upload new shop image if selected
      if (newShopImage && sellerData?.data?.sellerId) {
        const imageFormData = await uploadImageToServer(
          newShopImage,
          `shop_${sellerData.data.sellerId}_${Date.now()}.jpg`
        );
        const uploadResult = await uploadShopImage(imageFormData).unwrap();
        if (uploadResult.isSuccess && uploadResult.data) {
          updatedFormData.shopImageUrl = uploadResult.data;
        }
      }

      // Upload new logo if selected
      if (newLogo && sellerData?.data?.sellerId) {
        const logoFormData = await uploadImageToServer(
          newLogo,
          `logo_${sellerData.data.sellerId}_${Date.now()}.jpg`
        );
        const uploadResult = await uploadLogo(logoFormData).unwrap();
        if (uploadResult.isSuccess && uploadResult.data) {
          updatedFormData.logoUrl = uploadResult.data;
        }
      }

      // Upload new QR code if selected
      if (newQRCode && sellerData?.data?.sellerId) {
        const qrFormData = await uploadImageToServer(
          newQRCode,
          `qr_${sellerData.data.sellerId}_${Date.now()}.jpg`
        );
        const uploadResult = await uploadQRCode(qrFormData).unwrap();
        if (uploadResult.isSuccess && uploadResult.data) {
          updatedFormData.qrCodeUrl = uploadResult.data;
        }
      }

      // Update seller info with all data
      if (sellerData?.data?.sellerId) {
        const result = await updateSellerInfo({
          sellerId: sellerData.data.sellerId,
          data: updatedFormData,
        }).unwrap();

        if (result.isSuccess) {
          Alert.alert("สำเร็จ", "บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว");
          // Clear new image states
          setNewShopImage(null);
          setNewLogo(null);
          setNewQRCode(null);
          refetch();
        }
      }
    } catch (error: any) {
      console.error("Error saving store info:", error);
      Alert.alert(
        "ข้อผิดพลาด",
        error?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
      );
    }
  };

  // Show loading only on initial load, not when there's no seller data (could be new seller)
  if (isLoading && !sellerData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const isNewSeller = !sellerData?.data?.sellerId;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isNewSeller ? "สร้างร้านค้าของคุณ" : "จัดการข้อมูลร้านค้า"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isNewSeller
            ? "กรอกข้อมูลร้านค้าของคุณเพื่อเริ่มต้นขาย"
            : "แก้ไขข้อมูลและรูปภาพของร้านค้าของคุณ"}
        </Text>
      </View>

      {/* Shop Logo */}
      <View style={styles.section}>
        <Text style={styles.label}>โลโก้ร้านค้า</Text>
        <TouchableOpacity
          style={styles.imagePickerContainer}
          onPress={() => handleImagePick("logo")}
        >
          {logoPreview ? (
            <Image source={{ uri: logoPreview }} style={styles.logoImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="store" size={50} color="#999" />
              <Text style={styles.imagePlaceholderText}>
                แตะเพื่อเลือกโลโก้
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Shop Cover Image */}
      <View style={styles.section}>
        <Text style={styles.label}>รูปภาพปกร้าน</Text>
        <TouchableOpacity
          style={styles.imagePickerContainer}
          onPress={() => handleImagePick("shop")}
        >
          {imagePreview ? (
            <Image source={{ uri: imagePreview }} style={styles.coverImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={50} color="#999" />
              <Text style={styles.imagePlaceholderText}>
                แตะเพื่อเลือกรูปภาพปก
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Code */}
      <View style={styles.section}>
        <Text style={styles.label}>QR Code ร้านค้า</Text>
        <Text style={styles.helpText}>
          อัพโหลด QR Code สำหรับชำระเงินหรือข้อมูลติดต่อร้านค้า
        </Text>
        <TouchableOpacity
          style={styles.imagePickerContainer}
          onPress={() => handleImagePick("qrcode")}
        >
          {qrCodePreview ? (
            <Image source={{ uri: qrCodePreview }} style={styles.qrCodeImage} />
          ) : (
            <View style={[styles.imagePlaceholder, styles.qrCodePlaceholder]}>
              <Icon name="qrcode" size={50} color="#999" />
              <Text style={styles.imagePlaceholderText}>
                แตะเพื่อเลือก QR Code
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Shop Name */}
      <View style={styles.section}>
        <Text style={styles.label}>
          ชื่อร้านค้า <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกชื่อร้านค้า"
          value={formData.shopName}
          onChangeText={(text) => setFormData({ ...formData, shopName: text })}
        />
      </View>

      {/* Shop Description */}
      <View style={styles.section}>
        <Text style={styles.label}>คำอธิบายร้านค้า</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="กรอกคำอธิบายเกี่ยวกับร้านค้าของคุณ"
          value={formData.shopDescription}
          onChangeText={(text) =>
            setFormData({ ...formData, shopDescription: text })
          }
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Phone Number */}
      <View style={styles.section}>
        <Text style={styles.label}>เบอร์โทรศัพท์</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกเบอร์โทรศัพท์ร้านค้า"
          value={formData.phoneNumber}
          onChangeText={(text) =>
            setFormData({ ...formData, phoneNumber: text })
          }
          keyboardType="phone-pad"
        />
      </View>

      {/* Address */}
      <View style={styles.section}>
        <Text style={styles.label}>ที่อยู่ร้านค้า</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="กรอกที่อยู่ร้านค้า"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Map Pin Button */}
      <View style={styles.section}>
        <Text style={styles.label}>ตำแหน่งร้านค้าบนแผนที่</Text>
        <Text style={styles.helpText}>
          ดูตำแหน่งร้านค้าของคุณบนแผนที่ท้องถิ่น
        </Text>
        <PrimaryButton
          label="ดูแผนที่ร้านค้า"
          onPress={handleOpenMap}
          icon="map-marker"
          style={{ marginTop: 10 }}
        />
      </View>

      {/* Store Stats */}
      {sellerData?.data && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="star" size={30} color="#FFC107" />
            <Text style={styles.statValue}>
              {sellerData.data.rating?.toFixed(1) || "0.0"}
            </Text>
            <Text style={styles.statLabel}>คะแนนร้านค้า</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="cart-check" size={30} color="#4CAF50" />
            <Text style={styles.statValue}>
              {sellerData.data.totalSales || 0}
            </Text>
            <Text style={styles.statLabel}>ยอดขายทั้งหมด</Text>
          </View>
          <View style={styles.statCard}>
            <Icon
              name={
                sellerData.data.isVerified ? "check-decagram" : "close-circle"
              }
              size={30}
              color={sellerData.data.isVerified ? "#4CAF50" : "#999"}
            />
            <Text style={styles.statValue}>
              {sellerData.data.isVerified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
            </Text>
            <Text style={styles.statLabel}>สถานะการยืนยัน</Text>
          </View>
        </View>
      )}

      {/* Save Button */}
      <View style={{ marginHorizontal: 20, marginTop: 30 }}>
        <PrimaryButton
          label={
            isCreating
              ? "กำลังสร้างร้านค้า..."
              : isUploadingShop || isUploadingLogo || isUploadingQR
              ? "กำลังอัพโหลดรูปภาพ..."
              : isUpdating
              ? "กำลังบันทึก..."
              : isNewSeller
              ? "สร้างร้านค้า"
              : "บันทึกข้อมูล"
          }
          onPress={handleSave}
          icon="content-save"
          loading={
            isCreating ||
            isUpdating ||
            isUploadingShop ||
            isUploadingLogo ||
            isUploadingQR
          }
          disabled={
            isCreating ||
            isUpdating ||
            isUploadingShop ||
            isUploadingLogo ||
            isUploadingQR
          }
        />
      </View>

      <View style={styles.footer} />

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseMap}
      >
        <GestureHandlerRootView style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseMap}
            >
              <Icon name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.mapHeaderTitle}>จัดการตำแหน่งร้านค้า</Text>
            <TouchableOpacity
              style={styles.addMarkerButton}
              onPress={() => setIsAddMarkerMode(!isAddMarkerMode)}
            >
              <Icon
                name={isAddMarkerMode ? "eye" : "map-marker-plus"}
                size={24}
                color={isAddMarkerMode ? "#F44336" : "#4CAF50"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <GestureDetector gesture={composedGesture}>
              <Animated.View style={[styles.mapWrapper, animatedStyle]}>
                <Image
                  source={require("../../../assets/map.jpg")}
                  style={styles.mapImage}
                  resizeMode="cover"
                />

                {/* Show all location markers */}
                {(locationsData?.data || []).map((location) => {
                  const position = getMarkerPosition(location);
                  const isOwnLocation =
                    location.sellerId === sellerData?.data?.sellerId;

                  return (
                    <Animated.View
                      key={location.id}
                      style={[
                        styles.marker,
                        {
                          left: position.x - 20,
                          top: position.y - 40,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          if (isOwnLocation) {
                            handleMarkerPress(location);
                          } else {
                            setSelectedLocation(location);
                            setShowLocationDetail(true);
                          }
                        }}
                        activeOpacity={0.7}
                        style={styles.markerContent}
                      >
                        <View
                          style={[
                            styles.markerCircle,
                            {
                              backgroundColor: isOwnLocation
                                ? "#10B981"
                                : location.iconColor || "#FF9800",
                            },
                          ]}
                        >
                          <Icon name="store" size={20} color="#FFFFFF" />
                        </View>
                        <Text style={styles.markerLabel} numberOfLines={1}>
                          {location.locationName}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}

                {/* Show temporary new marker */}
                {newMarkerPosition && (
                  <Animated.View
                    style={[
                      styles.marker,
                      {
                        left: newMarkerPosition.x - 20,
                        top: newMarkerPosition.y - 40,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.markerCircle,
                        { backgroundColor: "#4CAF50" },
                      ]}
                    >
                      <Icon name="store" size={20} color="#FFFFFF" />
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
            </GestureDetector>
          </View>

          <View style={styles.mapFooter}>
            <Text style={styles.mapHintText}>
              {isAddMarkerMode
                ? "แตะบนแผนที่เพื่อเพิ่มตำแหน่ง หรือแตะหมุดเพื่อแก้ไข/ลบ"
                : "ใช้นิ้วสองนิ้วเพื่อซูม แตะหมุดเพื่อแก้ไข/ลบตำแหน่ง"}
            </Text>
          </View>
        </GestureHandlerRootView>
      </Modal>

      {/* Location Form Modal */}
      <Modal
        visible={showLocationForm}
        animationType="slide"
        transparent={true}
        onRequestClose={closeLocationForm}
      >
        <View style={styles.formModalContainer}>
          <View style={styles.formModalContent}>
            <Formik
              initialValues={
                isEditMode && selectedLocation
                  ? {
                      locationName: selectedLocation.locationName || "",
                      description: selectedLocation.description || "",
                      phoneNumber: selectedLocation.phoneNumber || "",
                    }
                  : {
                      locationName: sellerData?.data?.shopName || "",
                      description: sellerData?.data?.shopDescription || "",
                      phoneNumber: sellerData?.data?.phoneNumber || "",
                    }
              }
              validationSchema={locationValidationSchema}
              onSubmit={handleSubmitLocation}
              validateOnChange={true}
              validateOnBlur={true}
              enableReinitialize={true}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.formModalTitle}>
                    {isEditMode ? "แก้ไขตำแหน่งร้านค้า" : "เพิ่มตำแหน่งร้านค้า"}
                  </Text>

                  <Text style={styles.formLabel}>ชื่อตำแหน่ง *</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      touched.locationName &&
                        errors.locationName &&
                        styles.formInputError,
                    ]}
                    value={values.locationName}
                    onChangeText={handleChange("locationName")}
                    onBlur={handleBlur("locationName")}
                    placeholder="เช่น ร้าน June Store สาขาหลัก"
                  />
                  {touched.locationName && errors.locationName && (
                    <Text style={styles.formErrorText}>
                      {String(errors.locationName)}
                    </Text>
                  )}

                  <Text style={styles.formLabel}>รายละเอียด</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    value={values.description}
                    onChangeText={handleChange("description")}
                    onBlur={handleBlur("description")}
                    placeholder="รายละเอียดเพิ่มเติม"
                    multiline
                    numberOfLines={3}
                  />

                  <Text style={styles.formLabel}>เบอร์โทรศัพท์</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      touched.phoneNumber &&
                        errors.phoneNumber &&
                        styles.formInputError,
                    ]}
                    value={values.phoneNumber}
                    onChangeText={handleChange("phoneNumber")}
                    onBlur={handleBlur("phoneNumber")}
                    placeholder="เบอร์โทรศัพท์ (9-10 หลัก)"
                    keyboardType="phone-pad"
                  />
                  {touched.phoneNumber && errors.phoneNumber && (
                    <Text style={styles.formErrorText}>
                      {String(errors.phoneNumber)}
                    </Text>
                  )}

                  <Text style={styles.formLabel}>รูปภาพตำแหน่ง</Text>
                  <TouchableOpacity
                    style={styles.locationImagePickerContainer}
                    onPress={() => handleImagePick("location")}
                  >
                    {(newLocationImage || imagePreview) ? (
                      <Image
                        source={{
                          uri: (newLocationImage || imagePreview) as string,
                        }}
                        style={styles.locationSelectedImage}
                      />
                    ) : (
                      <View style={styles.locationImagePlaceholder}>
                        <Icon name="image-plus" size={40} color="#999" />
                        <Text style={styles.locationImagePlaceholderText}>
                          แตะเพื่อเลือกรูปภาพ
                        </Text>
                        <Text style={styles.locationImageHintText}>
                          (ถ้าไม่เลือก จะใช้รูปปกร้านอัตโนมัติ)
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.formModalButtons}>
                    <TouchableOpacity
                      style={[styles.formModalButton, styles.formCancelButton]}
                      onPress={closeLocationForm}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.formCancelButtonText}>ยกเลิก</Text>
                    </TouchableOpacity>
                    {isEditMode && (
                      <TouchableOpacity
                        style={[styles.formModalButton, styles.deleteButton]}
                        onPress={handleDeleteLocation}
                      >
                        <Text style={styles.deleteButtonText}>ลบ</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.formModalButton,
                        styles.formSubmitButton,
                        isSubmitting && styles.formSubmitButtonDisabled,
                      ]}
                      onPress={() => handleSubmit()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.formSubmitButtonText}>
                          {isEditMode ? "บันทึก" : "เพิ่มตำแหน่ง"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </Formik>
          </View>
        </View>
      </Modal>

      {/* Location Detail Modal (for viewing other locations) */}
      <LocationDetailModal
        visible={showLocationDetail}
        location={selectedLocation}
        onClose={() => setShowLocationDetail(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  required: {
    color: "#F44336",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  imagePickerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
  },
  coverImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  qrCodePlaceholder: {
    height: 250,
  },
  qrCodeImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#999",
  },
  helpText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
    fontStyle: "italic",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 15,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  footer: {
    height: 30,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f5f5f5",
  },
  mapWrapper: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },
  mapImage: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },
  mapFooter: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  mapHintText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  addMarkerButton: {
    padding: 5,
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    width: 60,
  },
  markerContent: {
    alignItems: "center",
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerLabel: {
    marginTop: 4,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "bold",
    maxWidth: 100,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  formModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  formModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.75,
  },
  formModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  formInputError: {
    borderColor: "#F44336",
    borderWidth: 2,
  },
  formErrorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  formTextArea: {
    height: 80,
    textAlignVertical: "top",
  },
  formModalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
    marginBottom: 10,
  },
  formModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  formCancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  formCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  formSubmitButton: {
    backgroundColor: "#4CAF50",
  },
  formSubmitButtonDisabled: {
    backgroundColor: "#A5D6A7",
    opacity: 0.6,
  },
  formSubmitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  locationImagePickerContainer: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 15,
  },
  locationSelectedImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  locationImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  locationImagePlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  locationImageHintText: {
    marginTop: 5,
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});

export default ManageStoreScreen;
