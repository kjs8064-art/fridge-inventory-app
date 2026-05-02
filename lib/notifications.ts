import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 백그라운드 작업 이름
const EXPIRATION_CHECK_TASK = "EXPIRATION_CHECK_TASK";

/**
 * 알림 시스템 초기화
 */
export async function initializeNotifications() {
  try {
    // 알림 핸들러 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // 권한 요청
    const { status } = await Notifications.requestPermissionsAsync();
    console.log("[Notifications] Permission status:", status);

    return status === "granted";
  } catch (error) {
    console.error("[Notifications] Initialization error:", error);
    return false;
  }
}

/**
 * 만료 3일 전 알림 스케줄링
 */
export async function scheduleExpirationNotifications(foodItems: any[]) {
  try {
    // 기존 알림 취소
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 각 식품에 대해 알림 스케줄
    for (const item of foodItems) {
      const expDate = new Date(item.expirationDate);
      const expDateOnly = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
      const daysUntilExpiration = Math.ceil((expDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // 만료 3일 전 알림 (1회만)
      if (daysUntilExpiration === 3) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "유통기한 알림",
            body: `${item.productName}이(가) 3일 후 만료됩니다`,
            data: { itemId: item.id, productName: item.productName },
          },
          trigger: {
            type: "timeInterval" as any,
            seconds: 1,
          },
        });
        console.log(`[Notifications] Scheduled for ${item.productName}`);
      }

      // 만료 1일 전 알림
      if (daysUntilExpiration === 1) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "긴급! 유통기한 알림",
            body: `${item.productName}이(가) 내일 만료됩니다!`,
            data: { itemId: item.id, productName: item.productName },
          },
          trigger: {
            type: "timeInterval" as any,
            seconds: 1,
          },
        });
      }

      // 만료됨 알림
      if (daysUntilExpiration === 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "만료됨!",
            body: `${item.productName}이(가) 오늘 만료됩니다!`,
            data: { itemId: item.id, productName: item.productName },
          },
          trigger: {
            type: "timeInterval" as any,
            seconds: 1,
          },
        });
      }
    }

    console.log("[Notifications] Scheduled all notifications");
  } catch (error) {
    console.error("[Notifications] Scheduling error:", error);
  }
}

/**
 * 백그라운드 작업 등록 (매일 자정에 실행)
 */
export async function registerBackgroundTask(checkFunction: () => Promise<void>) {
  try {
    // 기존 작업 등록 해제
    await TaskManager.unregisterTaskAsync(EXPIRATION_CHECK_TASK).catch(() => {});

    // 새 작업 등록
    TaskManager.defineTask(EXPIRATION_CHECK_TASK, async () => {
      try {
        console.log("[BackgroundTask] Running expiration check");
        await checkFunction();
        return "NewData" as any;
      } catch (error) {
        console.error("[BackgroundTask] Error:", error);
        return "Failed" as any;
      }
    });

    console.log("[BackgroundTask] Registered");
  } catch (error) {
    console.error("[BackgroundTask] Registration error:", error);
  }
}

/**
 * 알림 권한 확인
 */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings.granted;
  } catch (error) {
    console.error("[Notifications] Permission check error:", error);
    return false;
  }
}

/**
 * 마지막 알림 확인 시간 저장
 */
export async function saveLastNotificationCheck() {
  try {
    const now = new Date().toISOString();
    await AsyncStorage.setItem("@last_notification_check", now);
  } catch (error) {
    console.error("[Notifications] Save check time error:", error);
  }
}

/**
 * 마지막 알림 확인 시간 조회
 */
export async function getLastNotificationCheck(): Promise<Date | null> {
  try {
    const time = await AsyncStorage.getItem("@last_notification_check");
    return time ? new Date(time) : null;
  } catch (error) {
    console.error("[Notifications] Get check time error:", error);
    return null;
  }
}
