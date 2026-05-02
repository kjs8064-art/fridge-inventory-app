import { ScrollView, Text, View, TouchableOpacity, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function HomeScreen() {
  const colors = useColors();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "normal" | "warning" | "expired">("all");

  // Fetch food items
  const { data: foodItems = [], isLoading: itemsLoading, refetch } = trpc.foodItems.list.useQuery(
    undefined,
    {
      enabled: true,
    }
  );

  // Update mutation
  const updateMutation = trpc.foodItems.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    refetch();
  }, []);

  // Calculate days until expiration
  const getDaysUntilExpiration = (expirationDate: Date | string) => {
    const expDate = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get status color
  const getStatusColor = (daysLeft: number) => {
    if (daysLeft >= 7) return colors.success;
    if (daysLeft >= 3) return colors.warning;
    return colors.error;
  };

  // Get status label
  const getStatusLabel = (daysLeft: number) => {
    if (daysLeft < 0) return "만료됨";
    if (daysLeft === 0) return "오늘";
    if (daysLeft === 1) return "내일";
    return `${daysLeft}일`;
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: number, currentQuantity: string | null, delta: number) => {
    const current = parseInt(currentQuantity || "0") || 0;
    const newQuantity = Math.max(0, current + delta);
    
    updateMutation.mutate({
      id: itemId,
      quantity: newQuantity.toString(),
    });
  };

  // Filter items
  const filteredItems = foodItems.filter((item) => {
    const daysLeft = getDaysUntilExpiration(item.expirationDate);
    if (selectedFilter === "all") return true;
    if (selectedFilter === "normal") return daysLeft >= 7;
    if (selectedFilter === "warning") return daysLeft >= 3 && daysLeft < 7;
    if (selectedFilter === "expired") return daysLeft < 3;
    return true;
  });

  // Get stats
  const stats = {
    total: foodItems.length,
    normal: foodItems.filter((item) => getDaysUntilExpiration(item.expirationDate) >= 7).length,
    warning: foodItems.filter((item) => {
      const days = getDaysUntilExpiration(item.expirationDate);
      return days >= 3 && days < 7;
    }).length,
    expired: foodItems.filter((item) => getDaysUntilExpiration(item.expirationDate) < 3).length,
  };

  const handleDeleteItem = (id: number) => {
    Alert.alert("삭제 확인", "이 식품을 삭제하시겠습니까?", [
      { text: "취소", onPress: () => {}, style: "cancel" },
      {
        text: "삭제",
        onPress: () => {
          // TODO: Implement delete mutation
          refetch();
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenContainer className="p-0">
      {/* Premium Header - Hot Pink */}
      <View className="bg-primary px-6 py-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-background">SnapStock</Text>
            <Text className="text-sm text-background opacity-80 mt-1">사진 한 장, 재고 완성</Text>
          </View>
          <View className="bg-background opacity-20 rounded-full p-3">
            <MaterialIcons name="camera-alt" size={24} color={colors.background} />
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-background opacity-15 rounded-lg p-3">
            <Text className="text-xs text-background opacity-70">전체</Text>
            <Text className="text-xl font-bold text-background mt-1">{stats.total}</Text>
          </View>
          <View className="flex-1 bg-background opacity-15 rounded-lg p-3">
            <Text className="text-xs text-background opacity-70">임박</Text>
            <Text className="text-xl font-bold text-background mt-1">{stats.warning}</Text>
          </View>
          <View className="flex-1 bg-background opacity-15 rounded-lg p-3">
            <Text className="text-xs text-background opacity-70">만료</Text>
            <Text className="text-xl font-bold text-background mt-1">{stats.expired}</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 py-4 gap-2 border-b border-border">
        {[
          { key: "all", label: "전체" },
          { key: "normal", label: "정상" },
          { key: "warning", label: "임박" },
          { key: "expired", label: "만료" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setSelectedFilter(filter.key as any)}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === filter.key
                ? "bg-primary"
                : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedFilter === filter.key ? "text-background" : "text-foreground"
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Food Items List */}
      <ScrollView className="flex-1 px-4 py-4">
        {itemsLoading ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="hourglass-empty" size={40} color={colors.muted} />
            <Text className="text-muted mt-2">로딩 중...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="inbox" size={48} color={colors.muted} />
            <Text className="text-lg font-semibold text-foreground mt-4">식품이 없습니다</Text>
            <Text className="text-muted text-center mt-2">
              카메라 버튼을 눌러 사진을 찍으면{"\n"}자동으로 식품이 등록됩니다
            </Text>
          </View>
        ) : (
          <View className="gap-3 pb-6">
            {filteredItems.map((item) => {
              const daysLeft = getDaysUntilExpiration(item.expirationDate);
              const statusColor = getStatusColor(daysLeft);
              const statusLabel = getStatusLabel(daysLeft);
              const quantity = parseInt(item.quantity || "0") || 0;

              return (
                <View
                  key={item.id}
                  className="bg-surface rounded-lg p-4 border border-border"
                >
                  {/* Top Row: Product Name and Delete */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{item.productName}</Text>
                      <View className="flex-row items-center gap-2 mt-2">
                        <View
                          className="rounded-full px-3 py-1"
                          style={{ backgroundColor: statusColor + "20" }}
                        >
                          <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                            {statusLabel}
                          </Text>
                        </View>
                        <Text className="text-xs text-muted">{item.category}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item.id)}
                      className="p-2"
                    >
                      <MaterialIcons name="close" size={20} color={colors.muted} />
                    </TouchableOpacity>
                  </View>

                  {/* Bottom Row: Quantity Controls */}
                  <View className="flex-row items-center justify-between bg-background rounded-lg p-3 border border-border">
                    <Text className="text-xs text-muted">수량</Text>
                    
                    <View className="flex-row items-center gap-3">
                      {/* Minus Button */}
                      <TouchableOpacity
                        onPress={() => handleQuantityChange(item.id, item.quantity || "0", -1)}
                        className="bg-primary rounded-full p-2"
                        disabled={updateMutation.isPending}
                      >
                        <MaterialIcons name="remove" size={16} color={colors.background} />
                      </TouchableOpacity>

                      {/* Quantity Display */}
                      <View className="min-w-12 items-center">
                        <Text className="text-lg font-bold text-foreground">{quantity}</Text>
                      </View>

                      {/* Plus Button */}
                      <TouchableOpacity
                        onPress={() => handleQuantityChange(item.id, item.quantity || "0", 1)}
                        className="bg-primary rounded-full p-2"
                        disabled={updateMutation.isPending}
                      >
                        <MaterialIcons name="add" size={16} color={colors.background} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Camera Button - Hot Pink */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          onPress={() => router.push("/camera")}
          className="bg-primary rounded-full p-5 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <MaterialIcons name="camera-alt" size={28} color={colors.background} />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
