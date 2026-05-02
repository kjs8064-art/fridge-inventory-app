import React, { useState } from "react";
import { View, Text, Platform } from "react-native";
import { AdMobBanner as ExpoAdMobBanner } from "expo-ads-admob";
import { useColors } from "@/hooks/use-colors";
import { ADMOB_BANNER_AD_ID } from "@/lib/admob-config";

interface AdMobBannerProps {
  /**
   * 배너 광고 크기
   * @default "smartBannerPortrait"
   */
  size?: "banner" | "largeBanner" | "mediumRectangle" | "fullBanner" | "leaderboard" | "smartBannerPortrait" | "smartBannerLandscape";
  /**
   * 배너 광고 위치
   * @default "bottom"
   */
  position?: "top" | "bottom";
  /**
   * 광고 로딩 실패 시 표시 여부
   * @default false
   */
  showOnError?: boolean;
}

/**
 * AdMob 배너 광고 컴포넌트
 * 
 * 사용 예:
 * ```tsx
 * <AdMobBanner size="smartBannerPortrait" position="bottom" />
 * ```
 * 
 * 주의:
 * - 웹 환경에서는 광고가 표시되지 않습니다
 * - 테스트 모드에서는 Google 테스트 광고가 표시됩니다
 * - 실제 광고 ID로 테스트하면 AdMob 계정이 정지될 수 있습니다
 */
export function AdMobBanner({
  size = "smartBannerPortrait",
  position = "bottom",
  showOnError = false,
}: AdMobBannerProps) {
  const colors = useColors();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  // 웹 환경에서는 광고 표시 안 함
  if (Platform.OS === "web") {
    return null;
  }

  // AdMob ID가 없으면 표시하지 않음
  if (!ADMOB_BANNER_AD_ID) {
    console.warn("[AdMob] Banner ad ID not configured");
    return null;
  }

  return (
    <View
      className={`w-full items-center ${
        position === "top" ? "pt-2" : "pb-2"
      }`}
      style={{
        backgroundColor: colors.background,
        borderTopColor: position === "bottom" ? colors.border : "transparent",
        borderBottomColor: position === "top" ? colors.border : "transparent",
        borderTopWidth: position === "bottom" ? 0.5 : 0,
        borderBottomWidth: position === "top" ? 0.5 : 0,
      }}
    >
      {/* 광고 로딩 중 */}
      {!adLoaded && !adError && (
        <View className="h-12 w-full items-center justify-center">
          <Text className="text-xs text-muted">광고 로딩 중...</Text>
        </View>
      )}

      {/* 광고 오류 */}
      {adError && showOnError && (
        <View className="h-12 w-full items-center justify-center">
          <Text className="text-xs text-error">광고를 불러올 수 없습니다</Text>
        </View>
      )}

      {/* 배너 광고 */}
      {(adLoaded || !adError) && (
        <ExpoAdMobBanner
          bannerSize={size}
          adUnitID={ADMOB_BANNER_AD_ID}
          onAdViewDidReceiveAd={() => {
            console.log("[AdMob] Banner ad loaded");
            setAdLoaded(true);
            setAdError(null);
          }}
          onDidFailToReceiveAdWithError={(error: any) => {
            console.error("[AdMob] Banner ad failed to load:", error);
            setAdError(error?.message || "광고 로딩 실패");
            setAdLoaded(false);
          }}
          onAdViewWillPresentScreen={() => {
            console.log("[AdMob] Banner ad opened");
          }}
          onAdViewDidDismissScreen={() => {
            console.log("[AdMob] Banner ad closed");
          }}
          servePersonalizedAds={false}
        />
      )}
    </View>
  );
}

export default AdMobBanner;
