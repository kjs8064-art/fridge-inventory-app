import { describe, it, expect, beforeEach, vi } from "vitest";
import { Platform } from "react-native";
import {
  getBannerAdId,
  getInterstitialAdId,
  getRewardedAdId,
  GOOGLE_TEST_IDS,
} from "./google-mobile-ads-config";

// Platform.OS를 mock
vi.mock("react-native", () => ({
  Platform: {
    OS: "android",
  },
}));

describe("Google Mobile Ads Config", () => {
  describe("getBannerAdId", () => {
    it("Android에서 배너 광고 ID 반환", () => {
      (Platform.OS as any) = "android";
      const id = getBannerAdId();
      expect(id).toBe(GOOGLE_TEST_IDS.BANNER_ANDROID);
    });

    it("iOS에서 배너 광고 ID 반환", () => {
      (Platform.OS as any) = "ios";
      const id = getBannerAdId();
      expect(id).toBe(GOOGLE_TEST_IDS.BANNER_IOS);
    });
  });

  describe("getInterstitialAdId", () => {
    it("Android에서 전면 광고 ID 반환", () => {
      (Platform.OS as any) = "android";
      const id = getInterstitialAdId();
      expect(id).toBe(GOOGLE_TEST_IDS.INTERSTITIAL_ANDROID);
    });

    it("iOS에서 전면 광고 ID 반환", () => {
      (Platform.OS as any) = "ios";
      const id = getInterstitialAdId();
      expect(id).toBe(GOOGLE_TEST_IDS.INTERSTITIAL_IOS);
    });
  });

  describe("getRewardedAdId", () => {
    it("Android에서 보상형 광고 ID 반환", () => {
      (Platform.OS as any) = "android";
      const id = getRewardedAdId();
      expect(id).toBe(GOOGLE_TEST_IDS.REWARDED_ANDROID);
    });

    it("iOS에서 보상형 광고 ID 반환", () => {
      (Platform.OS as any) = "ios";
      const id = getRewardedAdId();
      expect(id).toBe(GOOGLE_TEST_IDS.REWARDED_IOS);
    });
  });

  describe("테스트 ID 유효성", () => {
    it("모든 테스트 ID가 정의되어 있음", () => {
      expect(GOOGLE_TEST_IDS.BANNER_ANDROID).toBeTruthy();
      expect(GOOGLE_TEST_IDS.BANNER_IOS).toBeTruthy();
      expect(GOOGLE_TEST_IDS.INTERSTITIAL_ANDROID).toBeTruthy();
      expect(GOOGLE_TEST_IDS.INTERSTITIAL_IOS).toBeTruthy();
      expect(GOOGLE_TEST_IDS.REWARDED_ANDROID).toBeTruthy();
      expect(GOOGLE_TEST_IDS.REWARDED_IOS).toBeTruthy();
    });

    it("테스트 ID 형식이 올바름", () => {
      const testIdPattern = /^ca-app-pub-\d+\/\d+$/;
      expect(GOOGLE_TEST_IDS.BANNER_ANDROID).toMatch(testIdPattern);
      expect(GOOGLE_TEST_IDS.BANNER_IOS).toMatch(testIdPattern);
      expect(GOOGLE_TEST_IDS.INTERSTITIAL_ANDROID).toMatch(testIdPattern);
      expect(GOOGLE_TEST_IDS.INTERSTITIAL_IOS).toMatch(testIdPattern);
      expect(GOOGLE_TEST_IDS.REWARDED_ANDROID).toMatch(testIdPattern);
      expect(GOOGLE_TEST_IDS.REWARDED_IOS).toMatch(testIdPattern);
    });
  });
});
