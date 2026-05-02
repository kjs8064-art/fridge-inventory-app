/** @type {const} */
const themeColors = {
  // Primary: Premium Blue (SnapStock 메인 색상)
  primary: { light: '#0066CC', dark: '#0066CC' },
  // Secondary: Bright Accent (액션 버튼)
  secondary: { light: '#FF6B6B', dark: '#FF8787' },
  // Background
  background: { light: '#FFFFFF', dark: '#0F1419' },
  // Surface (카드, 엘리먼트)
  surface: { light: '#F8FAFB', dark: '#1A1F2E' },
  // Text
  foreground: { light: '#0A0E27', dark: '#F5F7FA' },
  muted: { light: '#6B7280', dark: '#9CA3AF' },
  // Border
  border: { light: '#E5E7EB', dark: '#374151' },
  // Status Colors
  success: { light: '#10B981', dark: '#34D399' },     // 정상 (7일 이상)
  warning: { light: '#F59E0B', dark: '#FBBF24' },     // 임박 (3-6일)
  error: { light: '#EF4444', dark: '#F87171' },       // 만료 (0일 이하)
};

module.exports = { themeColors };
