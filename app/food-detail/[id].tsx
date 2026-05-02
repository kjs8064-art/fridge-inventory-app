import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function FoodDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const foodItemId = typeof id === "string" ? parseInt(id) : 0;

  // Fetch food item details
  const { data: foodItem, isLoading } = trpc.foodItems.get.useQuery(
    { id: foodItemId },
    { enabled: foodItemId > 0 }
  );

  // Update mutation
  const updateMutation = trpc.foodItems.update.useMutation({
    onSuccess: () => {
      Alert.alert("저장 완료", "메모가 저장되었습니다.");
      setIsSaving(false);
    },
    onError: () => {
      Alert.alert("오류", "메모 저장에 실패했습니다.");
      setIsSaving(false);
    },
  });

  useEffect(() => {
    if (foodItem?.notes) {
      setNotes(foodItem.notes || "");
    }
  }, [foodItem]);

  const handleSaveNotes = () => {
    if (!foodItem) return;
    setIsSaving(true);
    updateMutation.mutate({
      id: foodItem.id,
      notes,
    });
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = (expirationDate: Date | string) => {
    const expDate = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
  const expirationDate = new Date(foodItem.expirationDate);
  const formattedDate = expirationDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        <Text className="text-lg font-bold text-background flex-1 ml-2">상세 정보</Text>
        <View className="w-8" />
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
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="local-offer" size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-xs text-muted">분류</Text>
                <Text className="text-sm font-semibold text-foreground">{foodItem.category || "미지정"}</Text>
              </View>
            </View>

            {/* Quantity */}
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="inventory-2" size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-xs text-muted">수량</Text>
                <Text className="text-sm font-semibold text-foreground">{foodItem.quantity || "1"}개</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-foreground mb-2">메모</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="식품에 대한 메모를 입력하세요..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            className="bg-surface border border-border rounded-lg p-3 text-foreground"
            style={{ textAlignVertical: "top" }}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSaveNotes}
          disabled={isSaving}
          className="bg-primary rounded-lg py-3 items-center mb-4"
        >
          <Text className="text-background font-semibold">
            {isSaving ? "저장 중..." : "메모 저장"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
