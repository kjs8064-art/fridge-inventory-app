/** @type {const} */
const themeColors = {
  // Primary: Hot Pink (SnapStock 메인 색상)
  primary: { light: '#FF1493', dark: '#FF1493' },
  // Secondary: White (액션 버튼)
  secondary: { light: '#FFFFFF', dark: '#FFFFFF' },
  // Background: Black
  background: { light: '#FFFFFF', dark: '#000000' },
  // Surface (카드, 엘리먼트)
  surface: { light: '#F5F5F5', dark: '#1A1A1A' },
  // Text
  foreground: { light: '#000000', dark: '#FFFFFF' },
  muted: { light: '#666666', dark: '#AAAAAA' },
  // Border
  border: { light: '#E0E0E0', dark: '#333333' },
  // Status Colors
  success: { light: '#10B981', dark: '#34D399' },     // 정상 (7일 이상)
  warning: { light: '#F59E0B', dark: '#FBBF24' },     // 임박 (3-6일)
  error: { light: '#EF4444', dark: '#F87171' },       // 만료 (0일 이하)
};

module.exports = { themeColors };
