# SnapStock: 사진 한 장, 재고 완성 - TODO 리스트

## 완료된 작업
- [x] Phase 1: 기본 구조 및 홈 화면
- [x] Phase 2: 카메라 및 이미지 처리
- [x] Phase 3: AI 이미지 인식 기능
- [x] Phase 4: 로그인 제거 및 익명 사용자 지원
- [x] Phase 5: 한글 UI, AI 인식 개선, 영수증 기능, 데이터베이스 마이그레이션

## Phase 6: SnapStock 브랜딩 및 UI/UX 완전 재설계
- [ ] 앱 이름 변경 (FreshTrack → SnapStock)
- [ ] 슬로건 변경 ("사진 한 장, 재고 완성")
- [ ] 앱 로고 디자인 (카메라 + 냉장고 아이콘)
- [ ] 색상 팔레트 변경 (더 세련되고 현대적)
  - Primary: 프리미엄 블루 또는 딥 그린
  - Secondary: 밝은 악센트 색상
  - Background: 클린한 화이트/라이트 그레이
- [ ] 홈 화면 UI 개선
  - 카메라 버튼을 더 눈에 띄게 (큰 플로팅 버튼)
  - 식품 목록 카드 디자인 개선
  - 빈 상태 UI 개선
- [ ] 온보딩 화면 추가 ("사진 찍기만 해도 끝!")
- [ ] 단추 및 인터랙션 개선 (더 부드러운 애니메이션)

## Phase 7: 유통기한 알림 및 대시보드
- [ ] 유통기한 알림 시스템 구현 (expo-notifications)
- [ ] 만료 3일 전 알림 설정
- [ ] 대시보드 화면 구현
- [ ] 만료 예정 식품 수 표시
- [ ] 카테고리별 통계

## Phase 8: 최종 점검 및 배포
- [ ] 모든 기능 테스트
- [ ] 성능 최적화
- [ ] 최종 QR 코드 생성
- [ ] 배포 준비

## Phase 6-1: AI 이미지 인식 버그 수정
- [x] ImagePicker base64 옵션 활성화 (camera.tsx)
- [x] Base64 직접 사용 감지 (recognition-result.tsx)
- [x] 웹 환경 blob URL 처리 (recognition-result.tsx)
- [x] 영수증 인식 Platform 감지 개선 (receipt-result.tsx)
- [x] MIME 타입 동적 처리 (web blob 타입 사용)

## Phase 7: AdMob 광고 통합
- [x] 구글 AdMob 정책 및 지침 보고서 작성
- [x] expo-ads-admob 패키지 설치
- [x] AdMob 설정 파일 생성 (admob-config.ts)
- [x] 배너 광고 컴포넌트 구현 (admob-banner.tsx)
- [x] 전면 광고 관리 모듈 구현 (admob-interstitial.ts)
- [x] 홈 화면에 배너 광고 추가
- [ ] 카메라 화면에 전면 광고 추가 (선택적)
- [ ] 영수증 인식 화면에 전면 광고 추가 (선택적)
- [ ] AdMob 계정 설정 및 실제 광고 ID 발급
- [ ] 테스트 모드에서 광고 표시 검증
- [ ] 실제 광고 ID로 변경 및 배포 준비


## Phase 8: AI 이미지 인식 오류 수정 및 영어 유통기한 인식
- [x] "Invalid time value" 오류 원인 분석
- [x] 날짜 형식 변환 유틸리티 생성 (date-utils.ts)
- [x] 다국어 날짜 형식 지원 (한국어, 영어, 유럽식 등)
- [x] AI 프롬프트 개선 - 영어 유통기한 인식
- [x] 영수증 인식 프롬프트 개선 - 다국어 지원
- [x] 날짜 변환 테스트 작성 및 통과 (27/27)


## Phase 9: 상세 페이지 React 에러 수정 및 수정 기능 구현
- [x] Date 객체 렌더링 에러 원인 분석
- [x] db.ts에 Date 정규화 함수 추가 (normalizeFoodItem, normalizeFoodItems)
- [x] 상세 페이지 완전 재작성 - 수정/삭제 기능 추가
- [x] 뷰 모드와 수정 모드 토글 기능
- [x] 날짜 입력 필드 개선 (YYYY-MM-DD 형식)
- [x] 삭제 기능 구현 (확인 다이얼로그)


