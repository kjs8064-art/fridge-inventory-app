import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function RecognitionResultScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  
  const [productName, setProductName] = useState("");
  const [expirationDate, setExpirationDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const createMutation = trpc.foodItems.create.useMutation({
    onSuccess: () => {
      router.push("/camera");
    },
    onError: (error) => {
      console.error("Failed to create food item:", error);
      alert("식품 추가에 실패했습니다.");
    },
  });

  // AI 이미지 인식 (플레이스홀더)
  useEffect(() => {
    if (imageUri) {
      recognizeImage();
    }
  }, [imageUri]);

  const recognizeImage = async () => {
    setIsRecognizing(true);
    try {
      // TODO: Implement actual AI recognition using LLM
      // For now, use placeholder values
      setTimeout(() => {
        setProductName("우유");
        setExpirationDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
        setCategory("유제품");
        setQuantity("1L");
        setIsRecognizing(false);
      }, 1500);
    } catch (error) {
      console.error("Recognition error:", error);
      setIsRecognizing(false);
    }
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      alert("제품명을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      await createMutation.mutateAsync({
        productName: productName.trim(),
        expirationDate,
        imageUrl: imageUri,
        category: category.trim() || undefined,
        quantity: quantity.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-primary px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.push("/camera")}>
            <MaterialIcons name="arrow-back" size={24} color={colors.background} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-background">AI 인식 결과</Text>
          <View className="w-6" />
        </View>

        {/* Image Preview */}
        <View className="h-48 bg-surface m-4 rounded-lg items-center justify-center border border-border overflow-hidden">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          ) : (
            <>
              <MaterialIcons name="image" size={48} color={colors.muted} />
              <Text className="text-sm text-muted mt-2">사진 미리보기</Text>
            </>
          )}
        </View>

        {/* Recognition Status */}
        {isRecognizing && (
          <View className="mx-4 mb-4 p-4 bg-primary/20 rounded-lg items-center">
            <ActivityIndicator color={colors.primary} />
            <Text className="text-sm text-primary font-semibold mt-2">
              AI가 이미지를 분석 중입니다...
            </Text>
          </View>
        )}

        {/* Form */}
        <View className="px-6 pb-6 gap-4">
          {/* Product Name */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">제품명 *</Text>
            <TextInput
              value={productName}
              onChangeText={setProductName}
              placeholder="제품명을 입력해주세요"
              placeholderTextColor={colors.muted}
              className="border border-border rounded-lg px-4 py-3 text-foreground"
              style={{ color: colors.foreground }}
              editable={!isRecognizing}
            />
            <Text className="text-xs text-muted mt-1">
              {isRecognizing ? "AI가 인식 중입니다..." : "AI가 인식한 제품명입니다. 수정 가능합니다."}
            </Text>
          </View>

          {/* Expiration Date */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">유통기한 *</Text>
            <TextInput
              value={expirationDate}
              onChangeText={setExpirationDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              className="border border-border rounded-lg px-4 py-3 text-foreground"
              style={{ color: colors.foreground }}
              editable={!isRecognizing}
            />
            <Text className="text-xs text-muted mt-1">
              {isRecognizing ? "AI가 인식 중입니다..." : "AI가 인식한 유통기한입니다. 수정 가능합니다."}
            </Text>
          </View>

          {/* Category */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">분류</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="예: 채소, 육류, 유제품"
              placeholderTextColor={colors.muted}
              className="border border-border rounded-lg px-4 py-3 text-foreground"
              style={{ color: colors.foreground }}
              editable={!isRecognizing}
            />
          </View>

          {/* Quantity */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">수량</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="예: 500g, 1 bottle"
              placeholderTextColor={colors.muted}
              className="border border-border rounded-lg px-4 py-3 text-foreground"
              style={{ color: colors.foreground }}
              editable={!isRecognizing}
            />
          </View>

          {/* Notes */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">메모</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="추가 정보를 입력해주세요"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              className="border border-border rounded-lg px-4 py-3 text-foreground"
              style={{ color: colors.foreground }}
              editable={!isRecognizing}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving || createMutation.isPending || isRecognizing}
            className="bg-primary px-6 py-4 rounded-lg items-center justify-center mt-4"
          >
            {isSaving || createMutation.isPending ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-semibold">저장</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => router.push("/camera")}
            className="px-6 py-3 rounded-lg items-center justify-center border border-border"
          >
            <Text className="text-foreground font-semibold">취소</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
