import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useUploadLocationImageMutation,
} from "../../api/locationApi";
import { FloatingActionButton } from "../../components/common";
import { LocationDetailModal } from "../../components/map";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

// ขนาดของแผนที่ (สามารถปรับได้ตามขนาดรูปจริง)
const MAP_WIDTH = width;
const MAP_HEIGHT = height - 100;

// Validation Schema
const locationValidationSchema = Yup.object().shape({
  locationName: Yup.string()
    .required("กรุณากรอกชื่อสถานที่")
    .min(2, "ชื่อสถานที่ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(200, "ชื่อสถานที่ต้องไม่เกิน 200 ตัวอักษร"),
  description: Yup.string().max(1000, "รายละเอียดต้องไม่เกิน 1000 ตัวอักษร"),
  locationType: Yup.string()
    .required("กรุณาเลือกประเภทสถานที่")
    .oneOf(["Store", "Pickup", "Farm", "Warehouse"], "ประเภทไม่ถูกต้อง"),
  address: Yup.string().max(500, "ที่อยู่ต้องไม่เกิน 500 ตัวอักษร"),
  phoneNumber: Yup.string()
    .matches(
      /^[0-9]{9,10}$/,
      "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9-10 หลัก)"
    )
    .nullable(),
  iconColor: Yup.string().required("กรุณาเลือกสีหมุด"),
});

// Initial form values
const initialFormValues = {
  locationName: "",
  description: "",
  locationType: "Store",
  address: "",
  phoneNumber: "",
  iconColor: "#4CAF50",
};

const MapScreen = ({ route }: any) => {
  const { highlightLocationId } = route?.params || {};
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMarkerMode, setIsAddMarkerMode] = useState(false); // โหมดเพิ่มหมุด vs ดูข้อมูล (เฉพาะ Admin)
  const [currentHighlightedId, setCurrentHighlightedId] = useState<
    string | null
  >(null); // Track currently highlighted location

  // Zoom and Pan state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Fetch locations using RTK Query
  const {
    data: locationsData,
    isLoading,
    isError,
    refetch,
  } = useGetLocationsQuery();
  const locations = locationsData?.data || [];

  const [createLocation, { isLoading: isCreating }] =
    useCreateLocationMutation();
  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();
  const [uploadLocationImage, { isLoading: isUploadingImage }] =
    useUploadLocationImageMutation();

  // Image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Check if user is admin every time screen is focused
  useFocusEffect(
    useCallback(() => {
      checkUserRole();
    }, [])
  );

  useEffect(() => {
    if (isError) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลตำแหน่งได้");
    }
  }, [isError]);

  // Set highlighted location from route params
  useFocusEffect(
    useCallback(() => {
      if (highlightLocationId) {
        setCurrentHighlightedId(highlightLocationId);
      }
    }, [highlightLocationId])
  );

  const checkUserRole = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === "Admin");
        setCurrentUserId(user.id);
      } else {
        setIsAdmin(false);
        setCurrentUserId(null);
      }
    } catch (error) {
      console.log("Error checking user role:", error);
      setIsAdmin(false);
      setCurrentUserId(null);
    }
  };

  // Handle image selection
  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("ขออภัย", "ต้องการสิทธิ์ในการเข้าถึงคลังรูปภาพ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      // Limit zoom between 1x and 4x
      scale.value = Math.max(1, Math.min(scale.value, 4));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Pan gesture for moving map
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

  // Tap gesture for adding markers (admin only)
  const tapGesture = Gesture.Tap().onEnd((event) => {
    if (!isAdmin || !isAddMarkerMode) return;

    const x = event.x;
    const y = event.y;

    // Convert screen coordinates to map coordinates (accounting for zoom and pan)
    const mapX = (x - translateX.value) / scale.value;
    const mapY = (y - translateY.value) / scale.value;

    runOnJS(setNewMarkerPosition)({ x: mapX, y: mapY });
    runOnJS(setShowAddModal)(true);
  });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    Gesture.Exclusive(pinchGesture, panGesture),
    tapGesture
  );

  // Animated style for map container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Get marker position with zoom and pan
  const getAnimatedMarkerStyle = (location: any) => {
    const position = getMarkerPosition(location);
    return useAnimatedStyle(() => {
      return {
        position: "absolute",
        left: position.x - 20,
        top: position.y - 40,
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
        ],
      };
    });
  };

  const handleSubmitLocation = async (
    values: typeof initialFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    if (!newMarkerPosition) {
      Alert.alert("ข้อผิดพลาด", "กรุณาเลือกตำแหน่งบนแผนที่");
      setSubmitting(false);
      return;
    }

    // Check token before submitting
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("กรุณาเข้าสู่ระบบ", "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      setSubmitting(false);
      return;
    }

    try {
      // แปลงพิกัดจากตำแหน่งบนหน้าจอเป็น latitude/longitude
      const latitude = 13.7563 + (newMarkerPosition.y / MAP_HEIGHT - 0.5) * 0.2;
      const longitude =
        100.5018 + (newMarkerPosition.x / MAP_WIDTH - 0.5) * 0.2;

      const payload = {
        locationName: values.locationName.trim(),
        description: values.description.trim() || undefined,
        locationType: values.locationType,
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        address: values.address.trim() || undefined,
        phoneNumber: values.phoneNumber.trim() || undefined,
        iconColor: values.iconColor,
        sellerId: undefined, // Admin ไม่ได้กำหนด sellerId ตอนสร้าง
        isActive: true,
      };

      const result = await createLocation(payload).unwrap();

      // Upload image if selected
      if (selectedImage && result.data) {
        try {
          const locationId = result.data; // Assuming the API returns the new location ID
          const formData = new FormData();
          formData.append("file", {
            uri: selectedImage,
            type: "image/jpeg",
            name: `location-${locationId}-${Date.now()}.jpg`,
          } as any);

          await uploadLocationImage({ locationId, formData }).unwrap();
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Don't show error to user, location is already created
        }
      }

      Alert.alert("สำเร็จ", "เพิ่มตำแหน่งใหม่เรียบร้อยแล้ว");
      resetForm();
      setSelectedImage(null);
      closeModal();
      refetch();
    } catch (error: any) {
      console.error("Error creating location:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      let errorMessage = "ไม่สามารถเพิ่มตำแหน่งได้";

      // Check for specific error types
      if (error?.data) {
        if (typeof error.data === "string") {
          errorMessage = error.data;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.title) {
          errorMessage = error.data.title;
        } else if (error.data.errors) {
          // Validation errors from .NET
          const validationErrors = Object.values(error.data.errors).flat();
          errorMessage = validationErrors.join("\n");
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 401) {
        errorMessage = "กรุณาเข้าสู่ระบบใหม่";
      } else if (error?.status === 400) {
        errorMessage = "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
      }

      Alert.alert("เกิดข้อผิดพลาด", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewMarkerPosition(null);
    setSelectedImage(null);
  };

  const handleMarkerPress = (location: any) => {
    setSelectedLocation(location);
    setShowDetailModal(true);
    setCurrentHighlightedId(location.locationId);
  };

  const handleEditLocation = () => {
    setIsEditMode(true);
    setShowDetailModal(false);
    setShowAddModal(true);
  };

  const handleUpdateLocation = async (
    values: typeof initialFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    if (!selectedLocation) return;

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("กรุณาเข้าสู่ระบบ", "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      setSubmitting(false);
      return;
    }

    try {
      await updateLocation({
        refId: selectedLocation.locationId,
        data: {
          locationName: values.locationName.trim(),
          description: values.description.trim() || undefined,
          locationType: values.locationType,
          address: values.address.trim() || undefined,
          phoneNumber: values.phoneNumber.trim() || undefined,
          iconColor: values.iconColor,
        },
      }).unwrap();

      // Upload image if selected
      if (selectedImage && selectedLocation.id) {
        try {
          const locationId = selectedLocation.id;
          const formData = new FormData();
          formData.append("file", {
            uri: selectedImage,
            type: "image/jpeg",
            name: `location-${locationId}-${Date.now()}.jpg`,
          } as any);

          await uploadLocationImage({ locationId, formData }).unwrap();
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Don't show error to user, location is already updated
        }
      }

      Alert.alert("สำเร็จ", "แก้ไขข้อมูลเรียบร้อยแล้ว");
      resetForm();
      setSelectedImage(null);
      closeEditModal();
      refetch();
    } catch (error: any) {
      console.error("Error updating location:", error);
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error?.data?.message || "ไม่สามารถแก้ไขข้อมูลได้"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLocation = () => {
    if (!selectedLocation) return;

    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบ "${selectedLocation.locationName}" ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLocation(selectedLocation.id).unwrap();
              Alert.alert("สำเร็จ", "ลบข้อมูลเรียบร้อยแล้ว");
              setShowDetailModal(false);
              setSelectedLocation(null);
              refetch();
            } catch (error: any) {
              console.error("Error deleting location:", error);
              Alert.alert(
                "เกิดข้อผิดพลาด",
                error?.data?.message || "ไม่สามารถลบข้อมูลได้"
              );
            }
          },
        },
      ]
    );
  };

  const closeEditModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setSelectedLocation(null);
    setSelectedImage(null);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLocation(null);
  };

  // ฟังก์ชันรีเซ็ตการซูมและแพน
  const resetMapView = () => {
    // Animate กลับไปที่ค่าเริ่มต้นพร้อมกัน
    scale.value = withTiming(1, { duration: 300 });
    translateX.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });

    // ล้าง selected location
    setCurrentHighlightedId(null);

    // อัปเดตค่า saved หลังจาก animation
    setTimeout(() => {
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }, 350);
  };

  // ฟังก์ชัน focus ไปที่ location ที่เลือก
  const focusOnHighlightedLocation = () => {
    if (!currentHighlightedId) return;

    const location = locations.find(
      (loc) => loc.locationId === currentHighlightedId
    );
    if (!location) return;

    const position = getMarkerPosition(location);

    // Calculate the center offset to move marker to center of screen
    const centerX = MAP_WIDTH / 2;
    const centerY = MAP_HEIGHT / 2;
    const offsetX = centerX - position.x;
    const offsetY = centerY - position.y;

    // Zoom in a bit (2x) and pan to center the location
    scale.value = withTiming(2, { duration: 500 });
    translateX.value = withTiming(offsetX * 2, { duration: 500 });
    translateY.value = withTiming(offsetY * 2, { duration: 500 });

    // Update saved values
    setTimeout(() => {
      savedScale.value = 2;
      savedTranslateX.value = offsetX * 2;
      savedTranslateY.value = offsetY * 2;
    }, 550);
  };

  const getMarkerColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "store":
        return "#4CAF50";
      case "pickup":
        return "#2196F3";
      case "farm":
        return "#8BC34A";
      case "warehouse":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "store":
        return "🏪";
      case "pickup":
        return "📦";
      case "farm":
        return "🌾";
      case "warehouse":
        return "🏭";
      default:
        return "📍";
    }
  };

  // Get icon component for marker
  const getMarkerIcon = (type: string) => {
    const iconSize = 20;
    const iconColor = "#FFFFFF";

    switch (type.toLowerCase()) {
      case "store":
        return (
          <MaterialCommunityIcons
            name="store"
            size={iconSize}
            color={iconColor}
          />
        );
      case "pickup":
        return (
          <MaterialCommunityIcons
            name="package-variant"
            size={iconSize}
            color={iconColor}
          />
        );
      case "farm":
        return (
          <MaterialCommunityIcons
            name="sprout"
            size={iconSize}
            color={iconColor}
          />
        );
      case "warehouse":
        return (
          <FontAwesome5 name="warehouse" size={iconSize} color={iconColor} />
        );
      default:
        return <Ionicons name="location" size={iconSize} color={iconColor} />;
    }
  };

  // แปลง latitude/longitude เป็นตำแหน่งบนหน้าจอ
  const getMarkerPosition = (location: any) => {
    const lat = Number(location.latitude);
    const lng = Number(location.longitude);

    const y = ((lat - 13.7563) / 0.2 + 0.5) * MAP_HEIGHT;
    const x = ((lng - 100.5018) / 0.2 + 0.5) * MAP_WIDTH;

    return { x, y };
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>กำลังโหลดแผนที่...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.mapContainer}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.mapWrapper, animatedStyle]}>
            <Image
              source={require("../../../assets/map.jpg")}
              style={styles.mapImage}
              resizeMode="cover"
            />

            {/* แสดงหมุดจากฐานข้อมูล */}
            {locations
              .filter(() => {
                return true;
              })
              .map((location) => {
                const position = getMarkerPosition(location);
                const isHighlighted =
                  currentHighlightedId &&
                  location.locationId === currentHighlightedId;
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
                      onPress={() => handleMarkerPress(location)}
                      activeOpacity={0.7}
                      style={styles.markerContent}
                    >
                      <View
                        style={[
                          styles.markerCircle,
                          isHighlighted && styles.markerCircleHighlighted,
                          {
                            backgroundColor:
                              location.iconColor ||
                              getMarkerColor(location.locationType),
                          },
                        ]}
                      >
                        {getMarkerIcon(location.locationType)}
                      </View>
                      <Text
                        style={[
                          styles.markerLabel,
                          isHighlighted && styles.markerLabelHighlighted,
                        ]}
                        numberOfLines={1}
                      >
                        {location.locationName}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}

            {/* แสดงหมุดชั่วคราวที่กำลังจะเพิ่ม */}
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
                  style={[styles.markerCircle, { backgroundColor: "#4CAF50" }]}
                >
                  <Ionicons name="location" size={20} color="#FFFFFF" />
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>

      {isAdmin && isAddMarkerMode && (
        <View style={styles.adminHint}>
          <Text style={styles.adminHintText}>
            📍 แตะบนแผนที่เพื่อปักหมุดตำแหน่ง
          </Text>
        </View>
      )}

      {/* Floating Action Button สำหรับ Admin เท่านั้น */}
      {isAdmin && (
        <FloatingActionButton
          visible={true}
          icon={isAddMarkerMode ? "eye" : "plus"}
          onPress={() => setIsAddMarkerMode(!isAddMarkerMode)}
          position="bottom-right"
        />
      )}

      {/* Floating Action Button สำหรับรีเซ็ต */}
      <FloatingActionButton
        visible={true}
        icon="refresh"
        iconColor="#333"
        backgroundColor="#FFD54F"
        onPress={resetMapView}
        position="bottom-right"
        style={{
          bottom: isAdmin ? 90 : 20,
        }}
      />

      {/* ปุ่มแสดงร้านค้าที่เลือก */}
      {currentHighlightedId && (
        <View style={styles.selectedLocationButton}>
          <TouchableOpacity
            style={styles.selectedLocationContent}
            onPress={focusOnHighlightedLocation}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.selectedLocationIcon,
                {
                  backgroundColor:
                    locations.find(
                      (loc) => loc.locationId === currentHighlightedId
                    )?.iconColor || "#4CAF50",
                },
              ]}
            >
              {getMarkerIcon(
                locations.find((loc) => loc.locationId === currentHighlightedId)
                  ?.locationType || "Store"
              )}
            </View>
            <Text style={styles.selectedLocationText} numberOfLines={1}>
              {locations.find((loc) => loc.locationId === currentHighlightedId)
                ?.locationName || "ร้าน..."}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectedLocationCloseButton}
            onPress={() => setCurrentHighlightedId(null)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal สำหรับแสดงรายละเอียด Location */}
      <LocationDetailModal
        visible={showDetailModal}
        location={selectedLocation}
        onClose={closeDetailModal}
        onEdit={
          isAdmin ||
          (selectedLocation?.sellerId &&
            selectedLocation?.sellerId === currentUserId)
            ? handleEditLocation
            : undefined
        }
        onDelete={
          isAdmin ||
          (selectedLocation?.sellerId &&
            selectedLocation?.sellerId === currentUserId)
            ? handleDeleteLocation
            : undefined
        }
        showActions={
          !!(
            isAdmin ||
            (selectedLocation?.sellerId &&
              selectedLocation?.sellerId === currentUserId)
          )
        }
      />

      {/* Modal สำหรับเพิ่ม/แก้ไขตำแหน่ง */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={isEditMode ? closeEditModal : closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Formik
              initialValues={
                isEditMode && selectedLocation
                  ? {
                      locationName: selectedLocation.locationName || "",
                      description: selectedLocation.description || "",
                      locationType: selectedLocation.locationType || "Store",
                      address: selectedLocation.address || "",
                      phoneNumber: selectedLocation.phoneNumber || "",
                      iconColor: selectedLocation.iconColor || "#4CAF50",
                    }
                  : initialFormValues
              }
              validationSchema={locationValidationSchema}
              onSubmit={
                isEditMode ? handleUpdateLocation : handleSubmitLocation
              }
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
                setFieldValue,
                isSubmitting,
              }) => (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>
                    {isEditMode ? "แก้ไขตำแหน่ง" : "เพิ่มตำแหน่งใหม่"}
                  </Text>

                  <Text style={styles.label}>ชื่อสถานที่ *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.locationName &&
                        errors.locationName &&
                        styles.inputError,
                    ]}
                    value={values.locationName}
                    onChangeText={handleChange("locationName")}
                    onBlur={handleBlur("locationName")}
                    placeholder="เช่น ร้าน June Store"
                  />
                  {touched.locationName && errors.locationName && (
                    <Text style={styles.errorText}>
                      {String(errors.locationName)}
                    </Text>
                  )}

                  <Text style={styles.label}>รายละเอียด</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      touched.description &&
                        errors.description &&
                        styles.inputError,
                    ]}
                    value={values.description}
                    onChangeText={handleChange("description")}
                    onBlur={handleBlur("description")}
                    placeholder="รายละเอียดเพิ่มเติม"
                    multiline
                    numberOfLines={3}
                  />
                  {touched.description && errors.description && (
                    <Text style={styles.errorText}>
                      {String(errors.description)}
                    </Text>
                  )}

                  <Text style={styles.label}>ประเภท</Text>
                  <View style={styles.typeSelector}>
                    {["Store", "Pickup", "Farm", "Warehouse"].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          values.locationType === type &&
                            styles.typeButtonActive,
                        ]}
                        onPress={() => setFieldValue("locationType", type)}
                      >
                        <Text
                          style={[
                            styles.typeButtonText,
                            values.locationType === type &&
                              styles.typeButtonTextActive,
                          ]}
                        >
                          {getLocationIcon(type)} {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {touched.locationType && errors.locationType && (
                    <Text style={styles.errorText}>
                      {String(errors.locationType)}
                    </Text>
                  )}

                  <Text style={styles.label}>ที่อยู่</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.address && errors.address && styles.inputError,
                    ]}
                    value={values.address}
                    onChangeText={handleChange("address")}
                    onBlur={handleBlur("address")}
                    placeholder="ที่อยู่"
                  />
                  {touched.address && errors.address && (
                    <Text style={styles.errorText}>
                      {String(errors.address)}
                    </Text>
                  )}

                  <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.phoneNumber &&
                        errors.phoneNumber &&
                        styles.inputError,
                    ]}
                    value={values.phoneNumber}
                    onChangeText={handleChange("phoneNumber")}
                    onBlur={handleBlur("phoneNumber")}
                    placeholder="เบอร์โทรศัพท์ (9-10 หลัก)"
                    keyboardType="phone-pad"
                  />
                  {touched.phoneNumber && errors.phoneNumber && (
                    <Text style={styles.errorText}>
                      {String(errors.phoneNumber)}
                    </Text>
                  )}

                  <Text style={styles.label}>สีหมุด</Text>
                  <View style={styles.colorSelector}>
                    {[
                      "#4CAF50",
                      "#2196F3",
                      "#8BC34A",
                      "#FF9800",
                      "#F44336",
                      "#9C27B0",
                    ].map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorButton,
                          { backgroundColor: color },
                          values.iconColor === color &&
                            styles.colorButtonActive,
                        ]}
                        onPress={() => setFieldValue("iconColor", color)}
                      />
                    ))}
                  </View>

                  <Text style={styles.label}>รูปภาพตำแหน่ง</Text>
                  <TouchableOpacity
                    style={styles.imagePickerContainer}
                    onPress={handleImagePick}
                  >
                    {selectedImage ? (
                      <Image
                        source={{ uri: selectedImage }}
                        style={styles.selectedImage}
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <MaterialCommunityIcons
                          name="image-plus"
                          size={40}
                          color="#999"
                        />
                        <Text style={styles.imagePlaceholderText}>
                          แตะเพื่อเลือกรูปภาพ
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={isEditMode ? closeEditModal : closeModal}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        styles.submitButton,
                        isSubmitting && styles.submitButtonDisabled,
                      ]}
                      onPress={() => handleSubmit()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          {isEditMode ? "บันทึกการแก้ไข" : "เพิ่มตำแหน่ง"}
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
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  mapWrapper: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },
  mapImage: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
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
  markerCircleHighlighted: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    transform: [{ scale: 1.2 }],
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
  markerLabelHighlighted: {
    backgroundColor: "#FFD700",
    fontSize: 13,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  selectedLocationButton: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    maxWidth: 200,
    overflow: "hidden",
  },
  selectedLocationContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    flex: 1,
  },
  selectedLocationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginRight: 8,
  },
  selectedLocationText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  selectedLocationCloseButton: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  adminHint: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  adminHintText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.85,
  },
  detailModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxHeight: height * 0.7,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  detailHeader: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 16,
    marginBottom: 16,
  },
  detailIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#F44336",
    borderWidth: 2,
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 5,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  typeButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  typeButtonText: {
    fontSize: 14,
    color: "#666",
  },
  typeButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  colorSelector: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  colorButtonActive: {
    borderColor: "#333",
    borderWidth: 3,
  },
  imagePickerContainer: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 10,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
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
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#999",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  submitButtonDisabled: {
    backgroundColor: "#A5D6A7",
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default MapScreen;
