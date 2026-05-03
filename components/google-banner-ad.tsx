import { View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { getBannerAdId } from "@/lib/google-mobile-ads-config";
import { useColors } from "@/hooks/use-colors";

/**
 * Google Mobile Ads 배너 광고 컴포넌트
 */
export function GoogleBannerAd() {
  const colors = useColors();
  const bannerAdId = getBannerAdId();

  if (!bannerAdId) {
    return null;
  }

  return (
    <View className="w-full items-center justify-center bg-surface border-t border-border py-2">
      <BannerAd
        unitId={bannerAdId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          keywords: ["냉장고", "식품", "유통기한", "관리"],
        }}
      />
    </View>
  );
}
