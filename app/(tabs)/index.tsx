import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function HomeScreen() {
  const colors = useColors();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "normal" | "warning" | "expired">("all");

  // Fetch food items - 모든 사용자 접근 가능
  const { data: foodItems = [], isLoading: itemsLoading, refetch } = trpc.foodItems.list.useQuery(
    undefined,
    {
      enabled: true, // 항상 활성화
    }
  );

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
    return `${daysLeft}일 남음`;
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

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View className="bg-primary px-6 py-4">
        <Text className="text-2xl font-bold text-background">FreshTrack</Text>
        <Text className="text-sm text-background opacity-80">냉장고 관리를 쉽게</Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-6 py-4 gap-2 border-b border-border">
        <TouchableOpacity
          onPress={() => setSelectedFilter("all")}
          className={`px-4 py-2 rounded-full ${selectedFilter === "all" ? "bg-primary" : "bg-surface"}`}
        >
          <Text className={`text-sm font-semibold ${selectedFilter === "all" ? "text-background" : "text-foreground"}`}>
            전체
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedFilter("normal")}
          className={`px-4 py-2 rounded-full ${selectedFilter === "normal" ? "bg-success" : "bg-surface"}`}
        >
          <Text className={`text-sm font-semibold ${selectedFilter === "normal" ? "text-background" : "text-foreground"}`}>
            정상
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedFilter("warning")}
          className={`px-4 py-2 rounded-full ${selectedFilter === "warning" ? "bg-warning" : "bg-surface"}`}
        >
          <Text className={`text-sm font-semibold ${selectedFilter === "warning" ? "text-background" : "text-foreground"}`}>
            임박
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedFilter("expired")}
          className={`px-4 py-2 rounded-full ${selectedFilter === "expired" ? "bg-error" : "bg-surface"}`}
        >
          <Text className={`text-sm font-semibold ${selectedFilter === "expired" ? "text-background" : "text-foreground"}`}>
            만료
          </Text>
        </TouchableOpacity>
      </View>

      {/* Food Items List */}
      {itemsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="inbox" size={48} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4">식품이 없습니다</Text>
          <Text className="text-sm text-muted text-center mt-2">
            아래의 카메라 버튼을 눌러 새로운 식품을 추가해보세요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const daysLeft = getDaysUntilExpiration(item.expirationDate);
            const statusColor = getStatusColor(daysLeft);
            const statusLabel = getStatusLabel(daysLeft);

            return (
              <TouchableOpacity
                onPress={() => {}}
                className="flex-row bg-surface rounded-lg p-4 border border-border"
              >
                {/* Image Placeholder */}
                <View className="w-20 h-20 bg-muted rounded-lg mr-4 items-center justify-center">
                  {item.imageUrl ? (
                    <Text className="text-xs text-background">이미지</Text>
                  ) : (
                    <MaterialIcons name="image" size={32} color={colors.foreground} />
                  )}
                </View>

                {/* Content */}
                <View className="flex-1 justify-center">
                  <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    {item.category || "분류 없음"}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: statusColor }}
                    />
                    <Text className="text-sm font-semibold" style={{ color: statusColor }}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                {/* Right Arrow */}
                <View className="justify-center">
                  <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/camera")}
      >
        <MaterialIcons name="add-a-photo" size={28} color={colors.background} />
      </TouchableOpacity>
    </ScreenContainer>
  );
}
