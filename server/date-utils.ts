/**
 * 날짜 형식 변환 유틸리티
 * 
 * 다양한 날짜 형식을 YYYY-MM-DD로 정규화합니다.
 * 한국어, 영어 등 여러 언어의 날짜 형식을 지원합니다.
 */

/**
 * 다양한 날짜 형식을 YYYY-MM-DD로 변환
 * 
 * 지원하는 형식:
 * - YYYY-MM-DD (ISO 형식)
 * - YYYY/MM/DD
 * - YYYY.MM.DD
 * - DD-MM-YYYY
 * - DD/MM/YYYY
 * - DD.MM.YYYY
 * - MM-DD-YYYY
 * - MM/DD/YYYY
 * - MM.DD.YYYY
 * - January 1, 2025 (영어 월 이름)
 * - 1월 1일 2025 (한국어 월 이름)
 * - 2025-01-01T00:00:00Z (ISO 8601)
 * - 2025-01-01T00:00:00+09:00 (ISO 8601 with timezone)
 */
export function normalizeDateFormat(dateString: string): string {
  if (!dateString || typeof dateString !== "string") {
    return "";
  }

  const trimmed = dateString.trim();

  // 1. ISO 8601 형식 처리 (2025-01-01T00:00:00Z 또는 2025-01-01T00:00:00+09:00)
  if (trimmed.includes("T")) {
    try {
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    } catch (e) {
      // 계속 진행
    }
  }

  // 2. 이미 YYYY-MM-DD 형식인 경우
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // 3. YYYY/MM/DD 또는 YYYY.MM.DD 형식
  const isoMatch = trimmed.match(/^(\d{4})[\/\.](\d{1,2})[\/\.](\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // 4. 영어 월 이름 처리 (January 1, 2025 또는 Jan 1, 2025)
  const englishMonthMatch = trimmed.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})$/i
  );
  if (englishMonthMatch) {
    const monthNames: { [key: string]: number } = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
      jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    };
    const [, monthStr, day, year] = englishMonthMatch;
    const month = monthNames[monthStr.toLowerCase()];
    if (month) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  // 5. DD-MM-YYYY 또는 DD/MM/YYYY 또는 DD.MM.YYYY 형식 (유럽식)
  const europeanMatch = trimmed.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
  if (europeanMatch) {
    const [, day, month, year] = europeanMatch;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    // 일이 13 이상이면 무조건 유럽식 (DD-MM-YYYY)
    if (dayNum > 12) {
      return `${year}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    }
    // 일과 월이 모두 1-12 범위면, 기본적으로 유럽식으로 판단 (한국/유럽 표준)
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
      return `${year}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    }
  }

  // 7. 한국어 형식 처리 (2025년 1월 1일, 2025 년 1 월 1 일 등)
  const koreanMatch = trimmed.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일$/);
  if (koreanMatch) {
    const [, year, month, day] = koreanMatch;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // 8. 간단한 한국어 형식 (1월 1일 2025)
  const simpleKoreanMatch = trimmed.match(/^(\d{1,2})월\s*(\d{1,2})일\s*(\d{4})$/);
  if (simpleKoreanMatch) {
    const [, month, day, year] = simpleKoreanMatch;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // 9. 숫자만 있는 경우 (예: 20250101)
  const numericMatch = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (numericMatch) {
    const [, year, month, day] = numericMatch;
    return `${year}-${month}-${day}`;
  }

  // 10. 마지막 시도: JavaScript Date 객체로 파싱 (UTC 기준)
  try {
    // 타임존 정보가 있으면 그대로 파싱, 없으면 UTC로 취급
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      // UTC 기준으로 YYYY-MM-DD 추출
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // 계속 진행
  }

  // 파싱 실패
  console.warn("[DateUtils] Could not parse date:", trimmed);
  return "";
}

/**
 * 날짜 문자열이 유효한지 확인
 */
export function isValidDate(dateString: string): boolean {
  const normalized = normalizeDateFormat(dateString);
  if (!normalized) return false;

  const [year, month, day] = normalized.split("-").map(Number);
  
  // 기본 범위 검증
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // 월별 일 수 검증
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // 윤년 계산
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth[1] = 29;
  }

  return day <= daysInMonth[month - 1];
}

/**
 * 유통기한을 정규화하고 검증
 * 유효하지 않으면 기본값(현재 + 7일) 반환
 */
export function normalizeExpirationDate(dateString: string, defaultDaysOffset: number = 7): string {
  const normalized = normalizeDateFormat(dateString);

  if (normalized && isValidDate(normalized)) {
    return normalized;
  }

  // 기본값: 현재 + defaultDaysOffset일
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + defaultDaysOffset);
  return defaultDate.toISOString().split("T")[0];
}
