/**
 * 한국 공휴일 및 특일 데이터
 * 2024-2027년의 공휴일, 대체휴일, 기념일을 포함합니다.
 */

export interface Holiday {
  date: string; // YYYY-MM-DD 형식
  name: string;
  type: "holiday" | "memorial" | "substitute"; // 공휴일 / 기념일 / 대체휴일
}

export const KOREAN_HOLIDAYS: Holiday[] = [
  // 2024년
  { date: "2024-01-01", name: "신정", type: "holiday" },
  { date: "2024-02-09", name: "설날 연휴", type: "holiday" },
  { date: "2024-02-10", name: "설날", type: "holiday" },
  { date: "2024-02-11", name: "설날 연휴", type: "holiday" },
  { date: "2024-02-12", name: "설날 대체휴일", type: "substitute" },
  { date: "2024-03-01", name: "삼일절", type: "holiday" },
  { date: "2024-04-10", name: "국회의원선거일", type: "holiday" },
  { date: "2024-05-05", name: "어린이날", type: "holiday" },
  { date: "2024-05-06", name: "어린이날 대체휴일", type: "substitute" },
  { date: "2024-05-15", name: "부처님오신날", type: "holiday" },
  { date: "2024-06-06", name: "현충일", type: "holiday" },
  { date: "2024-08-15", name: "광복절", type: "holiday" },
  { date: "2024-09-16", name: "추석 연휴", type: "holiday" },
  { date: "2024-09-17", name: "추석", type: "holiday" },
  { date: "2024-09-18", name: "추석 연휴", type: "holiday" },
  { date: "2024-10-03", name: "개천절", type: "holiday" },
  { date: "2024-10-09", name: "한글날", type: "holiday" },
  { date: "2024-12-25", name: "크리스마스", type: "holiday" },

  // 2025년
  { date: "2025-01-01", name: "신정", type: "holiday" },
  { date: "2025-01-29", name: "설날 연휴", type: "holiday" },
  { date: "2025-01-30", name: "설날", type: "holiday" },
  { date: "2025-01-31", name: "설날 연휴", type: "holiday" },
  { date: "2025-03-01", name: "삼일절", type: "holiday" },
  { date: "2025-04-10", name: "국회의원선거일", type: "holiday" },
  { date: "2025-05-05", name: "어린이날", type: "holiday" },
  { date: "2025-05-06", name: "어린이날 대체휴일", type: "substitute" },
  { date: "2025-05-15", name: "부처님오신날", type: "holiday" },
  { date: "2025-06-06", name: "현충일", type: "holiday" },
  { date: "2025-08-15", name: "광복절", type: "holiday" },
  { date: "2025-09-06", name: "추석 연휴", type: "holiday" },
  { date: "2025-09-07", name: "추석", type: "holiday" },
  { date: "2025-09-08", name: "추석 연휴", type: "holiday" },
  { date: "2025-10-03", name: "개천절", type: "holiday" },
  { date: "2025-10-09", name: "한글날", type: "holiday" },
  { date: "2025-12-25", name: "크리스마스", type: "holiday" },

  // 2026년
  { date: "2026-01-01", name: "신정", type: "holiday" },
  { date: "2026-02-17", name: "설날 연휴", type: "holiday" },
  { date: "2026-02-18", name: "설날", type: "holiday" },
  { date: "2026-02-19", name: "설날 연휴", type: "holiday" },
  { date: "2026-03-01", name: "삼일절", type: "holiday" },
  { date: "2026-05-05", name: "어린이날", type: "holiday" },
  { date: "2026-05-06", name: "어린이날 대체휴일", type: "substitute" },
  { date: "2026-05-15", name: "부처님오신날", type: "holiday" },
  { date: "2026-06-06", name: "현충일", type: "holiday" },
  { date: "2026-08-15", name: "광복절", type: "holiday" },
  { date: "2026-09-25", name: "추석 연휴", type: "holiday" },
  { date: "2026-09-26", name: "추석", type: "holiday" },
  { date: "2026-09-27", name: "추석 연휴", type: "holiday" },
  { date: "2026-10-03", name: "개천절", type: "holiday" },
  { date: "2026-10-09", name: "한글날", type: "holiday" },
  { date: "2026-12-25", name: "크리스마스", type: "holiday" },

  // 2027년
  { date: "2027-01-01", name: "신정", type: "holiday" },
  { date: "2027-02-06", name: "설날 연휴", type: "holiday" },
  { date: "2027-02-07", name: "설날", type: "holiday" },
  { date: "2027-02-08", name: "설날 연휴", type: "holiday" },
  { date: "2027-03-01", name: "삼일절", type: "holiday" },
  { date: "2027-05-05", name: "어린이날", type: "holiday" },
  { date: "2027-05-15", name: "부처님오신날", type: "holiday" },
  { date: "2027-06-06", name: "현충일", type: "holiday" },
  { date: "2027-08-15", name: "광복절", type: "holiday" },
  { date: "2027-09-14", name: "추석 연휴", type: "holiday" },
  { date: "2027-09-15", name: "추석", type: "holiday" },
  { date: "2027-09-16", name: "추석 연휴", type: "holiday" },
  { date: "2027-10-03", name: "개천절", type: "holiday" },
  { date: "2027-10-09", name: "한글날", type: "holiday" },
  { date: "2027-12-25", name: "크리스마스", type: "holiday" },
];

/**
 * 주어진 날짜가 공휴일인지 확인
 */
export function isHoliday(dateString: string): Holiday | undefined {
  return KOREAN_HOLIDAYS.find((h) => h.date === dateString);
}

/**
 * 주어진 날짜가 주말인지 확인 (토요일 또는 일요일)
 */
export function isWeekend(dateString: string): boolean {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = 일요일, 6 = 토요일
}

/**
 * 주어진 날짜가 주중인지 확인
 */
export function isWeekday(dateString: string): boolean {
  return !isWeekend(dateString);
}
