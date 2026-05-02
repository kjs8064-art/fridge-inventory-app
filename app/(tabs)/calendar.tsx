import { ScrollView, Text, View, TouchableOpacity, Modal, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Calendar } from "react-native-calendars";
import { useState, useMemo } from "react";
import { router } from "expo-router";
import { isHoliday, isWeekend } from "@/lib/korean-holidays";

export default function CalendarScreen() {
  const colors = useColors();
  const { data: foodItems = [] } = trpc.foodItems.list.useQuery();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // 식품 삭제
  const deleteMutation = trpc.foodItems.delete.useMutation({
    onSuccess: () => {},
  });

  // 캘린더 마킹 생성 (유통기한별로 표시)
  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    foodItems.forEach((item: any) => {
      const expDate = new Date(item.expirationDate);
      const expDateOnly = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
      const dateStr = expDateOnly.toISOString().split("T")[0];
      const daysUntilExpiration = Math.ceil((expDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let color = colors.success;
      let textColor = "white";

      if (daysUntilExpiration <= 0) {
        color = colors.error;
      } else if (daysUntilExpiration <= 3) {
        color = colors.warning;
      }

      if (!marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
          dotColor: color,
          customStyles: {
            container: {
              backgroundColor: color,
              borderRadius: 50,
            },
            text: {
              color: textColor,
              fontWeight: "bold",
            },
          },
        };
      }
    });

    // 선택된 날짜 표시
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: "white",
      };
    }

    return marked;
  }, [foodItems, selectedDate, colors]);

  // 선택된 날짜의 식품 목록
  const selectedDateFoods = useMemo(() => {
    return foodItems.filter((item: any) => {
      const expDate = new Date(item.expirationDate);
      const expDateOnly = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
      const dateStr = expDateOnly.toISOString().split("T")[0];
      return dateStr === selectedDate;
    });
  }, [foodItems, selectedDate]);

  // 선택된 날짜의 정보
  const selectedDateInfo = useMemo(() => {
    const holiday = isHoliday(selectedDate);
    const weekend = isWeekend(selectedDate);
    const date = new Date(selectedDate);
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

    let dateLabel = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${dayOfWeek})`;
    let dateType = "평일";
    let dateTypeColor = colors.foreground;

    if (holiday) {
      dateType = holiday.name;
      dateTypeColor = colors.error;
    } else if (weekend) {
      dateType = date.getDay() === 0 ? "일요일" : "토요일";
      dateTypeColor = colors.error;
    }

    return { dateLabel, dateType, dateTypeColor };
  }, [selectedDate, colors]);

  const handleDeleteItem = (id: number) => {
    Alert.alert("삭제 확인", "이 식품을 삭제하시겠습니까?", [
      { text: "취소", onPress: () => {} },
      {
        text: "삭제",
        onPress: () => {
          deleteMutation.mutate({ id });
        },
        style: "destructive",
      },
    ]);
  };

  const handleEditItem = (id: number) => {
    router.push(`/food-detail/${id}`);
  };

  const FoodItemCard = ({ item }: any) => {
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
    } else {
      statusLabel = `${daysUntilExpiration}일 남음`;
    }

    return (
      <TouchableOpacity
        onPress={() => handleEditItem(item.id)}
        className="bg-surface rounded-lg p-4 mb-3 border border-border"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">{item.productName}</Text>
            <Text className="text-xs text-muted mt-1">{item.category}</Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: statusColor + "20" }}
          >
            <Text className="text-xs font-semibold" style={{ color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="calendar-today" size={16} color={colors.muted} />
            <Text className="text-sm text-muted">{item.expirationDate}</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleEditItem(item.id)}
              className="p-2"
            >
              <MaterialIcons name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteItem(item.id)}
              className="p-2"
            >
              <MaterialIcons name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* 헤더 */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">캘린더</Text>
            <Text className="text-sm text-muted">유통기한을 한눈에 확인하세요</Text>
          </View>

          {/* 캘린더 */}
          <View className="bg-surface rounded-lg p-4 border border-border overflow-hidden">
            <Calendar
              current={selectedDate}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
              }}
              markedDates={markedDates}
              markingType="dot"
              monthFormat={"yyyy년 MMMM"}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.foreground,
                textSectionTitleDisabledColor: colors.muted,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: "white",
                todayTextColor: colors.primary,
                dayTextColor: colors.foreground,
                textDisabledColor: colors.muted,
                dotColor: colors.primary,
                selectedDotColor: "white",
                arrowColor: colors.primary,
                disabledArrowColor: colors.muted,
                monthTextColor: colors.foreground,
                indicatorColor: colors.primary,
                textDayFontFamily: "System",
                textMonthFontFamily: "System",
                textDayHeaderFontFamily: "System",
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12,
              }}
            />
          </View>

          {/* 선택된 날짜 정보 */}
          <View className="bg-primary/10 rounded-lg p-4">
            <Text className="text-sm font-semibold text-foreground mb-1">
              선택된 날짜
            </Text>
            <Text className="text-base font-bold text-foreground mb-2">
              {selectedDateInfo.dateLabel}
            </Text>
            <View
              className="px-3 py-1 rounded-full w-fit"
              style={{ backgroundColor: selectedDateInfo.dateTypeColor + "20" }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: selectedDateInfo.dateTypeColor }}
              >
                {selectedDateInfo.dateType}
              </Text>
            </View>
          </View>

          {/* 선택된 날짜의 식품 목록 */}
          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">
                이 날짜의 식품 ({selectedDateFoods.length}개)
              </Text>
            </View>

            {selectedDateFoods.length > 0 ? (
              <View>
                {selectedDateFoods.map((item: any) => (
                  <FoodItemCard key={item.id} item={item} />
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-lg p-6 border border-border items-center justify-center">
                <MaterialIcons name="event-note" size={48} color={colors.muted} />
                <Text className="text-center text-muted mt-2">
                  이 날짜에 만료되는 식품이 없습니다
                </Text>
              </View>
            )}
          </View>

          {/* 범례 */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground mb-2">범례</Text>
            <View className="gap-3">
              <View className="gap-2">
                <Text className="text-xs font-semibold text-foreground">식품 상태</Text>
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.success }}
                    />
                    <Text className="text-sm text-foreground">정상 (4일 이상)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.warning }}
                    />
                    <Text className="text-sm text-foreground">임박 (1-3일)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.error }}
                    />
                    <Text className="text-sm text-foreground">만료됨 (0일 이하)</Text>
                  </View>
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-xs font-semibold text-foreground">달력 표시</Text>
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="circle" size={12} color={colors.error} />
                    <Text className="text-sm text-foreground">공휴일 / 주말</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="circle" size={12} color={colors.primary} />
                    <Text className="text-sm text-foreground">식품 만료일</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
