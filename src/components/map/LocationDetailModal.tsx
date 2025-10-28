import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { API_BASE_URL } from "../../api/baseApi";

const { width, height } = Dimensions.get("window");

interface LocationDetailModalProps {
  visible: boolean;
  location: any | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  visible,
  location,
  onClose,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  if (!location) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.detailModalContainer}>
        <View style={styles.detailModalContent}>
          <TouchableOpacity style={styles.detailCloseButton} onPress={onClose}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Location Image */}
            {location.imageUrl ? (
              <Image
                source={{
                  uri: location.imageUrl.startsWith("http")
                    ? location.imageUrl
                    : `${API_BASE_URL}${location.imageUrl}`,
                }}
                style={styles.detailLocationImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.detailLocationImagePlaceholder}>
                <Icon name="store" size={80} color="#ccc" />
              </View>
            )}

            {/* Location Info */}
            <View style={styles.detailInfoContainer}>
              <View style={styles.detailHeaderRow}>
                <Icon
                  name="store"
                  size={28}
                  color={location.iconColor || "#FF9800"}
                />
                <Text style={styles.detailLocationName}>
                  {location.locationName}
                </Text>
              </View>

              {location.sellerName && (
                <View style={styles.detailRow}>
                  <Icon name="account-circle" size={20} color="#666" />
                  <Text style={styles.detailLabel}>ผู้ประกอบการ:</Text>
                  <Text style={styles.detailValue}>{location.sellerName}</Text>
                </View>
              )}

              {location.locationType && (
                <View style={styles.detailRow}>
                  <Icon name="map-marker" size={20} color="#666" />
                  <Text style={styles.detailLabel}>ประเภท:</Text>
                  <Text style={styles.detailValue}>
                    {location.locationType}
                  </Text>
                </View>
              )}

              {location.description && (
                <View style={styles.detailRow}>
                  <Icon name="text" size={20} color="#666" />
                  <Text style={styles.detailLabel}>รายละเอียด:</Text>
                  <Text style={styles.detailValue}>{location.description}</Text>
                </View>
              )}

              {location.address && (
                <View style={styles.detailRow}>
                  <Icon name="home-map-marker" size={20} color="#666" />
                  <Text style={styles.detailLabel}>ที่อยู่:</Text>
                  <Text style={styles.detailValue}>{location.address}</Text>
                </View>
              )}

              {location.phoneNumber && (
                <View style={styles.detailRow}>
                  <Icon name="phone" size={20} color="#666" />
                  <Text style={styles.detailLabel}>เบอร์โทรศัพท์:</Text>
                  <Text style={styles.detailValue}>{location.phoneNumber}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.detailActionButtons}>
                {showActions && (
                  <>
                    {onDelete && (
                      <TouchableOpacity
                        style={styles.detailDeleteBtn}
                        onPress={onDelete}
                      >
                        <Text style={styles.detailDeleteBtnText}>ลบ</Text>
                      </TouchableOpacity>
                    )}
                    {onEdit && (
                      <TouchableOpacity
                        style={styles.detailEditBtn}
                        onPress={onEdit}
                      >
                        <Text style={styles.detailEditBtnText}>แก้ไข</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  detailModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  detailModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  detailCloseButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
  },
  detailLocationImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#f0f0f0",
  },
  detailLocationImagePlaceholder: {
    width: "100%",
    height: 250,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  detailInfoContainer: {
    padding: 20,
  },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  detailLocationName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginRight: 5,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  detailActionButtons: {
    marginTop: 20,
    gap: 10,
    flexDirection: "row",
  },
  detailDeleteBtn: {
    backgroundColor: "#F44336",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  detailDeleteBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  detailEditBtn: {
    backgroundColor: "#FF9800",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  detailEditBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LocationDetailModal;
