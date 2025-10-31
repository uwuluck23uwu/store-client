import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useGetProductQuery } from "../../api/productApi";
import { useAddToCartMutation } from "../../api/cartApi";
import { useGetLocationsQuery } from "../../api/locationApi";
import {
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "../../api/reviewApi";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Review } from "../../types/api.types";
import { convertImageUrl } from "../../api/baseApi";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../theme";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { CategoryBadge } from "../../components/common/CategoryBadge";
import { StockBadge } from "../../components/common/StockBadge";
import { Section } from "../../components/common/Section";
import { QuantityControl } from "../../components/common/QuantityControl";
import { PrimaryButton } from "../../components/common/PrimaryButton";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ProductDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: productData, isLoading, isError } = useGetProductQuery(id);
  const product = productData?.data;

  const { data: locationsData } = useGetLocationsQuery();
  const locations = locationsData?.data || [];

  // Get seller info from product data
  const sellerName =
    product?.seller?.shopName ||
    product?.seller?.ownerName ||
    product?.sellerName ||
    "ไม่ระบุผู้ขาย";

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews,
  } = useGetProductReviewsQuery(id, {
    skip: !id, // Skip if no product id
  });
  const reviews = reviewsData?.data?.reviews ?? [];

  const [addToCart, { isLoading: addingToCart }] = useAddToCartMutation();
  const [createReview, { isLoading: creatingReview }] =
    useCreateReviewMutation();
  const [updateReview, { isLoading: updatingReview }] =
    useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert(
        "กรุณาเข้าสู่ระบบ",
        "คุณต้องเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า"
      );
      return;
    }

    if (!product) return;

    try {
      const result = await addToCart({
        productId: product.productId,
        quantity: quantity,
      }).unwrap();

      if (result.isSuccess) {
        Alert.alert("สำเร็จ", "เพิ่มสินค้าลงตะกร้าแล้ว", [
          { text: "ดูตะกร้า", onPress: () => navigation.navigate("Cart") },
          { text: "ตกลง" },
        ]);
      } else {
        Alert.alert("ไม่สำเร็จ", result.message);
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);
      console.error("Error data:", error.data);
      console.error("Error status:", error.status);

      let errorMessage = "ไม่สามารถเพิ่มสินค้าได้";

      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (typeof error.data === "string") {
        errorMessage = error.data;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status) {
        errorMessage = `ข้อผิดพลาด (${error.status})`;
      }

      Alert.alert("เกิดข้อผิดพลาด", errorMessage);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < (product.stock ?? 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนรีวิวสินค้า");
      return;
    }

    try {
      let result;

      if (editingReview) {
        // Update existing review
        result = await updateReview({
          reviewId: editingReview.reviewId,
          data: {
            rating,
            comment: comment.trim() || undefined,
          },
        }).unwrap();
      } else {
        // Create new review
        result = await createReview({
          productId: id,
          rating,
          comment: comment.trim() || undefined,
        }).unwrap();
      }

      if (result.isSuccess) {
        Alert.alert(
          "สำเร็จ",
          editingReview ? "แก้ไขรีวิวเรียบร้อยแล้ว" : "เพิ่มรีวิวเรียบร้อยแล้ว"
        );
        setShowReviewModal(false);
        setRating(5);
        setComment("");
        setEditingReview(null);
        await refetchReviews();
      } else {
        Alert.alert("ไม่สำเร็จ", result.message);
      }
    } catch (error: any) {
      console.log("Review error:", error);

      let errorMessage = editingReview
        ? "ไม่สามารถแก้ไขรีวิวได้"
        : "ไม่สามารถเพิ่มรีวิวได้";

      // Check for specific error messages from backend
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data) {
        // Handle string error response
        if (typeof error.data === "string") {
          errorMessage = error.data;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("เกิดข้อผิดพลาด", errorMessage);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment || "");
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    Alert.alert("ยืนยันการลบ", "คุณต้องการลบรีวิวนี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(reviewId).unwrap();
            await refetchReviews();
            Alert.alert("สำเร็จ", "ลบรีวิวเรียบร้อยแล้ว");
          } catch (error: any) {
            Alert.alert(
              "เกิดข้อผิดพลาด",
              error.data?.message || "ไม่สามารถลบรีวิวได้"
            );
          }
        },
      },
    ]);
  };

  // Find seller's store location
  const sellerLocation = locations.find(
    (loc) => loc.sellerId === product?.sellerId && loc.locationType === "Store"
  );

  if (isLoading) {
    return <LoadingState message="กำลังโหลดข้อมูลสินค้า..." />;
  }

  if (isError || !product) {
    return (
      <EmptyState
        icon="alert-circle"
        message="ไม่พบสินค้า"
        description="สินค้าที่คุณค้นหาไม่พบในระบบ"
      />
    );
  }

  // Get all product images
  const productImages = product.productImages && product.productImages.length > 0
    ? product.productImages.map((img: any) => convertImageUrl(img.imageUrl))
    : product.imageUrl
    ? [convertImageUrl(product.imageUrl)]
    : [];

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          {productImages.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const slideIndex = Math.round(
                    event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
                  );
                  setSelectedImageIndex(slideIndex);
                }}
                scrollEventThrottle={16}
              >
                {productImages.map((imageUrl: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: imageUrl }}
                    style={styles.productImage}
                  />
                ))}
              </ScrollView>

              {/* Image indicators */}
              {productImages.length > 1 && (
                <View style={styles.imageIndicators}>
                  {productImages.map((_: any, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        selectedImageIndex === index && styles.activeIndicator,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Image counter */}
              {productImages.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {selectedImageIndex + 1} / {productImages.length}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.productImage, styles.noImage]}>
              <Icon name="image-off" size={64} color={colors.textTertiary} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.productName}>
            {product.productName || "ไม่ระบุชื่อสินค้า"}
          </Text>

          <View style={styles.priceSection}>
            <PriceDisplay price={product.price || 0} size="large" />
            <Text style={styles.unit}>/{product.unit ?? "ชิ้น"}</Text>
          </View>

          <View style={styles.badges}>
            {product.categoryName && (
              <CategoryBadge category={product.categoryName} icon="tag" />
            )}
            {product.stock !== undefined && product.stock !== null && (
              <View style={{ marginLeft: spacing.sm }}>
                <StockBadge stock={product.stock} size="medium" />
              </View>
            )}
          </View>

          <Section noPadding>
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => {
                if (product.sellerId) {
                  navigation.navigate("StoreDetail", {
                    sellerId: product.sellerId,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <Icon name="store" size={20} color={colors.primary} />
              <Text
                style={[styles.infoText, { color: colors.primary, flex: 1 }]}
              >
                {sellerName}
              </Text>
              <Icon name="chevron-right" size={20} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <Icon
                name="package-variant"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>
                คงเหลือ: {product.stock ?? 0} {product.unit ?? "ชิ้น"}
              </Text>
            </View>

            {product.rating !== undefined && product.rating !== null && (
              <View style={styles.infoRow}>
                <Icon name="star" size={20} color={colors.rating} />
                <Text style={styles.infoText}>
                  {Number(product.rating).toFixed(1)}
                </Text>
              </View>
            )}
          </Section>

          <Section title="รายละเอียดสินค้า">
            <Text style={styles.description}>
              {product.description || "ไม่มีรายละเอียด"}
            </Text>
          </Section>

          {sellerLocation && (
            <Section title="ข้อมูลร้านค้า">
              <View style={styles.storeCard}>
                <View style={styles.storeHeader}>
                  <Icon name="store" size={24} color={colors.primary} />
                  <Text style={styles.storeName}>
                    {sellerLocation.locationName}
                  </Text>
                </View>
                {sellerLocation.description && (
                  <Text style={styles.storeDescription}>
                    {sellerLocation.description}
                  </Text>
                )}
                {sellerLocation.address && (
                  <View style={styles.storeRow}>
                    <Icon
                      name="map-marker"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.storeText}>
                      {sellerLocation.address}
                    </Text>
                  </View>
                )}
                {sellerLocation.phoneNumber && (
                  <View style={styles.storeRow}>
                    <Icon name="phone" size={16} color={colors.textSecondary} />
                    <Text style={styles.storeText}>
                      {sellerLocation.phoneNumber}
                    </Text>
                  </View>
                )}
                <View style={{ marginTop: spacing.sm }}>
                  <PrimaryButton
                    label="ดูบนแผนที่"
                    icon="map"
                    variant="secondary"
                    onPress={() => {
                      // Navigate to Map tab (nested navigation)
                      const rootNavigation = navigation
                        .getParent()
                        ?.getParent();
                      if (rootNavigation) {
                        rootNavigation.navigate("MainTabs", {
                          screen: "Map",
                          params: {
                            highlightLocationId: sellerLocation.locationId,
                          },
                        });
                      }
                    }}
                  />
                </View>
              </View>
            </Section>
          )}

          <Section title={`รีวิวสินค้า (${reviews.length})`}>
            {user ? (
              <PrimaryButton
                label="เขียนรีวิว"
                icon="comment-plus"
                variant="secondary"
                onPress={() => setShowReviewModal(true)}
              />
            ) : (
              <View style={styles.purchaseRequiredBox}>
                <Icon
                  name="information"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.purchaseRequiredText}>
                  กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว
                </Text>
              </View>
            )}

            {reviewsError ? (
              <Text style={styles.noReviewsText}>
                ระบบรีวิวยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง
              </Text>
            ) : reviewsLoading ? (
              <LoadingState message="กำลังโหลดรีวิว..." />
            ) : reviews.length === 0 ? (
              <Text style={styles.noReviewsText}>
                ยังไม่มีรีวิวสำหรับสินค้านี้
              </Text>
            ) : (
              reviews.map((review: Review) => (
                <View key={review.reviewId} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUser}>
                      {review.userImageUrl ? (
                        <Image
                          source={{ uri: convertImageUrl(review.userImageUrl) }}
                          style={styles.userAvatar}
                          defaultSource={require('../../../assets/icon.png')}
                        />
                      ) : (
                        <View
                          style={[
                            styles.userAvatar,
                            styles.userAvatarPlaceholder,
                          ]}
                        >
                          <Icon
                            name="account"
                            size={20}
                            color={colors.textTertiary}
                          />
                        </View>
                      )}
                      <Text style={styles.reviewUserName}>
                        {review.userName || "ผู้ใช้"}
                      </Text>
                    </View>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name={i < review.rating ? "star" : "star-outline"}
                          size={16}
                          color={colors.rating}
                        />
                      ))}
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString("th-TH")}
                  </Text>
                  {user && user.id === review.userId && (
                    <View style={styles.reviewActions}>
                      <TouchableOpacity
                        style={styles.editReviewButton}
                        onPress={() => handleEditReview(review)}
                      >
                        <Icon name="pencil" size={16} color={colors.primary} />
                        <Text style={styles.editReviewText}>แก้ไข</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteReviewButton}
                        onPress={() => handleDeleteReview(review.reviewId)}
                      >
                        <Icon name="delete" size={16} color={colors.error} />
                        <Text style={styles.deleteReviewText}>ลบ</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </Section>
        </View>
      </ScrollView>

      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
          setRating(5);
          setComment("");
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingReview ? "แก้ไขรีวิว" : "เขียนรีวิวสินค้า"}
            </Text>

            <Text style={styles.modalLabel}>คะแนน</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Icon
                    name={star <= rating ? "star" : "star-outline"}
                    size={36}
                    color={colors.rating}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>ความคิดเห็น (ไม่บังคับ)</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="แบ่งปันความคิดเห็นของคุณ..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowReviewModal(false);
                  setEditingReview(null);
                  setRating(5);
                  setComment("");
                }}
              >
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitReviewButton]}
                onPress={handleSubmitReview}
                disabled={creatingReview || updatingReview}
              >
                <Text style={styles.submitButtonText}>
                  {creatingReview || updatingReview
                    ? "กำลังบันทึก..."
                    : editingReview
                    ? "บันทึกการแก้ไข"
                    : "ส่งรีวิว"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {(product.stock ?? 0) > 0 && (
        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>จำนวน:</Text>
            <QuantityControl
              quantity={quantity}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              max={product.stock ?? 0}
            />
          </View>

          <PrimaryButton
            label="เพิ่มลงตะกร้า"
            icon="cart-plus"
            onPress={handleAddToCart}
            loading={addingToCart}
            disabled={addingToCart}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    backgroundColor: colors.surface,
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: colors.divider,
    resizeMode: "cover",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  imageCounter: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCounterText: {
    color: "#fff",
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  content: {
    padding: spacing.base,
  },
  productName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.base,
  },
  unit: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    padding: spacing.base,
    backgroundColor: colors.surface,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.base,
  },
  quantityLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  storeCard: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  storeName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  storeDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  storeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  noReviewsText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  reviewUser: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.divider,
  },
  userAvatarPlaceholder: {
    backgroundColor: colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewUserName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  reviewDate: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  reviewActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  editReviewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editReviewText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  deleteReviewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteReviewText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  ratingSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  submitReviewButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: "#FFFFFF",
  },
  purchaseRequiredBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  purchaseRequiredText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default ProductDetailScreen;