## Phase 10: AdMob 배너 에러 수정
- [x] admob-banner.tsx에 ADMOB_BANNER_AD_ID 체크 추가
- [x] 광고 ID가 없을 때 null 반환하도록 수정
- [x] 개발 서버 재시작

## Phase 11: AdMobBanner 임시 제거 및 안정성 개선
- [x] 홈 화면에서 AdMobBanner import 주석 처리
- [x] 홈 화면에서 AdMobBanner 사용 주석 처리
- [x] 앱 정상 작동 확인
- [ ] AdMob 계정 설정 후 다시 활성화 (향후 작업)


## Phase 12: 홈 화면 기능 복구
- [x] 수량 조절 버튼 복구 (- / + 버튼)
- [x] 디데이 표시 복구 (N일 남음)
- [x] 제품 클릭 → 상세 페이지 네비게이션 복구
- [x] 상세 페이지에서 수정 기능 확인


## Phase 13: 유통기한 알림 시스템
- [x] expo-notifications 설정 및 권한 요청
- [x] 백그라운드 작업 스케줄링 (TaskManager)
- [x] 알림 트리거 로직 구현 (만료 3일 전)
- [x] 알림 테스트

## Phase 14: 대시보드 화면
- [x] 대시보드 라우트 생성
- [x] 통계 카드 구현 (만료 예정, 임박, 정상)
- [x] 차트 시각화 (카테고리별)
- [x] 탭 네비게이션에 대시보드 추가

## Phase 15: 검색 및 필터링
- [x] 검색 입력 필드 추가
- [x] 제품명 검색 로직
- [x] 카테고리별 필터링 개선
- [x] 검색 결과 표시

## Phase 16: 다크모드/화이트모드
- [x] 테마 토글 버튼 추가
- [x] 테마 저장 (AsyncStorage)
- [x] 테마 적용 확인


## Phase 17: 캘린더 화면 구현
- [x] react-native-calendars 패키지 설치
- [x] 캘린더 화면 생성 (calendar.tsx)
- [x] 유통기한별 마킹 (정상/임박/만료)
- [x] 선택된 날짜의 식품 목록 표시
- [x] 캘린더에서 식품 수정/삭제 기능
- [x] 범례 표시
- [x] 탭 네비게이션에 캘린더 추가


## Phase 18: 설정 탭 위치 이동 및 캘린더 한글화
- [x] 탭 네비게이션 순서 변경 (설정을 마지막으로 이동)
- [x] 한국 공휴일 데이터 생성 (korean-holidays.ts)
- [x] 캘린더 한글화 (월 표시, 요일 표시)
- [x] 공휴일 및 주말 표시 기능
- [x] 선택된 날짜 정보 표시 (공휴일/주말 여부)
- [x] 범례 업데이트 (공휴일/주말 표시 추가)


## Phase 19: AdMob 빌드 오류 해결
- [ ] expo-ads-admob 패키지 제거
- [ ] react-native-google-mobile-ads 패키지 설치
- [ ] Google Mobile Ads 초기화 및 설정
- [ ] 배너 광고 구현 (react-native-google-mobile-ads)
- [ ] 전면 광고 구현 (react-native-google-mobile-ads)
- [ ] 빌드 테스트


## Phase 19: AdMob 빌드 오류 해결
- [x] expo-ads-admob 패키지 제거
- [x] react-native-google-mobile-ads 패키지 설치
- [x] Google Mobile Ads 초기화 및 설정 (google-mobile-ads-config.ts)
- [x] 배너 광고 컴포넌트 구현 (google-banner-ad.tsx)
- [x] 전면 광고 관리 유틸리티 구현 (google-interstitial-ad.ts)
- [x] 테스트 작성 및 통과 (8/8 테스트 통과)


## Phase 20: 영수증 인식 기능 임시 보류
- [x] 카메라 화면에서 영수증 촬영 버튼 숨김 (주석 처리)
- [ ] 영수증 인식 기능 완성 (향후 작업)
