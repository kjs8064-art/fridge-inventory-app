import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
// import AdMobBanner from "@/components/admob-banner"; // TODO: AdMob 계정 설정 후 활성화
/**
 * Home Screen - SnapStock 메인 화면
 * 
 * 주요 기능:
 * - 냉장고 재고 목록 표시
 * - 카메라 버튼으로 사진 촬영 및 AI 인식
 * - 식품 추가/삭제/수정
 * - 유통기한별 카테고리 표시
 * - AdMob 배너 광고 표시
 */
export default function HomeScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<"전체" | "정상" | "임박" | "만료">("전체");

  // 식품 목록 조회
  const { data: foodItems = [], isLoading, refetch } = trpc.foodItems.list.useQuery();

  // 식품 삭제
  const deleteMutation = trpc.foodItems.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });



  // 카테고리별 식품 필터링
  const getFilteredItems = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return foodItems.filter((item) => {
      if (!item.expirationDate) return false;
      
      const expDate = new Date(item.expirationDate);
      const expDateOnly = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
      const daysUntilExpiration = Math.ceil((expDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (selectedCategory === "정상") return daysUntilExpiration > 3;
      if (selectedCategory === "임박") return daysUntilExpiration > 0 && daysUntilExpiration <= 3;
      if (selectedCategory === "만료") return daysUntilExpiration <= 0;
      return true; // 전체
    });
  };

  const filteredItems = getFilteredItems();

  // 카테고리별 개수 계산
  const getCategoryCount = (category: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return foodItems.filter((item) => {
      if (!item.expirationDate) return false;
      
      const expDate = new Date(item.expirationDate);
      const expDateOnly = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
      const daysUntilExpiration = Math.ceil((expDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (category === "정상") return daysUntilExpiration > 3;
      if (category === "임박") return daysUntilExpiration > 0 && daysUntilExpiration <= 3;
      if (category === "만료") return daysUntilExpiration <= 0;
      return true;
    }).length;
  };

  const handleDeleteItem = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const renderFoodItem = ({ item }: { item: any }) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expDate = new Date(item.expirationDate);
    const expDateOnly = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
    const daysUntilExpiration = Math.ceil((expDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let statusColor = colors.success;
    let statusLabel = "정상";

    if (daysUntilExpiration <= 0) {
      statusColor = colors.error;
      statusLabel = "만료됨";
    } else if (daysUntilExpiration <= 3) {
      statusColor = colors.warning;
      statusLabel = `${daysUntilExpiration}일 남음`;
    }

    return (
      <View className="bg-surface rounded-lg p-4 mb-3 border border-border flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{item.productName}</Text>
          <Text className="text-sm text-muted mt-1">유통기한: {item.expirationDate}</Text>
          {item.quantity && (
            <Text className="text-sm text-muted">수량: {item.quantity}</Text>
          )}
          {item.notes && (
            <Text className="text-sm text-muted">{item.notes}</Text>
          )}
        </View>
        <View className="items-center gap-2">
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            <Text className="text-xs font-semibold" style={{ color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteItem(item.id)}
            className="p-2"
          >
            <MaterialIcons name="delete" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-0 flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="bg-primary px-6 py-6">
          <Text className="text-3xl font-bold text-background">SnapStock</Text>
          <Text className="text-sm text-background/80 mt-1">사진 한 장, 재고 완성</Text>
        </View>

        {/* 통계 카드 */}
        <View className="px-6 py-4 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-foreground">{foodItems.length}</Text>
              <Text className="text-xs text-muted mt-1">전체</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
              <Text className="text-2xl font-bold" style={{ color: colors.success }}>
                {getCategoryCount("정상")}
              </Text>
              <Text className="text-xs text-muted mt-1">정상</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
              <Text className="text-2xl font-bold" style={{ color: colors.warning }}>
                {getCategoryCount("임박")}
              </Text>
              <Text className="text-xs text-muted mt-1">임박</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
              <Text className="text-2xl font-bold" style={{ color: colors.error }}>
                {getCategoryCount("만료")}
              </Text>
              <Text className="text-xs text-muted mt-1">만료</Text>
            </View>
          </View>
        </View>

        {/* 카테고리 필터 */}
        <View className="px-6 py-2 gap-2">
          <View className="flex-row gap-2">
            {(["전체", "정상", "임박", "만료"] as const).map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedCategory === category
                      ? "text-background"
                      : "text-foreground"
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 식품 목록 */}
        <View className="px-6 py-4 flex-1">
          {isLoading ? (
            <View className="items-center justify-center py-8">
              <Text className="text-muted">로딩 중...</Text>
            </View>
          ) : filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              renderItem={renderFoodItem}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          ) : (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="inbox" size={48} color={colors.muted} />
              <Text className="text-foreground font-semibold mt-4">식품이 없습니다</Text>
              <Text className="text-muted text-sm mt-2">카메라로 사진을 촬영해 추가하세요</Text>
            </View>
          )}
        </View>

        {/* 배너 광고 - TODO: AdMob 계정 설정 후 활성화 */}
        {/* <AdMobBanner position="bottom" size="smartBannerPortrait" /> */}
      </ScrollView>

      {/* 플로팅 카메라 버튼 */}
      <View className="absolute bottom-24 right-6">
        <TouchableOpacity
          onPress={() => router.push("/camera")}
          className="w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg"
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
