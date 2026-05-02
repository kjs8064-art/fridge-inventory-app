import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function DashboardScreen() {
  const colors = useColors();
  const { data: foodItems = [] } = trpc.foodItems.list.useQuery();

  // 통계 계산
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const stats = {
    total: foodItems.length,
    normal: 0,
    warning: 0, // 3일 이내
    urgent: 0, // 만료됨
    categories: {} as Record<string, number>,
  };

  foodItems.forEach((item: any) => {
    const expDate = new Date(item.expirationDate);
    const expDateOnly = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
    const daysUntilExpiration = Math.ceil((expDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration <= 0) {
      stats.urgent++;
    } else if (daysUntilExpiration <= 3) {
      stats.warning++;
    } else {
      stats.normal++;
    }

    // 카테고리별 통계
    const category = item.category || "기타";
    stats.categories[category] = (stats.categories[category] || 0) + 1;
  });

  const StatCard = ({ icon, label, value, color }: any) => (
    <View className="flex-1 bg-surface rounded-lg p-4 items-center gap-2 border border-border">
      <MaterialIcons name={icon} size={32} color={color} />
      <Text className="text-xs text-muted">{label}</Text>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* 헤더 */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">대시보드</Text>
            <Text className="text-sm text-muted">식품 관리 현황을 한눈에 확인하세요</Text>
          </View>

          {/* 상태별 통계 */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">상태별 통계</Text>
            <View className="flex-row gap-2">
              <StatCard icon="check-circle" label="정상" value={stats.normal} color={colors.success} />
              <StatCard icon="warning" label="임박" value={stats.warning} color={colors.warning} />
              <StatCard icon="error" label="만료" value={stats.urgent} color={colors.error} />
            </View>
          </View>

          {/* 전체 통계 */}
          <View className="bg-primary/10 rounded-lg p-4 gap-2">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="inventory-2" size={24} color={colors.primary} />
              <Text className="text-lg font-semibold text-foreground">전체 식품</Text>
            </View>
            <Text className="text-3xl font-bold text-primary">{stats.total}개</Text>
          </View>

          {/* 카테고리별 통계 */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">카테고리별 분류</Text>
            <View className="bg-surface rounded-lg p-4 gap-3 border border-border">
              {Object.entries(stats.categories).length > 0 ? (
                Object.entries(stats.categories).map(([category, count]) => (
                  <View key={category} className="flex-row justify-between items-center pb-3 border-b border-border last:border-b-0 last:pb-0">
                    <Text className="text-base text-foreground font-medium">{category}</Text>
                    <View className="bg-primary/20 rounded-full px-3 py-1">
                      <Text className="text-sm font-semibold text-primary">{count}개</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-center text-muted py-4">등록된 식품이 없습니다</Text>
              )}
            </View>
          </View>

          {/* 팁 */}
          <View className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 gap-2">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground">팁</Text>
            </View>
            <Text className="text-xs text-muted leading-relaxed">
              만료 예정인 식품은 우선적으로 사용하세요. 정기적으로 냉장고를 확인하여 신선한 식품을 유지하세요.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
