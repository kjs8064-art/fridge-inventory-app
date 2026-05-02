import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

export default function CameraScreen() {
  const colors = useColors();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Request camera permission
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.granted) {
      setShowCamera(true);
    } else {
      Alert.alert("권한 필요", "카메라를 사용하려면 카메라 권한이 필요합니다.");
    }
  };

  // Take picture
  const handleCapture = async () => {
    setIsLoading(true);
    try {
      if (!cameraRef.current) {
        throw new Error("Camera not available");
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        exif: false,
        base64: false,
        skipProcessing: false,
      });

      // Save image URI to AsyncStorage for later use
      if (photo?.uri) {
        // Navigate to recognition result with image URI
        router.push({
          pathname: "/recognition-result",
          params: { imageUri: photo.uri },
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("오류", "사진 촬영에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pick from gallery
  const handleGallery = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        router.push({
          pathname: "/recognition-result",
          params: { imageUri: result.assets[0].uri },
        });
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("오류", "갤러리에서 이미지를 선택하지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Permission not yet requested
  if (!permission) {
    return (
      <ScreenContainer className="flex items-center justify-center gap-4 p-6">
        <MaterialIcons name="camera" size={48} color={colors.muted} />
        <Text className="text-lg font-semibold text-foreground text-center">
          카메라 권한 확인 중...
        </Text>
      </ScreenContainer>
    );
  }

  // Permission denied
  if (!permission.granted && !showCamera) {
    return (
      <ScreenContainer className="flex items-center justify-center gap-4 p-6">
        <MaterialIcons name="camera" size={48} color={colors.error} />
        <Text className="text-lg font-semibold text-foreground text-center">
          카메라 권한이 필요합니다
        </Text>
        <Text className="text-sm text-muted text-center">
          FreshTrack는 식품 사진을 촬영하기 위해 카메라 권한이 필요합니다.
        </Text>
        <TouchableOpacity
          className="mt-4 bg-primary px-8 py-3 rounded-full"
          onPress={handleRequestPermission}
        >
          <Text className="text-background font-semibold">권한 허용</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  // Camera view
  if (showCamera && permission.granted) {
    return (
      <View className="flex-1 bg-background">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
        >
          {/* Header */}
          <View className="absolute top-0 left-0 right-0 bg-black/50 px-4 py-4 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <MaterialIcons name="arrow-back" size={28} color={colors.background} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-background">사진 촬영</Text>
            <View className="w-7" />
          </View>

          {/* Bottom Controls */}
          <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-6 flex-row items-center justify-center gap-4">
            {/* Capture Button */}
            <TouchableOpacity
              onPress={handleCapture}
              disabled={isLoading}
              className="w-16 h-16 bg-primary rounded-full items-center justify-center"
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <MaterialIcons name="camera" size={32} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // Initial screen
  return (
    <ScreenContainer className="flex items-center justify-center gap-6 p-6">
      <MaterialIcons name="add-a-photo" size={64} color={colors.primary} />

      <Text className="text-2xl font-bold text-foreground text-center">
        식품 사진 촬영
      </Text>

      <Text className="text-base text-muted text-center">
        냉장고에 있는 식품의 사진을 촬영하거나 갤러리에서 선택해주세요.
      </Text>

      {/* Camera Button */}
      <TouchableOpacity
        onPress={handleRequestPermission}
        disabled={isLoading}
        className="w-full bg-primary px-6 py-4 rounded-lg items-center justify-center"
      >
        {isLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <>
            <MaterialIcons name="camera-alt" size={24} color={colors.background} />
            <Text className="text-background font-semibold mt-2">카메라로 촬영</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Gallery Button */}
      <TouchableOpacity
        onPress={handleGallery}
        disabled={isLoading}
        className="w-full bg-surface px-6 py-4 rounded-lg items-center justify-center border border-border"
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <MaterialIcons name="image" size={24} color={colors.primary} />
            <Text className="text-foreground font-semibold mt-2">갤러리에서 선택</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Receipt Button */}
      <TouchableOpacity
        onPress={() => {
          setIsLoading(true);
          ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
          }).then((result) => {
            setIsLoading(false);
            if (!result.canceled && result.assets[0]) {
              router.push({
                pathname: "/receipt-result",
                params: { imageUri: result.assets[0].uri },
              });
            }
          }).catch((error) => {
            setIsLoading(false);
            console.error("Receipt camera error:", error);
            Alert.alert("오류", "카메라를 열 수 없습니다.");
          });
        }}
        disabled={isLoading}
        className="w-full bg-surface px-6 py-4 rounded-lg items-center justify-center border border-border"
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <MaterialIcons name="receipt" size={24} color={colors.primary} />
            <Text className="text-foreground font-semibold mt-2">영수증 촬영</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-full px-6 py-3 rounded-lg items-center justify-center border border-border"
      >
        <Text className="text-foreground font-semibold">취소</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
