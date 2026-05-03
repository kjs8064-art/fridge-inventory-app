import { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import { getInterstitialAdId } from "@/lib/google-mobile-ads-config";

let interstitialAd: InterstitialAd | null = null;
let isLoading = false;

/**
 * 전면 광고 로드
 */
export async function loadInterstitialAd(): Promise<void> {
  if (isLoading || interstitialAd?.loaded) {
    return;
  }

  try {
    isLoading = true;
    const adId = getInterstitialAdId();

    if (!adId) {
      console.warn("전면 광고 ID가 설정되지 않았습니다.");
      isLoading = false;
      return;
    }

    interstitialAd = InterstitialAd.createForAdRequest(adId, {
      keywords: ["냉장고", "식품", "유통기한", "관리"],
    });

    // 광고 로드 완료 리스너
    const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log("전면 광고 로드 완료");
      isLoading = false;
    });

    // 광고 로드 실패 리스너
    const unsubscribeFailed = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn("전면 광고 로드 실패:", error);
      isLoading = false;
    });

    // 광고 닫힘 리스너
    const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log("전면 광고 닫힘");
      interstitialAd = null;
      // 다음 광고를 미리 로드
      loadInterstitialAd();
    });

    await interstitialAd.load();
  } catch (error) {
    console.error("전면 광고 로드 중 오류:", error);
    isLoading = false;
  }
}

/**
 * 전면 광고 표시
 */
export async function showInterstitialAd(): Promise<void> {
  try {
    if (!interstitialAd?.loaded) {
      console.warn("전면 광고가 로드되지 않았습니다.");
      return;
    }

    await interstitialAd.show();
  } catch (error) {
    console.error("전면 광고 표시 중 오류:", error);
  }
}

/**
 * 전면 광고 로드 상태 확인
 */
export function isInterstitialAdLoaded(): boolean {
  return interstitialAd?.loaded ?? false;
}

/**
 * 전면 광고 정리
 */
export function cleanupInterstitialAd(): void {
  interstitialAd = null;
  isLoading = false;
}
