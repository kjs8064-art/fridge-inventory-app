/**
 * AdMob 전면 광고 관리
 * 
 * 전면 광고는 전체 화면을 차지하는 광고로, 사용자가 자연스럽게 기다리는 시점에 표시합니다.
 * 예: 게임 라운드 사이, 페이지 전환 시 등
 */

import { AdMobInterstitial } from "expo-ads-admob";
import { ADMOB_INTERSTITIAL_AD_ID } from "./admob-config";

/**
 * 전면 광고 상태
 */
export interface InterstitialAdState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * 전면 광고 관리자
 */
class InterstitialAdManager {
  private adUnitId: string;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private error: string | null = null;

  constructor(adUnitId: string) {
    this.adUnitId = adUnitId;
    this.setupListeners();
  }

  /**
   * 광고 리스너 설정
   */
  private setupListeners() {
    try {
      // addEventListener가 존재하는지 확인
      if (AdMobInterstitial && typeof (AdMobInterstitial as any).addEventListener === "function") {
        (AdMobInterstitial as any).addEventListener("interstitialDidLoad", () => {
          console.log("[AdMob] Interstitial ad loaded");
          this.isLoaded = true;
          this.isLoading = false;
          this.error = null;
        });

        (AdMobInterstitial as any).addEventListener("interstitialDidFailToLoad", (error: any) => {
          console.error("[AdMob] Interstitial ad failed to load:", error);
          this.isLoaded = false;
          this.isLoading = false;
          this.error = error?.message || "광고 로딩 실패";
        });

        (AdMobInterstitial as any).addEventListener("interstitialDidOpen", () => {
          console.log("[AdMob] Interstitial ad opened");
        });

        (AdMobInterstitial as any).addEventListener("interstitialDidClose", () => {
          console.log("[AdMob] Interstitial ad closed");
          // 광고 닫힌 후 다음 광고 로드
          this.requestAd();
        });
      } else {
        console.warn("[AdMob] addEventListener not available on AdMobInterstitial");
      }
    } catch (error) {
      console.error("[AdMob] Failed to setup interstitial listeners:", error);
    }
  }

  /**
   * 광고 요청
   */
  async requestAd() {
    if (this.isLoading) {
      console.log("[AdMob] Interstitial ad is already loading");
      return;
    }

    try {
      this.isLoading = true;
      this.error = null;
      console.log("[AdMob] Requesting interstitial ad...");
      await AdMobInterstitial.setAdUnitID(this.adUnitId);
      await AdMobInterstitial.requestAdAsync();
    } catch (error) {
      console.error("[AdMob] Failed to request interstitial ad:", error);
      this.error = error instanceof Error ? error.message : "광고 요청 실패";
      this.isLoading = false;
    }
  }

  /**
   * 광고 표시
   */
  async showAd() {
    if (!this.isLoaded) {
      console.warn("[AdMob] Interstitial ad is not loaded");
      return false;
    }

    try {
      console.log("[AdMob] Showing interstitial ad...");
      await AdMobInterstitial.showAdAsync();
      return true;
    } catch (error) {
      console.error("[AdMob] Failed to show interstitial ad:", error);
      return false;
    }
  }

  /**
   * 광고 준비 여부 확인
   */
  async isReady(): Promise<boolean> {
    try {
      return await AdMobInterstitial.getIsReadyAsync();
    } catch (error) {
      console.error("[AdMob] Failed to check if interstitial ad is ready:", error);
      return false;
    }
  }

  /**
   * 광고 상태 조회
   */
  getState(): InterstitialAdState {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      error: this.error,
    };
  }

  /**
   * 광고 로드 여부
   */
  isAdLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * 광고 로딩 여부
   */
  isAdLoading(): boolean {
    return this.isLoading;
  }

  /**
   * 광고 로드 오류
   */
  getError(): string | null {
    return this.error;
  }
}

// 전역 전면 광고 인스턴스
export const interstitialAdManager = new InterstitialAdManager(ADMOB_INTERSTITIAL_AD_ID);

/**
 * 전면 광고 표시 (편의 함수)
 * 
 * 사용 예:
 * ```tsx
 * import { showInterstitialAd } from "@/lib/admob-interstitial";
 * 
 * // 버튼 클릭 시 광고 표시
 * await showInterstitialAd();
 * ```
 */
export async function showInterstitialAd(): Promise<boolean> {
  return interstitialAdManager.showAd();
}

/**
 * 전면 광고 요청 (편의 함수)
 * 
 * 사용 예:
 * ```tsx
 * import { requestInterstitialAd } from "@/lib/admob-interstitial";
 * 
 * // 앱 시작 시 광고 미리 로드
 * await requestInterstitialAd();
 * ```
 */
export async function requestInterstitialAd(): Promise<void> {
  return interstitialAdManager.requestAd();
}

/**
 * 전면 광고 상태 조회 (편의 함수)
 */
export function getInterstitialAdState(): InterstitialAdState {
  return interstitialAdManager.getState();
}

/**
 * 전면 광고 준비 여부 확인 (편의 함수)
 */
export async function isInterstitialAdReady(): Promise<boolean> {
  return interstitialAdManager.isReady();
}
