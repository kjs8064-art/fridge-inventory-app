/**
 * AdMob Configuration
 * 
 * AdMob 광고 단위 ID 설정
 * 테스트 ID: Google에서 제공하는 테스트 광고 단위
 * 실제 ID: AdMob 계정에서 생성한 실제 광고 단위
 */

// 테스트 모드 여부 (개발 중에는 true로 설정)
export const IS_ADMOB_TEST_MODE = true;

// AdMob 앱 ID (AdMob 계정에서 확인)
export const ADMOB_APP_ID = "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy";

// 배너 광고 단위 ID
export const ADMOB_BANNER_AD_ID = IS_ADMOB_TEST_MODE
  ? "ca-app-pub-3940256099942544/6300978111" // Google 테스트 배너 ID
  : "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"; // 실제 배너 ID

// 전면 광고 단위 ID
export const ADMOB_INTERSTITIAL_AD_ID = IS_ADMOB_TEST_MODE
  ? "ca-app-pub-3940256099942544/1033173712" // Google 테스트 전면 광고 ID
  : "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"; // 실제 전면 광고 ID

// 보상 광고 단위 ID
export const ADMOB_REWARDED_AD_ID = IS_ADMOB_TEST_MODE
  ? "ca-app-pub-3940256099942544/5224354917" // Google 테스트 보상 광고 ID
  : "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"; // 실제 보상 광고 ID

/**
 * Google 테스트 광고 단위
 * 
 * 배너: ca-app-pub-3940256099942544/6300978111
 * 전면: ca-app-pub-3940256099942544/1033173712
 * 보상: ca-app-pub-3940256099942544/5224354917
 * 
 * 주의: 실제 광고 ID로 테스트하면 AdMob 계정이 정지될 수 있습니다.
 */

export const ADMOB_CONFIG = {
  appId: ADMOB_APP_ID,
  bannerAdId: ADMOB_BANNER_AD_ID,
  interstitialAdId: ADMOB_INTERSTITIAL_AD_ID,
  rewardedAdId: ADMOB_REWARDED_AD_ID,
  testMode: IS_ADMOB_TEST_MODE,
};
