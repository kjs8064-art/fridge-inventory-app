import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert, FlatList, TextInput, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";

interface ReceiptProduct {
  productName: string;
  quantity: string;
  price: string;
  selected?: boolean;
  expirationDate?: string;
}

export default function ReceiptResultScreen() {
  const colors = useColors();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  
  const [products, setProducts] = useState<ReceiptProduct[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const recognizeReceiptMutation = trpc.recognition.recognizeReceipt.useMutation({
    onSuccess: (data) => {
      console.log("[Client] Receipt recognition success:", data);
      const productsWithDefaults = data.products.map((p: any) => ({
        ...p,
        selected: true,
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }));
      setProducts(productsWithDefaults);
      setRecognitionError(null);
      setIsRecognizing(false);
    },
    onError: (error) => {
      console.error("Receipt recognition error:", error);
      setRecognitionError("영수증 분석 실패: " + error.message);
      setIsRecognizing(false);
      Alert.alert("인식 실패", "영수증을 분석할 수 없습니다. 다시 시도해주세요.");
    },
  });

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

  // AI 영수증 인식
  useEffect(() => {
    if (imageUri) {
      recognizeReceipt();
    }
  }, [imageUri]);

  const recognizeReceipt = async () => {
    setIsRecognizing(true);
    setRecognitionError(null);
    try {
      console.log("[Client] Starting receipt recognition for:", imageUri);
      console.log("[Client] Platform:", Platform.OS);
      
      if (!imageUri) {
        throw new Error("이미지 URI가 없습니다");
      }

      let base64: string;
      let mimeType: string = "image/jpeg";

      if (typeof imageUri === "string" && imageUri.length > 100 && !imageUri.includes("/")) {
        console.log("[Client] Using base64 directly from ImagePicker");
        base64 = imageUri;
      } else if (Platform.OS === "web" || imageUri.startsWith("blob:") || imageUri.startsWith("data:")) {
        console.log("[Client] Web environment detected, using fetch");
        
        if (imageUri.startsWith("data:")) {
          base64 = imageUri.split(",")[1] || "";
        } else {
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

      await recognizeReceiptMutation.mutateAsync({
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

  const handleToggleProduct = (index: number) => {
    const updated = [...products];
    updated[index].selected = !updated[index].selected;
    setProducts(updated);
  };

  const handleUpdateExpirationDate = (index: number, date: string) => {
    const updated = [...products];
    updated[index].expirationDate = date;
    setProducts(updated);
  };

  const handleSaveAll = async () => {
    const selectedProducts = products.filter(p => p.selected);
    
    if (selectedProducts.length === 0) {
      Alert.alert("선택 필요", "최소 하나 이상의 제품을 선택해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      for (const product of selectedProducts) {
        await createMutation.mutateAsync({
          productName: product.productName.trim(),
          expirationDate: product.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          quantity: product.quantity.trim() || undefined,
          notes: product.price ? `가격: ${product.price}` : undefined,
          category: "기타",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setProducts([]);
    setRecognitionError(null);
    recognizeReceipt();
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-primary px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.push("/camera")}>
            <MaterialIcons name="arrow-back" size={24} color={colors.background} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-background">영수증 분석</Text>
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
              <MaterialIcons name="receipt" size={48} color={colors.muted} />
              <Text className="text-sm text-muted mt-2">영수증 미리보기</Text>
            </>
          )}
        </View>

        {/* Recognition Status */}
        {isRecognizing && (
          <View className="mx-4 mb-4 p-4 bg-primary/20 rounded-lg items-center">
            <ActivityIndicator color={colors.primary} />
            <Text className="text-sm text-primary font-semibold mt-2">
              영수증을 분석 중입니다...
            </Text>
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

        {/* Products List */}
        {products.length > 0 && (
          <View className="px-6 pb-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">
                인식된 제품 ({products.filter(p => p.selected).length}/{products.length})
              </Text>
            </View>

            {products.map((product, index) => (
              <View
                key={index}
                className="bg-surface rounded-lg p-4 border border-border"
              >
                <View className="flex-row items-start gap-3 mb-3">
                  <TouchableOpacity
                    onPress={() => handleToggleProduct(index)}
                    className={`w-6 h-6 rounded border-2 items-center justify-center mt-1 ${
                      product.selected
                        ? "bg-primary border-primary"
                        : "border-border"
                    }`}
                  >
                    {product.selected && (
                      <MaterialIcons name="check" size={16} color={colors.background} />
                    )}
                  </TouchableOpacity>
                  
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {product.productName}
                    </Text>
                    {product.quantity && (
                      <Text className="text-sm text-muted mt-1">
                        수량: {product.quantity}
                      </Text>
                    )}
                    {product.price && (
                      <Text className="text-sm text-muted">
                        가격: {product.price}
                      </Text>
                    )}
                  </View>
                </View>

                {product.selected && (
                  <View className="border-t border-border pt-3">
                    <Text className="text-xs font-semibold text-muted mb-2">
                      유통기한 설정
                    </Text>
                    <TextInput
                      value={product.expirationDate}
                      onChangeText={(date: string) => handleUpdateExpirationDate(index, date)}
                      placeholder="YYYY-MM-DD"
                      className="border border-border rounded px-3 py-2 text-foreground"
                      style={{ color: colors.foreground }}
                    />
                  </View>
                )}
              </View>
            ))}

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveAll}
              disabled={isSaving || createMutation.isPending || products.filter(p => p.selected).length === 0}
              className="bg-primary px-6 py-4 rounded-lg items-center justify-center mt-4"
            >
              {isSaving || createMutation.isPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-semibold">
                  {products.filter(p => p.selected).length}개 저장
                </Text>
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
        )}

        {/* Empty State */}
        {!isRecognizing && products.length === 0 && !recognitionError && (
          <View className="flex-1 items-center justify-center px-6 pb-6">
            <MaterialIcons name="inbox" size={64} color={colors.muted} />
            <Text className="text-lg font-semibold text-foreground mt-4 text-center">
              인식된 제품이 없습니다
            </Text>
            <Text className="text-sm text-muted mt-2 text-center">
              영수증을 명확하게 촬영해주세요
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
