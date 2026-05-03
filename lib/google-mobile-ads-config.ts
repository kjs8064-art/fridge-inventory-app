import { Platform } from "react-native";

/**
 * Google Mobile Ads 설정
 * 테스트 모드에서는 Google 제공 테스트 ID를 사용합니다.
 * 프로덕션에서는 AdMob에서 발급받은 실제 광고 단위 ID를 사용하세요.
 */

// Google 테스트 광고 ID (개발/테스트용)
export const GOOGLE_TEST_IDS = {
  // 배너 광고
  BANNER_ANDROID: "ca-app-pub-3940256099942544/6300978111",
  BANNER_IOS: "ca-app-pub-3940256099942544/2934735716",

  // 전면 광고
  INTERSTITIAL_ANDROID: "ca-app-pub-3940256099942544/1033173712",
  INTERSTITIAL_IOS: "ca-app-pub-3940256099942544/4411468910",

  // 보상형 광고
  REWARDED_ANDROID: "ca-app-pub-3940256099942544/5224354917",
  REWARDED_IOS: "ca-app-pub-3940256099942544/1712485313",
};

// 실제 광고 단위 ID (프로덕션용)
// AdMob에서 앱을 등록하고 광고 단위를 생성한 후 여기에 입력하세요.
export const PRODUCTION_AD_IDS = {
  BANNER_ANDROID: "", // TODO: AdMob에서 발급받은 ID 입력
  BANNER_IOS: "", // TODO: AdMob에서 발급받은 ID 입력
  INTERSTITIAL_ANDROID: "", // TODO: AdMob에서 발급받은 ID 입력
  INTERSTITIAL_IOS: "", // TODO: AdMob에서 발급받은 ID 입력
  REWARDED_ANDROID: "", // TODO: AdMob에서 발급받은 ID 입력
  REWARDED_IOS: "", // TODO: AdMob에서 발급받은 ID 입력
};

// 개발 환경에서는 테스트 ID 사용, 프로덕션에서는 실제 ID 사용
const USE_TEST_IDS = true; // 개발 중에는 true로 설정, 배포 시 false로 변경

export const AD_IDS = USE_TEST_IDS ? GOOGLE_TEST_IDS : PRODUCTION_AD_IDS;

/**
 * 플랫폼에 따른 배너 광고 ID 반환
 */
export function getBannerAdId(): string {
  const id = Platform.OS === "ios" ? AD_IDS.BANNER_IOS : AD_IDS.BANNER_ANDROID;
  if (!id) {
    console.warn("배너 광고 ID가 설정되지 않았습니다.");
    return "";
  }
  return id;
}

/**
 * 플랫폼에 따른 전면 광고 ID 반환
 */
export function getInterstitialAdId(): string {
  const id = Platform.OS === "ios" ? AD_IDS.INTERSTITIAL_IOS : AD_IDS.INTERSTITIAL_ANDROID;
  if (!id) {
    console.warn("전면 광고 ID가 설정되지 않았습니다.");
    return "";
  }
  return id;
}

/**
 * 플랫폼에 따른 보상형 광고 ID 반환
 */
export function getRewardedAdId(): string {
  const id = Platform.OS === "ios" ? AD_IDS.REWARDED_IOS : AD_IDS.REWARDED_ANDROID;
  if (!id) {
    console.warn("보상형 광고 ID가 설정되지 않았습니다.");
    return "";
  }
  return id;
}
