import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";

export default function RecognitionResultScreen() {
  const colors = useColors();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  
  const [productName, setProductName] = useState("");
  const [expirationDate, setExpirationDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const createMutation = trpc.foodItems.create.useMutation({
    onSuccess: () => {
      Alert.alert("성공", "식품이 저장되었습니다.");
      router.push("/(tabs)");
    },
    onError: (error) => {
      console.error("Failed to create food item:", error);
      Alert.alert("오류", "식품 추가에 실패했습니다: " + error.message);
    },
  });

  const recognizeMutation = trpc.recognition.recognize.useMutation({
    onSuccess: (data) => {
      console.log("[Client] Recognition success:", data);
      
      const dataWithError = data as any;
      if (dataWithError.error) {
        console.error("[Client] Server error:", dataWithError.error);
        setRecognitionError(`서버 오류: ${dataWithError.error}`);
        setIsRecognizing(false);
        return;
      }
      
      setProductName(data.productName || "");
      setExpirationDate(data.expirationDate || new Date().toISOString().split("T")[0]);
      setCategory(data.category || "");
      setUploadedImageUrl(data.imageUrl || "");
      setRecognitionError(null);
      setDebugInfo(`신뢰도: ${(data.confidence * 100).toFixed(1)}% | 제품명: ${data.productName || "(인식 실패)"}`);
      setIsRecognizing(false);
    },
    onError: (error) => {
      console.error("Recognition error:", error);
      setRecognitionError("이미지 분석 실패: " + error.message);
      setIsRecognizing(false);
      Alert.alert("인식 실패", "이미지를 분석할 수 없습니다. 다시 시도해주세요.");
    },
  });

  // AI 이미지 인식
  useEffect(() => {
    if (imageUri) {
      recognizeImage();
    }
  }, [imageUri]);

  const recognizeImage = async () => {
    setIsRecognizing(true);
    setRecognitionError(null);
    setDebugInfo("이미지 분석 중...");
    try {
      console.log("[Client] Starting image recognition for:", imageUri);
      console.log("[Client] Platform:", Platform.OS);
      
      if (!imageUri) {
        throw new Error("이미지 URI가 없습니다");
      }

      // Check if imageUri is already base64 (from ImagePicker with base64: true)
      let base64: string;
      let mimeType: string = "image/jpeg";

      if (typeof imageUri === "string" && imageUri.length > 100 && !imageUri.includes("/")) {
        // This looks like base64 data
        console.log("[Client] Using base64 directly from ImagePicker");
        base64 = imageUri;
      } else if (Platform.OS === "web" || imageUri.startsWith("blob:") || imageUri.startsWith("data:")) {
        // 웹 환경 처리 (blob URL 또는 data URL)
        console.log("[Client] Web environment detected, using fetch");
        
        if (imageUri.startsWith("data:")) {
          // 이미 data URL인 경우
          base64 = imageUri.split(",")[1] || "";
        } else {
          // blob URL인 경우
          const response = await fetch(imageUri);
          const blob = await response.blob();
          mimeType = blob.type || "image/jpeg";
          base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              resolve(result.split(",")[1] || result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } else {
        // 네이티브 환경 처리
        console.log("[Client] Native environment detected, using FileSystem");
        base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
      
      console.log("[Client] Image converted to base64, length:", base64.length);
      console.log("[Client] MIME type:", mimeType);

      if (!base64 || base64.length === 0) {
        throw new Error("Base64 변환 실패");
      }

      // 2. Call recognition API
      await recognizeMutation.mutateAsync({
        imageBase64: base64,
        mimeType: mimeType,
      });
    } catch (error) {
      console.error("Failed to read image:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setRecognitionError(`이미지를 읽을 수 없습니다: ${errorMsg}`);
      setIsRecognizing(false);
      Alert.alert("오류", `이미지를 읽을 수 없습니다: ${errorMsg}`);
    }
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert("입력 필요", "제품명을 입력해주세요.");
      return;
    }

    if (!expirationDate) {
      Alert.alert("입력 필요", "유통기한을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      console.log("[Client] Saving food item:", {
        productName,
        expirationDate,
        category,
        quantity,
        notes,
      });

      await createMutation.mutateAsync({
        productName: productName.trim(),
        expirationDate,
        imageUrl: uploadedImageUrl || imageUri,
        category: category.trim() || undefined,
        quantity: quantity.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setProductName("");
    setExpirationDate(new Date().toISOString().split("T")[0]);
    setCategory("");
    setQuantity("");
    setNotes("");
    setRecognitionError(null);
    setDebugInfo("");
    recognizeImage();
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
            <Text className="text-xs text-primary mt-1">{debugInfo}</Text>
          </View>
        )}

        {/* Recognition Error */}
        {recognitionError && (
          <View className="mx-4 mb-4 p-4 bg-error/20 rounded-lg">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="error" size={20} color={colors.error} />
              <Text className="text-sm text-error font-semibold flex-1">
                {recognitionError}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRetry}
              className="mt-3 bg-error px-4 py-2 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-sm">다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Debug Info */}
        {debugInfo && !isRecognizing && (
          <View className="mx-4 mb-4 p-3 bg-primary/10 rounded-lg border border-primary">
            <Text className="text-xs text-primary">{debugInfo}</Text>
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
              placeholder="예: 500g, 1개"
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
