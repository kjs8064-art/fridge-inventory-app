import { ScrollView, Text, View, TouchableOpacity, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function SettingsScreen() {
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();

  const isDarkMode = colorScheme === "dark";

  const SettingItem = ({ icon, label, value, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-surface rounded-lg p-4 border border-border mb-2"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <MaterialIcons name={icon} size={24} color={colors.primary} />
        <Text className="text-base font-medium text-foreground">{label}</Text>
      </View>
      <View>{value}</View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* 헤더 */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">설정</Text>
            <Text className="text-sm text-muted">앱 설정을 관리하세요</Text>
          </View>

          {/* 테마 설정 */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">테마</Text>
            <SettingItem
              icon={isDarkMode ? "dark-mode" : "light-mode"}
              label="다크모드"
              value={
                <Switch
                  value={isDarkMode}
                  onValueChange={(value) => {
                    setColorScheme(value ? "dark" : "light");
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={isDarkMode ? colors.primary : colors.surface}
                />
              }
            />
          </View>

          {/* 정보 */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">정보</Text>
            <View className="bg-surface rounded-lg p-4 border border-border gap-3">
              <View className="flex-row justify-between items-center pb-3 border-b border-border">
                <Text className="text-base text-foreground">앱 이름</Text>
                <Text className="text-sm text-muted">SnapStock</Text>
              </View>
              <View className="flex-row justify-between items-center pb-3 border-b border-border">
                <Text className="text-base text-foreground">버전</Text>
                <Text className="text-sm text-muted">1.0.0</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-foreground">개발사</Text>
                <Text className="text-sm text-muted">SnapStock Team</Text>
              </View>
            </View>
          </View>

          {/* 팁 */}
          <View className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 gap-2">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground">팁</Text>
            </View>
            <Text className="text-xs text-muted leading-relaxed">
              다크모드는 저장되어 앱을 재시작해도 유지됩니다. 눈 건강을 위해 야간에는 다크모드 사용을 권장합니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
