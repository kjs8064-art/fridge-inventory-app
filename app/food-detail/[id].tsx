import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Image, Modal, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function FoodDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form states
  const [editProductName, setEditProductName] = useState("");
  const [editExpirationDate, setEditExpirationDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const foodItemId = typeof id === "string" ? parseInt(id) : 0;

  // Fetch food item details
  const { data: foodItem, isLoading, refetch } = trpc.foodItems.get.useQuery(
    { id: foodItemId },
    { enabled: foodItemId > 0 }
  );

  // Update mutation
  const updateMutation = trpc.foodItems.update.useMutation({
    onSuccess: () => {
      Alert.alert("저장 완료", "식품 정보가 저장되었습니다.");
      setIsSaving(false);
      setIsEditMode(false);
      refetch();
    },
    onError: (error) => {
      Alert.alert("오류", "저장에 실패했습니다: " + error.message);
      setIsSaving(false);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.foodItems.delete.useMutation({
    onSuccess: () => {
      Alert.alert("삭제 완료", "식품이 삭제되었습니다.");
      router.back();
    },
    onError: (error) => {
      Alert.alert("오류", "삭제에 실패했습니다: " + error.message);
    },
  });

  // Initialize edit form when food item loads
  useEffect(() => {
    if (foodItem) {
      setEditProductName(foodItem.productName || "");
      setEditExpirationDate(formatDateForInput(foodItem.expirationDate));
      setEditCategory(foodItem.category || "");
      setEditQuantity(foodItem.quantity || "");
      setEditNotes(foodItem.notes || "");
    }
  }, [foodItem]);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: any): string => {
    if (!date) return "";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  // Format date for display (한국어)
  const formatDateForDisplay = (date: any): string => {
    if (!date) return "미지정";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return "미지정";
      return d.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "미지정";
    }
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = (expirationDate: any): number => {
    try {
      const expDate = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate;
      if (isNaN(expDate.getTime())) return 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 0;
    }
  };

  const handleSaveChanges = () => {
    if (!editProductName.trim()) {
      Alert.alert("입력 필요", "제품명을 입력해주세요.");
      return;
    }

    if (!editExpirationDate) {
      Alert.alert("입력 필요", "유통기한을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    updateMutation.mutate({
      id: foodItemId,
      productName: editProductName.trim(),
      expirationDate: editExpirationDate,
      category: editCategory.trim() || undefined,
      quantity: editQuantity.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
  };

  const handleDeleteItem = () => {
    Alert.alert(
      "삭제 확인",
      "이 식품을 정말 삭제하시겠습니까?",
      [
        { text: "취소", onPress: () => {}, style: "cancel" },
        {
          text: "삭제",
          onPress: () => {
            deleteMutation.mutate({ id: foodItemId });
          },
          style: "destructive",
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <MaterialIcons name="hourglass-empty" size={40} color={colors.muted} />
        <Text className="text-muted mt-2">로딩 중...</Text>
      </ScreenContainer>
    );
  }

  if (!foodItem) {
    return (
      <ScreenContainer className="items-center justify-center">
        <MaterialIcons name="error" size={40} color={colors.error} />
        <Text className="text-error mt-2">식품을 찾을 수 없습니다</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-semibold">돌아가기</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const daysLeft = getDaysUntilExpiration(foodItem.expirationDate);
  const formattedDate = formatDateForDisplay(foodItem.expirationDate);

  let statusColor = colors.success;
  let statusLabel = "정상";
  if (daysLeft < 0) {
    statusColor = colors.error;
    statusLabel = "만료됨";
  } else if (daysLeft < 3) {
    statusColor = colors.error;
    statusLabel = "긴급";
  } else if (daysLeft < 7) {
    statusColor = colors.warning;
    statusLabel = "임박";
  }

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View className="bg-primary px-4 py-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <MaterialIcons name="arrow-back" size={24} color={colors.background} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-background flex-1 ml-2">
          {isEditMode ? "정보 수정" : "상세 정보"}
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (isEditMode) {
              setIsEditMode(false);
            } else {
              setIsEditMode(true);
            }
          }}
          className="p-2"
        >
          <MaterialIcons
            name={isEditMode ? "close" : "edit"}
            size={24}
            color={colors.background}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Product Image */}
        {foodItem.imageUrl && (
          <View className="mb-4 rounded-lg overflow-hidden border border-border">
            <Image
              source={{ uri: foodItem.imageUrl }}
              style={{ width: "100%", height: 250 }}
              resizeMode="cover"
            />
          </View>
        )}

        {isEditMode ? (
          // Edit Mode
          <View className="gap-4 mb-4">
            {/* Product Name */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">제품명 *</Text>
              <TextInput
                value={editProductName}
                onChangeText={setEditProductName}
                placeholder="제품명을 입력하세요"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>

            {/* Expiration Date */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">유통기한 * (YYYY-MM-DD)</Text>
              <TextInput
                value={editExpirationDate}
                onChangeText={setEditExpirationDate}
                placeholder="2025-05-01"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>

            {/* Category */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">분류</Text>
              <TextInput
                value={editCategory}
                onChangeText={setEditCategory}
                placeholder="채소, 과일, 유제품 등"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>

            {/* Quantity */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">수량</Text>
              <TextInput
                value={editQuantity}
                onChangeText={setEditQuantity}
                placeholder="1개, 500ml 등"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>

            {/* Notes */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">메모</Text>
              <TextInput
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="식품에 대한 메모를 입력하세요..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
                style={{ textAlignVertical: "top", color: colors.foreground }}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveChanges}
              disabled={isSaving}
              className="bg-primary rounded-lg py-3 items-center"
            >
              <Text className="text-background font-semibold">
                {isSaving ? "저장 중..." : "저장"}
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={handleDeleteItem}
              className="bg-error/20 rounded-lg py-3 items-center border border-error"
            >
              <Text className="text-error font-semibold">삭제</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // View Mode
          <>
            {/* Product Info Card */}
            <View className="bg-surface rounded-lg p-4 border border-border mb-4">
              <Text className="text-2xl font-bold text-foreground mb-3">{foodItem.productName}</Text>

              {/* Status Badge */}
              <View className="flex-row items-center gap-2 mb-4">
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: statusColor + "20" }}
                >
                  <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                    {statusLabel}
                  </Text>
                </View>
                <Text className="text-sm text-muted">{daysLeft}일 남음</Text>
              </View>

              {/* Details Grid */}
              <View className="gap-3">
                {/* Expiration Date */}
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                  <View className="flex-1">
                    <Text className="text-xs text-muted">유통기한</Text>
                    <Text className="text-sm font-semibold text-foreground">{formattedDate}</Text>
                  </View>
                </View>

                {/* Category */}
                {foodItem.category && (
                  <View className="flex-row items-center gap-3">
                    <MaterialIcons name="local-offer" size={20} color={colors.primary} />
                    <View className="flex-1">
                      <Text className="text-xs text-muted">분류</Text>
                      <Text className="text-sm font-semibold text-foreground">{foodItem.category}</Text>
                    </View>
                  </View>
                )}

                {/* Quantity */}
                {foodItem.quantity && (
                  <View className="flex-row items-center gap-3">
                    <MaterialIcons name="inventory-2" size={20} color={colors.primary} />
                    <View className="flex-1">
                      <Text className="text-xs text-muted">수량</Text>
                      <Text className="text-sm font-semibold text-foreground">{foodItem.quantity}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Notes Section */}
            {foodItem.notes && (
              <View className="mb-4">
                <Text className="text-base font-semibold text-foreground mb-2">메모</Text>
                <View className="bg-surface border border-border rounded-lg p-3">
                  <Text className="text-sm text-foreground">{foodItem.notes}</Text>
                </View>
              </View>
            )}

            {/* Delete Button */}
            <TouchableOpacity
              onPress={handleDeleteItem}
              className="bg-error/20 rounded-lg py-3 items-center border border-error mb-4"
            >
              <Text className="text-error font-semibold">삭제</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
